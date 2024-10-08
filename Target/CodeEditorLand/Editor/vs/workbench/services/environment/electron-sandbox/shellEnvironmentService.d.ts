import { IProcessEnvironment } from '../../../../base/common/platform.js';
export declare const IShellEnvironmentService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IShellEnvironmentService>;
export interface IShellEnvironmentService {
    readonly _serviceBrand: undefined;
    getShellEnv(): Promise<IProcessEnvironment>;
}
export declare class ShellEnvironmentService implements IShellEnvironmentService {
    readonly _serviceBrand: undefined;
    getShellEnv(): Promise<IProcessEnvironment>;
}
