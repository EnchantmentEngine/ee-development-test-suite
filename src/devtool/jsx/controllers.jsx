/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
	BUTTON_POLYFILL_INDEX_MAPPING,
	CONTROLLER_STRINGS,
	PRESS_AND_RELEASE_DURATION,
	TRIGGER_CONFIG,
} from '../js/constants';
import { EmulatorSettings, emulatorStates } from '../js/emulatorStates';
import {
	applyControllerAnalogValue,
	applyControllerButtonChanged,
	applyControllerButtonPressed,
	toggleControllerVisibility,
} from '../js/messenger';
import config from '@ir-engine/common/src/config';

const assetURL = config.client.fileServer + '/projects/enchantmentengine/ee-development-test-suite/src/devtool'

import { Joystick } from '../js/joystick';
import React from 'react';

function ControlButtonGroup({ isAnalog, deviceKey, buttonKey }) {
	const touchRef = React.useRef();
	const pressRef = React.useRef();
	const holdRef = React.useRef();
	const rangeRef = React.useRef();
	const deviceName = CONTROLLER_STRINGS[deviceKey].name;
	const buttonState = emulatorStates.controllers[deviceName][buttonKey];

	function onTouchToggle() {
		buttonState.touched = !buttonState.touched;
		buttonState.touched ||= buttonState.pressed;
		touchRef.current.classList.toggle('bg-blue-600', buttonState.touched);
		applyControllerButtonChanged(
			deviceKey,
			BUTTON_POLYFILL_INDEX_MAPPING[buttonKey],
			buttonState.pressed,
			buttonState.touched,
			buttonState.value,
		);
	}

	function onHoldToggle() {
		buttonState.pressed = !buttonState.pressed;
		buttonState.touched ||= buttonState.pressed;
		pressRef.current.disabled = buttonState.pressed;
		holdRef.current.classList.toggle('bg-blue-600', buttonState.pressed);
		applyControllerButtonPressed(
			deviceKey,
			BUTTON_POLYFILL_INDEX_MAPPING[buttonKey],
			buttonState.pressed,
		);
	}

	function onPressBinary() {
		if (buttonState.pressed) return;
		onHoldToggle();
		pressRef.current.disabled = true;
		holdRef.current.disabled = true;
		setTimeout(() => {
			onHoldToggle();
			pressRef.current.disabled = false;
			holdRef.current.disabled = false;
		}, PRESS_AND_RELEASE_DURATION);
	}

	function onRangeInput() {
		const inputValue = rangeRef.current.value / 100;
		applyControllerButtonChanged(
			deviceKey,
			BUTTON_POLYFILL_INDEX_MAPPING[buttonKey],
			inputValue != 0,
			buttonState.touched,
			inputValue,
		);
	}

	const onPressAnalog = createAnalogPressFunction(
		pressRef,
		rangeRef,
		onRangeInput,
	);

	React.useEffect(() => {
		const handedness = CONTROLLER_STRINGS[deviceKey].handedness;
		if (isAnalog) {
			rangeRef.current.value = 0;
			onRangeInput();
			if (!emulatorStates.sliders[handedness]) {
				emulatorStates.sliders[handedness] = {};
			}
			rangeRef.current.onInputFunc = onRangeInput;
			emulatorStates.sliders[handedness][buttonKey] = rangeRef.current;
		}
		if (!emulatorStates.buttons[handedness]) {
			emulatorStates.buttons[handedness] = {};
		}
		emulatorStates.buttons[handedness][buttonKey] = pressRef.current;
	});

	return (
		<div className="flex ml-1">
			<button
				className="h-8 rounded-md border-none px-1 py-1 m-0 text-sm bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors rounded-l-md mr-0.5"
				ref={touchRef}
				onClick={onTouchToggle}
			>
				<img src={assetURL + "/assets/images/press.png"} className="w-5 h-5" />
			</button>
			<button
				className="h-8 rounded-md border-none px-1 py-1 m-0 text-sm bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors mr-0.5"
				ref={pressRef}
				onClick={isAnalog ? onPressAnalog : onPressBinary}
			>
				Press
			</button>
			{isAnalog ? (
				<input
					ref={rangeRef}
					type="range"
					className="h-8 rounded-md border-none px-1 py-1 m-0 text-sm bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors rounded-r-md mr-0"
					onInput={onRangeInput}
				/>
			) : (
				<button
					className="h-8 rounded-md border-none px-1 py-1 m-0 text-sm bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors rounded-r-md mr-0"
					ref={holdRef}
					onClick={onHoldToggle}
				>
					<img src={assetURL + "/assets/images/lock.png"} className="w-5 h-5" />
				</button>
			)}
		</div>
	);
}

export default function ControllerPanel({ deviceKey, device }) {
	const strings = CONTROLLER_STRINGS[deviceKey];
	const joystickContainerRef = React.useRef();
	const joystickResetRef = React.useRef();
	const joystickStickyRef = React.useRef();

	const [showController, setShowController] = React.useState(true);

	const joystick = new Joystick(100, true, 1);
	emulatorStates.joysticks[strings.name] = joystick;
	joystick.on('joystickmove', () => {
		// update joystick
		applyControllerAnalogValue(deviceKey, 0, joystick.getX());
		applyControllerAnalogValue(deviceKey, 1, joystick.getY());

		joystickResetRef.current.disabled = !(
			joystick.sticky &&
			joystick.getX() != 0 &&
			joystick.getY() != 0
		);
	});

	function onStickyToggle() {
		joystick.setSticky(!joystick.sticky);
		joystickStickyRef.current.classList.toggle(
			'bg-blue-600',
			joystick.sticky,
		);
	}

	function toggleDeviceVisibility(event) {
		const newShowState = !showController;
		setShowController(newShowState);
		device.toggleControllerVisibility(deviceKey, newShowState);
		toggleControllerVisibility(deviceKey, newShowState);
		event.target.classList.toggle('bg-blue-600', !newShowState);
		event.target.textContent = newShowState ? 'Hide' : 'Show';
	}

	React.useEffect(() => {
		joystick.addToParent(joystickContainerRef.current);
	}, []);

	return (
		<div className="w-1/2 p-0 first:mr-1 last:ml-1">
			<div className="w-full p-0">
				<div className="rounded-lg bg-gray-800 text-gray-300 relative">
					<div className="border-b-2 border-gray-700 px-1 py-0.5 flex justify-between items-center">
						<div className="flex items-center">
							<img
								src={`${assetURL}/assets/images/${strings.name}.png`}
								className="w-8 h-8"
							/>
							<span className="capitalize pl-1">{strings.displayName}</span>
						</div>
						<button
							className="h-8 rounded-md border-none px-1 py-1 m-0 text-sm bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors"
							type="button"
							onClick={(event) => toggleDeviceVisibility(event)}
							style={{ zIndex: 11, position: 'relative' }}
						>
							{showController ? 'Hide' : 'Show'}
						</button>
					</div>
					{!showController && (
						<div
							className="absolute inset-0 bg-black bg-opacity-50 z-10 rounded-b-lg"
							style={{ pointerEvents: 'none' }}
						></div>
					)}
					<div className={`p-0 pb-0.5 ${!showController ? 'opacity-50' : ''}`}>
						<div className="flex my-1">
							<div className="w-1/3 flex items-center">
								<div
									ref={joystickContainerRef}
									className="w-20 relative top-8 left-0"
								></div>
							</div>
							<div className="w-2/3 flex justify-end">
								<ControlButtonGroup
									isAnalog={false}
									deviceKey={deviceKey}
									buttonKey="joystick"
								/>
							</div>
						</div>
						<div className="flex justify-end my-1">
							<div className="flex ml-1">
								<button
									ref={joystickStickyRef}
									type="button"
									className="h-8 rounded-md border-none px-1 py-1 m-0 text-sm bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors rounded-l-md mr-0.5"
									onClick={onStickyToggle}
								>
									<img
										src={assetURL + "/assets/images/sticky.png"}
										className="w-5 h-5"
									/>
									Sticky
								</button>
								<button
									ref={joystickResetRef}
									type="button"
									className="h-8 rounded-md border-none px-1 py-1 m-0 text-sm bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors rounded-r-md mr-0"
									onClick={joystick.reset.bind(joystick)}
								>
									<img
										src={assetURL + "/assets/images/reset.png"}
										className="w-5 h-5"
									/>
								</button>
							</div>
						</div>
						{['trigger', 'grip'].map((controlName) => (
							<div key={controlName} className="flex my-1">
								<div className="w-1/4 flex items-center">
									<img
										src={
											assetURL+
											'/assets/images/' +
											controlName +
											'-' +
											strings.handedness +
											'.png'
										}
										className="w-8 h-8"
									/>
									<span className="capitalize pl-1">{controlName}</span>
								</div>
								<div className="w-3/4 flex justify-end">
									<ControlButtonGroup
										isAnalog={true}
										deviceKey={deviceKey}
										buttonKey={controlName}
									/>
								</div>
							</div>
						))}
						{['button2', 'button1'].map((controlName) => (
							<div key={controlName} className="flex my-1">
								<div className="w-1/3 flex items-center">
									<img
										src={`${assetURL}/assets/images/${controlName}-${strings.handedness}.png`}
										className="w-8 h-8"
									/>
									<span className="capitalize pl-1">{strings[controlName]}</span>
								</div>
								<div className="w-2/3 flex justify-end">
									<ControlButtonGroup
										isAnalog={false}
										deviceKey={deviceKey}
										buttonKey={controlName}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export function createAnalogPressFunction(pressRef, rangeRef, onRangeInput) {
	return function () {
		const step = 10;
		const { interval, holdTime } =
			TRIGGER_CONFIG[EmulatorSettings.instance.triggerMode];
		pressRef.current.disabled = true;
		let rangeValue = 0;
		const pressIntervalId = setInterval(() => {
			if (rangeRef.current.value >= 100) {
				rangeRef.current.value = 100;
				clearInterval(pressIntervalId);
				setTimeout(() => {
					const depressIntervalId = setInterval(() => {
						if (rangeRef.current.value <= 0) {
							rangeRef.current.value = 0;
							clearInterval(depressIntervalId);
							pressRef.current.disabled = false;
						} else {
							rangeRef.current.value -= step;
						}
						onRangeInput();
					}, interval);
				}, holdTime);
			} else {
				rangeValue += step;
				rangeRef.current.value = rangeValue;
			}
			onRangeInput();
		}, interval);
	};
}
