/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EmulatorSettings, emulatorStates } from '../js/emulatorStates';

import { DEVICE } from '../js/constants';
import React from 'react';
import { changeInputMode } from '../js/messenger';
import initKeyboardControl from '../js/keyboard';


import config from '@ir-engine/common/src/config';
const assetURL = config.client.fileServer + '/projects/enchantmentengine/ee-development-test-suite/src/devtool'

export default function PoseBar({ device, setInputMode }) {
	const saveDefaultPoseRef = React.useRef();
	const resetPoseRef = React.useRef();
	const actionMappingToggleRef = React.useRef();
	const handModeToggleRef = React.useRef();
	const controllerModeToggleRef = React.useRef();

	function onSaveDefaultPose() {
		const deviceTransform = {};
		Object.values(DEVICE).forEach((device) => {
			deviceTransform[device] = {};
			deviceTransform[device].position =
				emulatorStates.assetNodes[device].position.toArray();
			deviceTransform[device].rotation =
				emulatorStates.assetNodes[device].rotation.toArray();
		});
		EmulatorSettings.instance.defaultPose = deviceTransform;
		EmulatorSettings.instance.write();
	}

	function onActionMappingToggle() {
		EmulatorSettings.instance.actionMappingOn =
			!EmulatorSettings.instance.actionMappingOn;
		actionMappingToggleRef.current.classList.toggle(
			'bg-blue-600',
			EmulatorSettings.instance.actionMappingOn,
		);
		EmulatorSettings.instance.write();
	}

	function onInputModeChange(inputMode) {
		EmulatorSettings.instance.inputMode = inputMode;
		EmulatorSettings.instance.write();
		changeInputMode();
		controllerModeToggleRef.current.classList.toggle(
			'bg-blue-600',
			inputMode === 'controllers',
		);
		handModeToggleRef.current.classList.toggle(
			'bg-blue-600',
			inputMode === 'hands',
		);
		setInputMode(inputMode);
	}

	React.useEffect(() => {
		changeInputMode();
		initKeyboardControl();
	}, []);

	return (
		<div className="rounded-b-lg bg-gray-800 text-gray-300 mx-1 mb-0">
			<div className="py-1">
				<div className="flex items-center justify-between">
					<div className="flex items-center justify-start w-2/3">
						<img src={assetURL + "/assets/images/pose.png"} className="w-8 h-8" />
						<div className="flex ml-1">
							<button
								ref={saveDefaultPoseRef}
								type="button"
								className="h-8 inline-block rounded-md border-none px-1.5 py-0.5 m-0 text-sm bg-gray-600 text-gray-200 text-center align-middle hover:bg-gray-500 transition-colors"
								onClick={onSaveDefaultPose}
							>
								Save as default pose
							</button>
							<button
								ref={resetPoseRef}
								type="button"
								className="h-8 inline-block rounded-md border-none px-1.5 py-0.5 m-0 text-sm bg-gray-600 text-gray-200 text-center align-middle hover:bg-gray-500 transition-colors ml-0.5"
								onClick={() => {
									device.resetPose();
								}}
							>
								<img src={assetURL + "/assets/images/reset.png"} className="w-5 h-5" />
							</button>
						</div>
					</div>

					<div className="flex items-center justify-end w-1/3">
						<div className="flex">
							<button
								ref={actionMappingToggleRef}
								type="button"
								className={
									'h-8 inline-block rounded-md border-none px-1.5 py-0.5 m-0 text-sm bg-gray-600 text-gray-200 text-center align-middle hover:bg-gray-500 transition-colors' +
									(EmulatorSettings.instance.actionMappingOn ? ' bg-blue-600 hover:bg-blue-500' : '')
								}
								title="Keyboard Action Mapping"
								onClick={onActionMappingToggle}
							>
								<img
									src={assetURL + "/assets/images/keyboard.png"}
									className="w-5 h-5"
								/>
							</button>
							<button
								ref={controllerModeToggleRef}
								type="button"
								className={
									'h-8 inline-block rounded-md border-none px-1.5 py-0.5 m-0 text-sm bg-gray-600 text-gray-200 text-center align-middle hover:bg-gray-500 transition-colors ml-0.5' +
									(EmulatorSettings.instance.inputMode === 'controllers' ? ' bg-blue-600 hover:bg-blue-500' : '')
								}
								title="Controller Mode"
								onClick={() => {
									onInputModeChange('controllers');
								}}
							>
								<img
									src={assetURL + "/assets/images/gamepad.png"}
									className="w-5 h-5"
								/>
							</button>
							<button
								ref={handModeToggleRef}
								type="button"
								className={
									'h-8 inline-block rounded-md border-none px-1.5 py-0.5 m-0 text-sm bg-gray-600 text-gray-200 text-center align-middle hover:bg-gray-500 transition-colors ml-0.5' +
									(EmulatorSettings.instance.inputMode === 'hands' ? ' bg-blue-600 hover:bg-blue-500' : '')
								}
								title="Hands Mode"
								onClick={() => {
									onInputModeChange('hands');
								}}
							>
								<img
									src={assetURL + "/assets/images/hand-tracking.png"}
									className="w-5 h-5"
								/>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
