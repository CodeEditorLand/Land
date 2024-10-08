/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { getServiceMachineId } from './serviceMachineId.js';
import { getTelemetryLevel, supportsTelemetry } from '../../telemetry/common/telemetryUtils.js';
export async function resolveMarketplaceHeaders(version, productService, environmentService, configurationService, fileService, storageService, telemetryService) {
    const headers = {
        'X-Market-Client-Id': `VSCode ${version}`,
        'User-Agent': `VSCode ${version} (${productService.nameShort})`
    };
    if (supportsTelemetry(productService, environmentService) && getTelemetryLevel(configurationService) === 3 /* TelemetryLevel.USAGE */) {
        const serviceMachineId = await getServiceMachineId(environmentService, fileService, storageService);
        headers['X-Market-User-Id'] = serviceMachineId;
        // Send machineId as VSCode-SessionId so we can correlate telemetry events across different services
        // machineId can be undefined sometimes (eg: when launching from CLI), so send serviceMachineId instead otherwise
        // Marketplace will reject the request if there is no VSCode-SessionId header
        headers['VSCode-SessionId'] = telemetryService.machineId || serviceMachineId;
    }
    return headers;
}
