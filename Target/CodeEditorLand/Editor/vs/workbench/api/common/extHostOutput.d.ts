import { ExtHostOutputServiceShape } from './extHost.protocol.js';
import type * as vscode from 'vscode';
import { IExtHostRpcService } from './extHostRpcService.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ILoggerService, ILogService } from '../../../platform/log/common/log.js';
import { IExtHostConsumerFileSystem } from './extHostFileSystemConsumer.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { IExtHostFileSystemInfo } from './extHostFileSystemInfo.js';
export declare class ExtHostOutputService implements ExtHostOutputServiceShape {
    private readonly initData;
    private readonly extHostFileSystem;
    private readonly extHostFileSystemInfo;
    private readonly loggerService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly proxy;
    private readonly outputsLocation;
    private outputDirectoryPromise;
    private readonly extensionLogDirectoryPromise;
    private namePool;
    private readonly channels;
    private visibleChannelId;
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService, extHostFileSystem: IExtHostConsumerFileSystem, extHostFileSystemInfo: IExtHostFileSystemInfo, loggerService: ILoggerService, logService: ILogService);
    $setVisibleChannel(visibleChannelId: string | null): void;
    createOutputChannel(name: string, options: string | {
        log: true;
    } | undefined, extension: IExtensionDescription): vscode.OutputChannel | vscode.LogOutputChannel;
    private doCreateOutputChannel;
    private doCreateLogOutputChannel;
    private createExtensionLogDirectory;
    private createExtHostOutputChannel;
    private createExtHostLogOutputChannel;
}
export interface IExtHostOutputService extends ExtHostOutputService {
}
export declare const IExtHostOutputService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostOutputService>;
