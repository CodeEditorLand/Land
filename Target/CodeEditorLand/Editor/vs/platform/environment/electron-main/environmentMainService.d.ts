import { INativeEnvironmentService } from '../common/environment.js';
import { NativeEnvironmentService } from '../node/environmentService.js';
export declare const IEnvironmentMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IEnvironmentMainService>;
export interface IEnvironmentMainService extends INativeEnvironmentService {
    readonly backupHome: string;
    readonly codeCachePath: string | undefined;
    readonly useCodeCache: boolean;
    readonly mainIPCHandle: string;
    readonly mainLockfile: string;
    readonly disableUpdates: boolean;
    unsetSnapExportedVariables(): void;
    restoreSnapExportedVariables(): void;
}
export declare class EnvironmentMainService extends NativeEnvironmentService implements IEnvironmentMainService {
    private _snapEnv;
    get backupHome(): string;
    get mainIPCHandle(): string;
    get mainLockfile(): string;
    get disableUpdates(): boolean;
    get crossOriginIsolated(): boolean;
    get codeCachePath(): string | undefined;
    get useCodeCache(): boolean;
    unsetSnapExportedVariables(): void;
    restoreSnapExportedVariables(): void;
}
