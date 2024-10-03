import { Event } from '../../../../base/common/event.js';
import { VSBufferReadableStream } from '../../../../base/common/buffer.js';
import { IWorkingCopyBackup, IWorkingCopySaveEvent } from './workingCopy.js';
import { IFileWorkingCopy, IFileWorkingCopyModel, IFileWorkingCopyModelFactory } from './fileWorkingCopy.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IWorkingCopyService } from './workingCopyService.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ISaveOptions } from '../../../common/editor.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkingCopyBackupService } from './workingCopyBackup.js';
export interface IUntitledFileWorkingCopyModelFactory<M extends IUntitledFileWorkingCopyModel> extends IFileWorkingCopyModelFactory<M> {
}
export interface IUntitledFileWorkingCopyModel extends IFileWorkingCopyModel {
    readonly onDidChangeContent: Event<IUntitledFileWorkingCopyModelContentChangedEvent>;
}
export interface IUntitledFileWorkingCopyModelContentChangedEvent {
    readonly isInitial: boolean;
}
export interface IUntitledFileWorkingCopy<M extends IUntitledFileWorkingCopyModel> extends IFileWorkingCopy<M> {
    readonly hasAssociatedFilePath: boolean;
    isResolved(): this is IResolvedUntitledFileWorkingCopy<M>;
}
export interface IResolvedUntitledFileWorkingCopy<M extends IUntitledFileWorkingCopyModel> extends IUntitledFileWorkingCopy<M> {
    readonly model: M;
}
export interface IUntitledFileWorkingCopySaveDelegate<M extends IUntitledFileWorkingCopyModel> {
    (workingCopy: IUntitledFileWorkingCopy<M>, options?: ISaveOptions): Promise<boolean>;
}
export interface IUntitledFileWorkingCopyInitialContents {
    readonly value: VSBufferReadableStream;
    readonly markModified?: boolean;
}
export declare class UntitledFileWorkingCopy<M extends IUntitledFileWorkingCopyModel> extends Disposable implements IUntitledFileWorkingCopy<M> {
    readonly typeId: string;
    readonly resource: URI;
    readonly name: string;
    readonly hasAssociatedFilePath: boolean;
    private readonly isScratchpad;
    private readonly initialContents;
    private readonly modelFactory;
    private readonly saveDelegate;
    private readonly workingCopyBackupService;
    private readonly logService;
    readonly capabilities: number;
    private _model;
    get model(): M | undefined;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<void>;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: Event<void>;
    private readonly _onDidSave;
    readonly onDidSave: Event<IWorkingCopySaveEvent>;
    private readonly _onDidRevert;
    readonly onDidRevert: Event<void>;
    private readonly _onWillDispose;
    readonly onWillDispose: Event<void>;
    constructor(typeId: string, resource: URI, name: string, hasAssociatedFilePath: boolean, isScratchpad: boolean, initialContents: IUntitledFileWorkingCopyInitialContents | undefined, modelFactory: IUntitledFileWorkingCopyModelFactory<M>, saveDelegate: IUntitledFileWorkingCopySaveDelegate<M>, workingCopyService: IWorkingCopyService, workingCopyBackupService: IWorkingCopyBackupService, logService: ILogService);
    private modified;
    isDirty(): boolean;
    isModified(): boolean;
    private setModified;
    resolve(): Promise<void>;
    private doCreateModel;
    private installModelListeners;
    private onModelContentChanged;
    isResolved(): this is IResolvedUntitledFileWorkingCopy<M>;
    get backupDelay(): number | undefined;
    backup(token: CancellationToken): Promise<IWorkingCopyBackup>;
    save(options?: ISaveOptions): Promise<boolean>;
    revert(): Promise<void>;
    dispose(): void;
    private trace;
}
