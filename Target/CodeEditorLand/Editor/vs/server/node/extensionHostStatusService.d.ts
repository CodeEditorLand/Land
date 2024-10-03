import { IExtensionHostExitInfo } from '../../workbench/services/remote/common/remoteAgentService.js';
export declare const IExtensionHostStatusService: import("../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionHostStatusService>;
export interface IExtensionHostStatusService {
    readonly _serviceBrand: undefined;
    setExitInfo(reconnectionToken: string, info: IExtensionHostExitInfo): void;
    getExitInfo(reconnectionToken: string): IExtensionHostExitInfo | null;
}
export declare class ExtensionHostStatusService implements IExtensionHostStatusService {
    _serviceBrand: undefined;
    private readonly _exitInfo;
    setExitInfo(reconnectionToken: string, info: IExtensionHostExitInfo): void;
    getExitInfo(reconnectionToken: string): IExtensionHostExitInfo | null;
}
