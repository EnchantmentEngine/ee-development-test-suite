/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ControllerPanel from './controllers.jsx';
import { DEVICE } from '../js/constants';
import { EmulatorSettings } from '../js/emulatorStates.js';
import HandPanel from './hands.jsx';
import HeadsetBar from './headset.jsx';
import Inspector from './inspector.jsx';
import PoseBar from './pose.jsx';
import React from 'react';

export default function App({ device }) {
	const [inputMode, setInputMode] = React.useState(
		EmulatorSettings.instance.inputMode,
	);
	const [showInspector, setShowInspector] = React.useState(true);
	const [showControls, setShowControls] = React.useState(true);
	const sizeWarningRef = React.useRef();

	// Since we're now in a floating panel, we don't need complex resize logic
	// The panel itself handles resizing, so we can always show all components
	React.useEffect(() => {
		// Always show all components in the floating panel
		setShowInspector(true);
		setShowControls(true);
	}, [inputMode]);

	React.useEffect(() => {
		// Trigger device render when input mode changes
		if (device && typeof device.render === 'function') {
			device.render();
		}
	}, [inputMode, device]);

	return (
		<>
			<div
				className="rounded-lg text-gray-300 flex-1 flex flex-col bg-gray-800 border border-gray-700"
				style={{ display: showInspector ? 'flex' : 'none' }}
			>
				<div id="headset-component" className="w-full p-0 border-b border-gray-700">
					<HeadsetBar device={device} />
				</div>
				
				<div id="render-component" className="w-full p-0 flex-1 min-h-0">
					<Inspector device={device} inputMode={inputMode} />
				</div>
				
				<div id="pose-component" className="w-full p-0 border-t border-gray-700">
					<PoseBar device={device} setInputMode={setInputMode} />
				</div>
			</div>
			
			<div
				className="rounded-lg text-gray-300 flex flex-col bg-gray-800 border border-gray-700 mt-2"
				style={{ display: showControls ? 'flex' : 'none' }}
			>
				<div
					className="flex w-full p-2 gap-2"
					style={{ display: inputMode === 'controllers' ? 'flex' : 'none' }}
				>
					{[DEVICE.INPUT_LEFT, DEVICE.INPUT_RIGHT].map((deviceKey) => (
						<ControllerPanel
							key={deviceKey}
							deviceKey={deviceKey}
							device={device}
						/>
					))}
				</div>
				
				<div
					className="flex w-full p-2 gap-2 flex-1 min-h-0"
					style={{ display: inputMode === 'hands' ? 'flex' : 'none' }}
				>
					{[DEVICE.INPUT_LEFT, DEVICE.INPUT_RIGHT].map((deviceKey) => (
						<HandPanel key={deviceKey} deviceKey={deviceKey} device={device} />
					))}
				</div>
			</div>
		</>
	);
}
