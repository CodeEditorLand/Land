import { INodeProcess, IProcessEnvironment } from '../../../common/platform.js';
import { ISandboxConfiguration } from '../common/sandboxTypes.js';
import { IpcRenderer, ProcessMemoryInfo, WebFrame, WebUtils } from './electronTypes.js';
export interface ISandboxNodeProcess extends INodeProcess {
    readonly platform: string;
    readonly arch: string;
    readonly type: string;
    readonly versions: {
        [key: string]: string | undefined;
    };
    readonly env: IProcessEnvironment;
    readonly execPath: string;
    on: (type: string, callback: Function) => void;
    cwd: () => string;
    getProcessMemoryInfo: () => Promise<ProcessMemoryInfo>;
    shellEnv(): Promise<IProcessEnvironment>;
}
export interface IpcMessagePort {
    acquire(responseChannel: string, nonce: string): void;
}
export interface ISandboxContext {
    configuration(): ISandboxConfiguration | undefined;
    resolveConfiguration(): Promise<ISandboxConfiguration>;
}
export declare const ipcRenderer: IpcRenderer;
export declare const ipcMessagePort: IpcMessagePort;
export declare const webFrame: WebFrame;
export declare const process: ISandboxNodeProcess;
export declare const context: ISandboxContext;
export declare const webUtils: WebUtils;
export interface IMainWindowSandboxGlobals {
    readonly ipcRenderer: IpcRenderer;
    readonly ipcMessagePort: IpcMessagePort;
    readonly webFrame: WebFrame;
    readonly process: ISandboxNodeProcess;
    readonly context: ISandboxContext;
    readonly webUtils: WebUtils;
}
export interface ISandboxGlobals {
    readonly ipcRenderer: Pick<import('./electronTypes.js').IpcRenderer, 'send' | 'invoke'>;
    readonly webFrame: import('./electronTypes.js').WebFrame;
}
