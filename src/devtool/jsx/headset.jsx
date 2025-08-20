/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DEFAULT_TRANSFORMS, TRIGGER_MODES } from '../js/constants';
import {
	changeEmulatedDeviceType,
	notifyExitImmersive,
	reloadInspectedTab,
	togglePolyfill,
	toggleStereoMode,
} from '../js/messenger';
import config from '@ir-engine/common/src/config';

const assetURL = config.client.fileServer + '/projects/enchantmentengine/ee-development-test-suite/src/devtool'

import { DEVICE_DEFINITIONS } from '../js/devices';
import { EmulatorSettings } from '../js/emulatorStates';
import React from 'react';

export default function HeadsetBar({ device }) {
	const headsetSelectRef = React.useRef();
	const polyfillToggleRef = React.useRef();
	const stereoToggleRef = React.useRef();
	const [polyfillOn, setPolyfillOn] = React.useState(true);
	const [showDropDown, setShowDropDown] = React.useState(false);
	const [triggerMode, setTriggerMode] = React.useState(
		EmulatorSettings.instance.triggerMode,
	);

	function onChangeDevice() {
		const deviceId = headsetSelectRef.current.value;
		if (DEVICE_DEFINITIONS[deviceId]) {
			EmulatorSettings.instance.deviceKey = deviceId;
			changeEmulatedDeviceType(DEVICE_DEFINITIONS[deviceId]);
			EmulatorSettings.instance.write();
		}
	}

	function onToggleStereo() {
		EmulatorSettings.instance.stereoOn = !EmulatorSettings.instance.stereoOn;
		toggleStereoMode(EmulatorSettings.instance.stereoOn);
		stereoToggleRef.current.classList.toggle(
			'bg-blue-600',
			EmulatorSettings.instance.stereoOn,
		);
		EmulatorSettings.instance.write();
	}

	const updatePolyfillState = (tab) => {
		const url = new URL(tab.url);
		const urlMatchPattern = url.origin + '/*';
		setPolyfillOn(
			!EmulatorSettings.instance.polyfillExcludes.has(urlMatchPattern),
		);
	};

	React.useEffect(() => {
		// check every time navigation happens on the tab
		// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
		// 	if (
		// 		tabId === chrome.devtools.inspectedWindow.tabId &&
		// 		changeInfo.status === 'complete'
		// 	) {
		// 		updatePolyfillState(tab);
		// 	}
		// });

		// // check on start up
		// chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, (tab) => {
		// 	updatePolyfillState(tab);
		// });
	});

	return (
		<div className="rounded-t-lg bg-gray-800 text-gray-300 m-1 mt-0">
			<div
				style={{
					backgroundColor: 'rgba(0,0,0,0.5)',
					zIndex: 10,
					position: 'fixed',
					height: (polyfillOn ? 0 : 100) + 'vh',
					width: '100vw',
					left: 0,
					top: 0,
				}}
			></div>
			<div className="py-1">
				<div className="flex items-center justify-between">
					<div className="flex items-center justify-start w-1/3">
						<img src={assetURL + "/assets/images/headset.png"} className="w-8 h-8" />
						<select
							id="vr-device-select"
							className="h-8 w-18 appearance-none rounded-md border-none px-1 ml-2 text-sm bg-gray-700 text-gray-200 text-center focus:bg-gray-600 focus:outline-none"
							ref={headsetSelectRef}
							defaultValue={EmulatorSettings.instance.deviceKey}
							onChange={onChangeDevice}
						>
							{Object.values(DEVICE_DEFINITIONS).map(({ shortName, name }) => (
								<option key={name} value={name}>
									{shortName}
								</option>
							))}
						</select>
					</div>
					<div className="flex items-center justify-end w-2/3">
						<div className="flex items-center">
							<button
								className={
									'flex items-center px-2 py-1 ml-2 text-xs rounded-md border-none bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors' +
									(polyfillOn ? ' bg-blue-600 hover:bg-blue-500' : '')
								}
								ref={polyfillToggleRef}
								onClick={togglePolyfill}
								style={{ zIndex: 11, position: 'relative' }}
							>
								<img
									src={assetURL + "/assets/images/polyfill-on.png"}
									className="w-5 h-5 mr-1"
								/>
								Polyfill
							</button>
							<button
								className={
									'flex items-center px-2 py-1 ml-2 text-xs rounded-md border-none bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors' +
									(EmulatorSettings.instance.stereoOn ? ' bg-blue-600 hover:bg-blue-500' : '')
								}
								ref={stereoToggleRef}
								onClick={onToggleStereo}
							>
								<img src={assetURL + "/assets/images/stereo.png"} className="w-5 h-5 mr-1" />
								Stereo
							</button>
							<button
								className="flex items-center px-2 py-1 ml-2 text-xs rounded-md border-none bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors"
								onClick={notifyExitImmersive}
							>
								<img src={assetURL + "/assets/images/exit.png"} className="w-5 h-5" />
							</button>
							<button
								className={
									'flex items-center px-2 py-1 ml-2 text-xs rounded-md border-none bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors' +
									(showDropDown ? ' bg-blue-600 hover:bg-blue-500' : '')
								}
								onClick={() => {
									setShowDropDown(!showDropDown);
								}}
							>
								<img
									src={assetURL + "/assets/images/settings.png"}
									className="w-5 h-5"
								/>
							</button>
						</div>
						{showDropDown && (
							<div className="absolute top-10 right-2 bg-gray-600 rounded-lg p-2 z-20 w-32">
								<button
									className="w-full text-left px-2 py-1 text-xs rounded-md border-none bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors mb-1"
									onClick={() => {
										const currentModeIndex = TRIGGER_MODES.indexOf(
											EmulatorSettings.instance.triggerMode,
										);
										const nextModeIndex =
											(currentModeIndex + 1) % TRIGGER_MODES.length;
										EmulatorSettings.instance.triggerMode =
											TRIGGER_MODES[nextModeIndex];
										EmulatorSettings.instance.write().then(() => {
											setTriggerMode(EmulatorSettings.instance.triggerMode);
										});
									}}
								>
									Trigger: {triggerMode}
								</button>
								<button
									className="w-full text-left px-2 py-1 text-xs rounded-md border-none bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors mb-1"
									onClick={() => {
										EmulatorSettings.instance.defaultPose = DEFAULT_TRANSFORMS;
										EmulatorSettings.instance.write().then(() => {
											device.resetPose();
										});
									}}
								>
									Clear default pose
								</button>
								<button
									className="w-full text-left px-2 py-1 text-xs rounded-md border-none bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors mb-1"
									onClick={() => {
										EmulatorSettings.instance.clear().then(() => {
											location.reload();
											reloadInspectedTab();
										});
									}}
								>
									Clear all settings
								</button>
								<button
									className="w-full text-left px-2 py-1 text-xs rounded-md border-none bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors"
									onClick={() => {
										chrome.tabs.create({
											url: 'https://chrome.google.com/webstore/detail/immersive-web-emulator/cgffilbpcibhmcfbgggfhfolhkfbhmik',
										});
									}}
								>
									version - {chrome.runtime.getManifest().version}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
