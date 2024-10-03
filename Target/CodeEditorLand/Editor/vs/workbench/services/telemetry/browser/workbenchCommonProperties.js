import * as Platform from '../../../../base/common/platform.js';
import * as uuid from '../../../../base/common/uuid.js';
import { cleanRemoteAuthority } from '../../../../platform/telemetry/common/telemetryUtils.js';
import { mixin } from '../../../../base/common/objects.js';
import { firstSessionDateStorageKey, lastSessionDateStorageKey, machineIdKey } from '../../../../platform/telemetry/common/telemetry.js';
import { Gesture } from '../../../../base/browser/touch.js';
function cleanUserAgent(userAgent) {
    return userAgent.replace(/(\d+\.\d+)(\.\d+)+/g, '$1');
}
export function resolveWorkbenchCommonProperties(storageService, commit, version, isInternalTelemetry, remoteAuthority, productIdentifier, removeMachineId, resolveAdditionalProperties) {
    const result = Object.create(null);
    const firstSessionDate = storageService.get(firstSessionDateStorageKey, -1);
    const lastSessionDate = storageService.get(lastSessionDateStorageKey, -1);
    let machineId;
    if (!removeMachineId) {
        machineId = storageService.get(machineIdKey, -1);
        if (!machineId) {
            machineId = uuid.generateUuid();
            storageService.store(machineIdKey, machineId, -1, 1);
        }
    }
    else {
        machineId = `Redacted-${productIdentifier ?? 'web'}`;
    }
    result['common.firstSessionDate'] = firstSessionDate;
    result['common.lastSessionDate'] = lastSessionDate || '';
    result['common.isNewSession'] = !lastSessionDate ? '1' : '0';
    result['common.remoteAuthority'] = cleanRemoteAuthority(remoteAuthority);
    result['common.machineId'] = machineId;
    result['sessionID'] = uuid.generateUuid() + Date.now();
    result['commitHash'] = commit;
    result['version'] = version;
    result['common.platform'] = Platform.PlatformToString(Platform.platform);
    result['common.product'] = productIdentifier ?? 'web';
    result['common.userAgent'] = Platform.userAgent ? cleanUserAgent(Platform.userAgent) : undefined;
    result['common.isTouchDevice'] = String(Gesture.isTouchDevice());
    if (isInternalTelemetry) {
        result['common.msftInternal'] = isInternalTelemetry;
    }
    let seq = 0;
    const startTime = Date.now();
    Object.defineProperties(result, {
        'timestamp': {
            get: () => new Date(),
            enumerable: true
        },
        'common.timesincesessionstart': {
            get: () => Date.now() - startTime,
            enumerable: true
        },
        'common.sequence': {
            get: () => seq++,
            enumerable: true
        }
    });
    if (resolveAdditionalProperties) {
        mixin(result, resolveAdditionalProperties());
    }
    return result;
}
