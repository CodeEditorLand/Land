import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ICommonProperties } from '../../../../platform/telemetry/common/telemetry.js';
import { INodeProcess } from '../../../../base/common/platform.js';
export declare function resolveWorkbenchCommonProperties(storageService: IStorageService, release: string, hostname: string, commit: string | undefined, version: string | undefined, machineId: string, sqmId: string, devDeviceId: string, isInternalTelemetry: boolean, process: INodeProcess, remoteAuthority?: string): ICommonProperties;
