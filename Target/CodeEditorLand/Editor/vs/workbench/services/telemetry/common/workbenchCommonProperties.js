import { resolveCommonProperties } from '../../../../platform/telemetry/common/commonProperties.js';
import { firstSessionDateStorageKey, lastSessionDateStorageKey } from '../../../../platform/telemetry/common/telemetry.js';
import { cleanRemoteAuthority } from '../../../../platform/telemetry/common/telemetryUtils.js';
export function resolveWorkbenchCommonProperties(storageService, release, hostname, commit, version, machineId, sqmId, devDeviceId, isInternalTelemetry, process, remoteAuthority) {
    const result = resolveCommonProperties(release, hostname, process.arch, commit, version, machineId, sqmId, devDeviceId, isInternalTelemetry);
    const firstSessionDate = storageService.get(firstSessionDateStorageKey, -1);
    const lastSessionDate = storageService.get(lastSessionDateStorageKey, -1);
    result['common.version.shell'] = process.versions?.['electron'];
    result['common.version.renderer'] = process.versions?.['chrome'];
    result['common.firstSessionDate'] = firstSessionDate;
    result['common.lastSessionDate'] = lastSessionDate || '';
    result['common.isNewSession'] = !lastSessionDate ? '1' : '0';
    result['common.remoteAuthority'] = cleanRemoteAuthority(remoteAuthority);
    result['common.cli'] = !!process.env['VSCODE_CLI'];
    return result;
}
