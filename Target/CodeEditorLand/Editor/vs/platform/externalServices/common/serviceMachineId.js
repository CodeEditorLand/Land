/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { VSBuffer } from '../../../base/common/buffer.js';
import { generateUuid, isUUID } from '../../../base/common/uuid.js';
export async function getServiceMachineId(environmentService, fileService, storageService) {
    let uuid = storageService ? storageService.get('storage.serviceMachineId', -1 /* StorageScope.APPLICATION */) || null : null;
    if (uuid) {
        return uuid;
    }
    try {
        const contents = await fileService.readFile(environmentService.serviceMachineIdResource);
        const value = contents.value.toString();
        uuid = isUUID(value) ? value : null;
    }
    catch (e) {
        uuid = null;
    }
    if (!uuid) {
        uuid = generateUuid();
        try {
            await fileService.writeFile(environmentService.serviceMachineIdResource, VSBuffer.fromString(uuid));
        }
        catch (error) {
            //noop
        }
    }
    storageService?.store('storage.serviceMachineId', uuid, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
    return uuid;
}
