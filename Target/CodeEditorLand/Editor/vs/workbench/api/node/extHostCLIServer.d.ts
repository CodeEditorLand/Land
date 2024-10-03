import { IExtHostCommands } from '../common/extHostCommands.js';
import { ILogService } from '../../../platform/log/common/log.js';
export interface OpenCommandPipeArgs {
    type: 'open';
    fileURIs?: string[];
    folderURIs?: string[];
    forceNewWindow?: boolean;
    diffMode?: boolean;
    mergeMode?: boolean;
    addMode?: boolean;
    gotoLineMode?: boolean;
    forceReuseWindow?: boolean;
    waitMarkerFilePath?: string;
    remoteAuthority?: string | null;
}
export interface OpenExternalCommandPipeArgs {
    type: 'openExternal';
    uris: string[];
}
export interface StatusPipeArgs {
    type: 'status';
}
export interface ExtensionManagementPipeArgs {
    type: 'extensionManagement';
    list?: {
        showVersions?: boolean;
        category?: string;
    };
    install?: string[];
    uninstall?: string[];
    force?: boolean;
}
export type PipeCommand = OpenCommandPipeArgs | StatusPipeArgs | OpenExternalCommandPipeArgs | ExtensionManagementPipeArgs;
export interface ICommandsExecuter {
    executeCommand<T>(id: string, ...args: any[]): Promise<T>;
}
export declare class CLIServerBase {
    private readonly _commands;
    private readonly logService;
    private readonly _ipcHandlePath;
    private readonly _server;
    constructor(_commands: ICommandsExecuter, logService: ILogService, _ipcHandlePath: string);
    get ipcHandlePath(): string;
    private setup;
    private onRequest;
    private open;
    private openExternal;
    private manageExtensions;
    private getStatus;
    dispose(): void;
}
export declare class CLIServer extends CLIServerBase {
    constructor(commands: IExtHostCommands, logService: ILogService);
}
