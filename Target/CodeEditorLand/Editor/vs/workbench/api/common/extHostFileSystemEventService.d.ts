import { Event } from '../../../base/common/event.js';
import { ExtHostDocumentsAndEditors } from './extHostDocumentsAndEditors.js';
import type * as vscode from 'vscode';
import { ExtHostFileSystemEventServiceShape, FileSystemEvents, IMainContext, SourceTargetPair, IWillRunFileOperationParticipation } from './extHost.protocol.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { FileOperation } from '../../../platform/files/common/files.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IExtHostWorkspace } from './extHostWorkspace.js';
import { ExtHostConfigProvider } from './extHostConfiguration.js';
export interface FileSystemWatcherCreateOptions {
    readonly correlate: boolean;
    readonly ignoreCreateEvents?: boolean;
    readonly ignoreChangeEvents?: boolean;
    readonly ignoreDeleteEvents?: boolean;
    readonly excludes?: string[];
}
export declare class ExtHostFileSystemEventService implements ExtHostFileSystemEventServiceShape {
    private readonly _mainContext;
    private readonly _logService;
    private readonly _extHostDocumentsAndEditors;
    private readonly _onFileSystemEvent;
    private readonly _onDidRenameFile;
    private readonly _onDidCreateFile;
    private readonly _onDidDeleteFile;
    private readonly _onWillRenameFile;
    private readonly _onWillCreateFile;
    private readonly _onWillDeleteFile;
    readonly onDidRenameFile: Event<vscode.FileRenameEvent>;
    readonly onDidCreateFile: Event<vscode.FileCreateEvent>;
    readonly onDidDeleteFile: Event<vscode.FileDeleteEvent>;
    constructor(_mainContext: IMainContext, _logService: ILogService, _extHostDocumentsAndEditors: ExtHostDocumentsAndEditors);
    createFileSystemWatcher(workspace: IExtHostWorkspace, configProvider: ExtHostConfigProvider, extension: IExtensionDescription, globPattern: vscode.GlobPattern, options: FileSystemWatcherCreateOptions): vscode.FileSystemWatcher;
    $onFileEvent(events: FileSystemEvents): void;
    $onDidRunFileOperation(operation: FileOperation, files: SourceTargetPair[]): void;
    getOnWillRenameFileEvent(extension: IExtensionDescription): Event<vscode.FileWillRenameEvent>;
    getOnWillCreateFileEvent(extension: IExtensionDescription): Event<vscode.FileWillCreateEvent>;
    getOnWillDeleteFileEvent(extension: IExtensionDescription): Event<vscode.FileWillDeleteEvent>;
    private _createWillExecuteEvent;
    $onWillRunFileOperation(operation: FileOperation, files: SourceTargetPair[], timeout: number, token: CancellationToken): Promise<IWillRunFileOperationParticipation | undefined>;
    private _fireWillEvent;
}
