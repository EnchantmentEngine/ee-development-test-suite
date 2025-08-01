/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
	CONTROLLER_STRINGS,
	DEVICE,
	HAND_STRINGS,
	OBJECT_NAME,
	SEMANTIC_LABELS,
} from '../js/constants';

import { EmulatorSettings } from '../js/emulatorStates';
import React from 'react';
import { changeRoomDimension } from '../js/messenger';

import config from '@ir-engine/common/src/config';
const assetURL = config.client.fileServer + '/projects/enchantmentengine/ee-development-test-suite/src/devtool'

export default function Inspector({ device, inputMode }) {
	const sceneContainerRef = React.useRef();
	// plane setting refs
	const planeWidthRef = React.useRef();
	const planeHeightRef = React.useRef();
	const [planeVertical, setPlaneVertical] = React.useState(true);
	const planeSemanticLabelRef = React.useRef();
	// mesh setting refs
	const meshWidthRef = React.useRef();
	const meshHeightRef = React.useRef();
	const meshDepthRef = React.useRef();
	const meshSemanticLabelRef = React.useRef();

	const [showTransforms, setShowTransforms] = React.useState(true);
	const [showRoomSettings, setShowRoomSettings] = React.useState(false);
	const [showPlaneSettings, setShowPlaneSettings] = React.useState(false);
	const [showMeshSettings, setShowMeshSettings] = React.useState(false);
	const transformData = {};
	Object.values(DEVICE).forEach((deviceKey) => {
		const deviceName = OBJECT_NAME[deviceKey];
		transformData[deviceName] = React.useState({
			position: [0, 0, 0],
			rotation: [0, 0, 0],
		});
	});

	const [inputValues, setInputValues] = React.useState(
		Object.values(DEVICE).reduce((acc, deviceKey) => {
			const deviceName = OBJECT_NAME[deviceKey];
			for (let i = 0; i < 3; i++) {
				acc[`${deviceName}-position-${i}`] =
					transformData[deviceName][0].position[i];
				acc[`${deviceName}-rotation-${i}`] =
					transformData[deviceName][0].rotation[i];
			}
			return acc;
		}, {}),
	);

	function handleInputChange(key, event) {
		const value = parseFloat(event.target.value);
		if (!isNaN(value)) {
			const clampedValue = roundAndClamp(value);
			setInputValues((prevValues) => ({
				...prevValues,
				[key]: clampedValue,
			}));
			// Split the key into its components
			const [deviceName, type, index] = key.split('-');
			const deviceKey = Object.keys(OBJECT_NAME).find(
				(key) => OBJECT_NAME[key] === deviceName,
			);
			// Update the device transform
			if (deviceKey) {
				const position = [...transformData[deviceName][0].position];
				const rotation = [...transformData[deviceName][0].rotation];
				if (type === 'position') {
					position[index] = clampedValue;
				} else if (type === 'rotation') {
					rotation[index] = clampedValue;
				}
				device.setDeviceTransform(deviceKey, position, rotation);
			}
		}
	}

	function roundAndClamp(number) {
		const rounded = Math.round(number * 100) / 100;
		return Math.min(Math.max(rounded, -99.99), 99.99);
	}

	React.useEffect(() => {
		sceneContainerRef.current.appendChild(device.canvas);
		sceneContainerRef.current.appendChild(device.labels);
		device.on('pose', (event) => {
			const { deviceKey, position, rotation } = event;
			const deviceName = OBJECT_NAME[deviceKey];
			const transform = transformData[deviceName];
			const setTransform = transform[1];
			setTransform({ position, rotation });
			setInputValues((prevValues) => ({
				...prevValues,
				[`${deviceName}-position-0`]: roundAndClamp(position[0]),
				[`${deviceName}-position-1`]: roundAndClamp(position[1]),
				[`${deviceName}-position-2`]: roundAndClamp(position[2]),
				[`${deviceName}-rotation-0`]: roundAndClamp(rotation[0]),
				[`${deviceName}-rotation-1`]: roundAndClamp(rotation[1]),
				[`${deviceName}-rotation-2`]: roundAndClamp(rotation[2]),
			}));
		});
		device.forceEmitPose();
	}, []);
	
	return (
		<>
			<div 
				ref={sceneContainerRef} 
				id="scene-container"
				className="p-0 w-full h-full relative overflow-hidden min-h-64 bg-gray-900"
				style={{ minHeight: '256px' }}
			>
				<div id="transform-component" className="absolute top-0 left-0 p-0 pointer-events-none z-10">
					<button
						onClick={() => {
							setShowTransforms(!showTransforms);
							setShowRoomSettings(false);
							setShowPlaneSettings(false);
							setShowMeshSettings(false);
						}}
						className={`border-none pointer-events-auto bg-gray-800 text-white opacity-50 hover:opacity-100 h-4 px-0 w-12 rounded-sm mx-0 my-0.5 text-xs transition-opacity ${
							showTransforms ? 'font-bold opacity-100' : ''
						}`}
					>
						device
					</button>
					<button
						onClick={() => {
							setShowRoomSettings(!showRoomSettings);
							setShowTransforms(false);
							setShowPlaneSettings(false);
							setShowMeshSettings(false);
						}}
						className={`border-none pointer-events-auto bg-gray-800 text-white opacity-50 hover:opacity-100 h-4 px-0 w-12 rounded-sm mx-0 my-0.5 text-xs transition-opacity ${
							showRoomSettings ? 'font-bold opacity-100' : ''
						}`}
					>
						room
					</button>
					<button
						onClick={() => {
							setShowPlaneSettings(!showPlaneSettings);
							setShowRoomSettings(false);
							setShowTransforms(false);
							setShowMeshSettings(false);
						}}
						className={`border-none pointer-events-auto bg-gray-800 text-white opacity-50 hover:opacity-100 h-4 px-0 w-12 rounded-sm mx-0 my-0.5 text-xs transition-opacity ${
							showPlaneSettings ? 'font-bold opacity-100' : ''
						}`}
					>
						plane
					</button>
					<button
						onClick={() => {
							setShowMeshSettings(!showMeshSettings);
							setShowRoomSettings(false);
							setShowTransforms(false);
							setShowPlaneSettings(false);
						}}
						className={`border-none pointer-events-auto bg-gray-800 text-white opacity-50 hover:opacity-100 h-4 px-0 w-12 rounded-sm mx-0 my-0.5 text-xs transition-opacity ${
							showMeshSettings ? 'font-bold opacity-100' : ''
						}`}
					>
						mesh
					</button>
					{showTransforms &&
						Object.values(DEVICE).map((deviceKey) => {
							const deviceName = OBJECT_NAME[deviceKey];
							return (
								<div key={deviceKey} className="text-white m-1 w-48 text-xs leading-tight">
									<div className="flex items-center mb-1">
										<button
											className="w-8 h-8 bg-gray-800 opacity-50 rounded-l-md flex justify-center items-center"
											onClick={() => {
												device.toggleControlMode(deviceKey);
											}}
										>
											<img
												src={`${assetURL}/assets/images/${
													deviceKey === DEVICE.HEADSET
														? OBJECT_NAME[deviceKey]
														: inputMode === 'hands'
														? HAND_STRINGS[deviceKey].name
														: CONTROLLER_STRINGS[deviceKey].name
												}.png`}
												className="w-6 h-6"
											/>
										</button>
										<div className="bg-gray-800 opacity-50 text-white rounded-r-md p-0.5 ml-0.5 flex-1">
											{['position', 'rotation'].map((type, index) => (
												<div className={`${index === 1 ? '' : 'mb-0.5'}`} key={`${deviceName}-${type}`}>
													<div className="flex gap-1">
														{[0, 1, 2].map((i) => (
															<input
																key={`${deviceName}-${type}-${i}`}
																type="number"
																value={inputValues[`${deviceName}-${type}-${i}`]}
																onChange={(event) =>
																	handleInputChange(
																		`${deviceName}-${type}-${i}`,
																		event,
																	)
																}
																className="border-none bg-black rounded w-12 appearance-none text-center text-white focus:outline-none text-xs"
															/>
														))}
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							);
						})}{' '}
					{showRoomSettings && (
						<div className="text-white m-0.5 w-40 text-xs leading-tight" id="room-dimension-settings">
							<div className="w-8 h-8 bg-gray-800 opacity-50 rounded-l-md flex justify-center items-center inline-block">
								<img
									src={assetURL + "/assets/images/roomscale.png"}
									className="w-8 h-8"
								/>
							</div>
							<div className="bg-gray-800 w-32 opacity-50 text-white rounded-r-md p-0 ml-0.5 inline-block">
								{[
									['x', 'width'],
									['y', 'height'],
									['z', 'depth'],
								].map(([key, name]) => (
									<div key={name + key} className="h-4 px-1">
										<span className="h-5 px-1">Space {name}:</span>
										<input
											type="number"
											defaultValue={EmulatorSettings.instance.roomDimension[key]}
											onChange={(event) => {
												EmulatorSettings.instance.roomDimension[key] = parseFloat(
													event.target.value,
												);
												EmulatorSettings.instance.write();
												device.updateRoom();
												changeRoomDimension();
											}}
											className="w-9 h-4 px-1 absolute rounded-lg border-0 left-24 bg-gray-300"
										/>
									</div>
								))}
							</div>
						</div>
					)}
					{showPlaneSettings && (
						<div className="m-1 w-36">
							<div className="mb-0.5">
								<input
									ref={planeWidthRef}
									type="number"
									placeholder="width"
									min={0}
									className="h-4 border-none rounded-sm mr-0.5 pointer-events-auto text-center bg-gray-800 text-white opacity-50 align-middle appearance-none w-10 p-0"
								/>
								<input
									ref={planeHeightRef}
									type="number"
									placeholder="height"
									min={0}
									className="h-4 border-none rounded-sm mr-0.5 pointer-events-auto text-center bg-gray-800 text-white opacity-50 align-middle appearance-none w-10 p-0"
								/>
								<button
									onClick={() => {
										setPlaneVertical(!planeVertical);
									}}
									className="h-4 border-none rounded-sm mr-0.5 pointer-events-auto text-center bg-gray-800 text-white opacity-50 align-middle appearance-none w-10 p-0"
								>
									<img
										src={`${assetURL}/assets/images/${
											planeVertical ? 'vertical' : 'horizontal'
										}.png`}
										className="w-6 h-6"
									/>
								</button>
							</div>
							<div className="mb-0.5">
								<select ref={planeSemanticLabelRef} className="h-4 border-none rounded-sm mr-0.5 pointer-events-auto text-center bg-gray-800 text-white opacity-50 align-middle w-20">
									{Object.values(SEMANTIC_LABELS).map((semanticLabel) => (
										<option key={semanticLabel} value={semanticLabel}>
											{semanticLabel}
										</option>
									))}
								</select>
								<button
									onClick={() => {
										device.addPlane(
											Number(planeWidthRef.current.value),
											Number(planeHeightRef.current.value),
											Number(planeVertical),
											planeSemanticLabelRef.current.value,
										);
									}}
									className="h-4 border-none rounded-sm mr-0.5 pointer-events-auto text-center bg-gray-800 text-white opacity-50 align-middle appearance-none w-10 p-0"
								>
									create
								</button>
							</div>
							<div className="mb-0.5">
								<button
									onClick={() => {
										device.deleteSelectedObject();
									}}
									className="h-4 border-none rounded-sm mr-0.5 pointer-events-auto text-center bg-gray-800 text-white opacity-50 align-middle appearance-none w-32 p-0"
								>
									delete selected
								</button>
							</div>
							<div className="mb-0.5">
								<button
									onClick={() => {
										device.toggleSelectedObjectVisibility();
									}}
									className="h-4 border-none rounded-sm mr-0.5 pointer-events-auto text-center bg-gray-800 text-white opacity-50 align-middle appearance-none w-32 p-0"
								>
									show/hide selected
								</button>
							</div>
						</div>
					)}
					{showMeshSettings && (
						<div className="m-1 w-36">
							<div className="mb-0.5">
								<input
									ref={meshWidthRef}
									type="number"
									placeholder="width"
									min={0}
									className="h-4 border-none rounded-sm mr-0.5 pointer-events-auto text-center bg-gray-800 text-white opacity-50 align-middle appearance-none w-10 p-0"
								/>
								<input
									ref={meshHeightRef}
									type="number"
									placeholder="height"
									min={0}
									className="h-4 border-none rounded-sm mr-0.5 pointer-events-auto text-center bg-gray-800 text-white opacity-50 align-middle appearance-none w-10 p-0"
								/>
								<input
									ref={meshDepthRef}
									type="number"
									placeholder="depth"
									min={0}
									className="h-4 border-none rounded-sm mr-0.5 pointer-events-auto text-center bg-gray-800 text-white opacity-50 align-middle appearance-none w-10 p-0"
								/>
							</div>
							<div className="mb-0.5">
								<select ref={meshSemanticLabelRef} className="h-4 border-none rounded-sm mr-0.5 pointer-events-auto text-center bg-gray-800 text-white opacity-50 align-middle w-20">
									{Object.values(SEMANTIC_LABELS).map((semanticLabel) => (
										<option key={semanticLabel} value={semanticLabel}>
											{semanticLabel}
										</option>
									))}
								</select>
								<button
									onClick={() => {
										device.addMesh(
											Number(meshWidthRef.current.value),
											Number(meshHeightRef.current.value),
											Number(meshDepthRef.current.value),
											meshSemanticLabelRef.current.value,
										);
									}}
									className="h-4 border-none rounded-sm mr-0.5 pointer-events-auto text-center bg-gray-800 text-white opacity-50 align-middle appearance-none w-10 p-0"
								>
									create
								</button>
							</div>
							<div className="mb-0.5">
								<button
									onClick={() => {
										device.deleteSelectedObject();
									}}
									className="h-4 border-none rounded-sm mr-0.5 pointer-events-auto text-center bg-gray-800 text-white opacity-50 align-middle appearance-none w-32 p-0"
								>
									delete selected
								</button>
							</div>
							<div className="mb-0.5">
								<button
									onClick={() => {
										device.toggleSelectedObjectVisibility();
									}}
									className="h-4 border-none rounded-sm mr-0.5 pointer-events-auto text-center bg-gray-800 text-white opacity-50 align-middle appearance-none w-32 p-0"
								>
									show/hide selected
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
