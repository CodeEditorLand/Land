/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { machineIdKey, sqmIdKey, devDeviceIdKey } from '../common/telemetry.js';
import { resolveMachineId as resolveNodeMachineId, resolveSqmId as resolveNodeSqmId, resolvedevDeviceId as resolveNodedevDeviceId } from '../node/telemetryUtils.js';
export async function resolveMachineId(stateService, logService) {
    // Call the node layers implementation to avoid code duplication
    const machineId = await resolveNodeMachineId(stateService, logService);
    stateService.setItem(machineIdKey, machineId);
    return machineId;
}
export async function resolveSqmId(stateService, logService) {
    const sqmId = await resolveNodeSqmId(stateService, logService);
    stateService.setItem(sqmIdKey, sqmId);
    return sqmId;
}
export async function resolvedevDeviceId(stateService, logService) {
    const devDeviceId = await resolveNodedevDeviceId(stateService, logService);
    stateService.setItem(devDeviceIdKey, devDeviceId);
    return devDeviceId;
}
