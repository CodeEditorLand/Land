import { Event } from '../../../base/common/event.js';
export declare const IExtensionHostStarter: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionHostStarter>;
export declare const ipcExtensionHostStarterChannelName = "extensionHostStarter";
export interface IExtensionHostProcessOptions {
    responseWindowId: number;
    responseChannel: string;
    responseNonce: string;
    env: {
        [key: string]: string | undefined;
    };
    detached: boolean;
    execArgv: string[] | undefined;
    silent: boolean;
}
export interface IExtensionHostStarter {
    readonly _serviceBrand: undefined;
    onDynamicStdout(id: string): Event<string>;
    onDynamicStderr(id: string): Event<string>;
    onDynamicMessage(id: string): Event<any>;
    onDynamicExit(id: string): Event<{
        code: number;
        signal: string;
    }>;
    createExtensionHost(): Promise<{
        id: string;
    }>;
    start(id: string, opts: IExtensionHostProcessOptions): Promise<{
        pid: number | undefined;
    }>;
    enableInspectPort(id: string): Promise<boolean>;
    kill(id: string): Promise<void>;
}
