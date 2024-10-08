import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ICommonProperties } from '../../../../platform/telemetry/common/telemetry.js';
export declare function resolveWorkbenchCommonProperties(storageService: IStorageService, commit: string | undefined, version: string | undefined, isInternalTelemetry: boolean, remoteAuthority?: string, productIdentifier?: string, removeMachineId?: boolean, resolveAdditionalProperties?: () => {
    [key: string]: any;
}): ICommonProperties;
