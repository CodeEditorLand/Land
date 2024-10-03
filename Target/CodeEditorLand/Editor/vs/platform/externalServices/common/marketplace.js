import { getServiceMachineId } from './serviceMachineId.js';
import { getTelemetryLevel, supportsTelemetry } from '../../telemetry/common/telemetryUtils.js';
export async function resolveMarketplaceHeaders(version, productService, environmentService, configurationService, fileService, storageService, telemetryService) {
    const headers = {
        'X-Market-Client-Id': `VSCode ${version}`,
        'User-Agent': `VSCode ${version} (${productService.nameShort})`
    };
    if (supportsTelemetry(productService, environmentService) && getTelemetryLevel(configurationService) === 3) {
        const serviceMachineId = await getServiceMachineId(environmentService, fileService, storageService);
        headers['X-Market-User-Id'] = serviceMachineId;
        headers['VSCode-SessionId'] = telemetryService.machineId || serviceMachineId;
    }
    return headers;
}
