import { Event } from '../../../base/common/event.js';
export declare const IExtensionHostDebugService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionHostDebugService>;
export interface IAttachSessionEvent {
    sessionId: string;
    subId?: string;
    port: number;
}
export interface ITerminateSessionEvent {
    sessionId: string;
    subId?: string;
}
export interface IReloadSessionEvent {
    sessionId: string;
}
export interface ICloseSessionEvent {
    sessionId: string;
}
export interface IOpenExtensionWindowResult {
    rendererDebugPort?: number;
    success: boolean;
}
export interface IExtensionHostDebugService {
    readonly _serviceBrand: undefined;
    reload(sessionId: string): void;
    readonly onReload: Event<IReloadSessionEvent>;
    close(sessionId: string): void;
    readonly onClose: Event<ICloseSessionEvent>;
    attachSession(sessionId: string, port: number, subId?: string): void;
    readonly onAttachSession: Event<IAttachSessionEvent>;
    terminateSession(sessionId: string, subId?: string): void;
    readonly onTerminateSession: Event<ITerminateSessionEvent>;
    openExtensionDevelopmentHostWindow(args: string[], debugRenderer: boolean): Promise<IOpenExtensionWindowResult>;
}
