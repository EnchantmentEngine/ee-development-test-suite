/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EmulatorSettings, emulatorStates } from '../js/emulatorStates';
import {
	changeHandPose,
	updatePinchValue,
	toggleHandVisibility,
} from '../js/messenger';

import { HAND_STRINGS } from '../js/constants';
import React from 'react';
import { createAnalogPressFunction } from './controllers.jsx';

import config from '@ir-engine/common/src/config';
const assetURL = config.client.fileServer + '/projects/enchantmentengine/ee-development-test-suite/src/devtool'


export default function HandPanel({ deviceKey, device }) {
	const strings = HAND_STRINGS[deviceKey];
	const pressRef = React.createRef();
	const rangeRef = React.createRef();
	const poseSelectRef = React.createRef();

	const [showHand, setShowHand] = React.useState(true);

	function onHandPoseChange() {
		EmulatorSettings.instance.handPoses[strings.name] =
			poseSelectRef.current.value;
		EmulatorSettings.instance.write();
		changeHandPose(deviceKey);
	}

	function onRangeInput() {
		emulatorStates.pinchValues[strings.name] = rangeRef.current.value / 100;
		updatePinchValue(deviceKey);
	}

	function toggleDeviceVisibility(event) {
		const newShowState = !showHand;
		setShowHand(newShowState);
		device.toggleHandVisibility(deviceKey, newShowState);
		toggleHandVisibility(deviceKey, newShowState);
		event.target.classList.toggle('bg-blue-600', !newShowState);
		event.target.textContent = newShowState ? 'Hide' : 'Show';
	}

	const onPressAnalog = createAnalogPressFunction(
		pressRef,
		rangeRef,
		onRangeInput,
	);

	React.useEffect(onRangeInput, []);

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
							{showHand ? 'Hide' : 'Show'}
						</button>
					</div>
					{!showHand && (
						<div
							className="absolute inset-0 bg-black bg-opacity-50 z-10 rounded-b-lg"
							style={{ pointerEvents: 'none' }}
						></div>
					)}
					<div className={`p-0 pb-0.5 ${!showHand ? 'opacity-50' : ''}`}>
						<div className="flex my-1">
							<div className="w-1/3 flex items-center">
								<span className="capitalize pl-1">Pose</span>
							</div>
							<div className="w-2/3 flex justify-end">
								<div>
									<select
										ref={poseSelectRef}
										className="h-8 rounded-md border-none px-1 py-1 m-0 text-sm bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors appearance-none"
										onChange={onHandPoseChange}
										defaultValue={
											EmulatorSettings.instance.handPoses[strings.name]
										}
									>
										<option value="relaxed">relaxed</option>
										<option value="point">point</option>
									</select>
								</div>
							</div>
						</div>
						<div className="flex my-1">
							<div className="w-1/4 flex items-center">
								<span className="capitalize pl-1">Pinch</span>
							</div>
							<div className="w-3/4 flex justify-end">
								<div className="flex ml-1">
									<button
										ref={pressRef}
										type="button"
										className="h-8 rounded-md border-none px-1 py-1 m-0 text-sm bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors rounded-l-md mr-0.5"
										onClick={onPressAnalog}
									>
										<img src={assetURL + "/assets/images/hand-pose.png"} className="w-5 h-5" />
									</button>
									<input
										ref={rangeRef}
										type="range"
										className="h-8 rounded-md border-none px-1 py-1 m-0 text-sm bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors rounded-r-md mr-0 max-w-20"
										onInput={onRangeInput}
										defaultValue={0}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
