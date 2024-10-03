import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IExtHostRpcService } from './extHostRpcService.js';
export interface IExtHostApiDeprecationService {
    readonly _serviceBrand: undefined;
    report(apiId: string, extension: IExtensionDescription, migrationSuggestion: string): void;
}
export declare const IExtHostApiDeprecationService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostApiDeprecationService>;
export declare class ExtHostApiDeprecationService implements IExtHostApiDeprecationService {
    private readonly _extHostLogService;
    readonly _serviceBrand: undefined;
    private readonly _reportedUsages;
    private readonly _telemetryShape;
    constructor(rpc: IExtHostRpcService, _extHostLogService: ILogService);
    report(apiId: string, extension: IExtensionDescription, migrationSuggestion: string): void;
    private getUsageKey;
}
export declare const NullApiDeprecationService: Readonly<{
    readonly _serviceBrand: undefined;
    report(_apiId: string, _extension: IExtensionDescription, _warningMessage: string): void;
}>;
