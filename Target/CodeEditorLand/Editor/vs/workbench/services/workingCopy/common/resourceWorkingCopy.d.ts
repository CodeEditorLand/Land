import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ISaveOptions, IRevertOptions } from '../../../common/editor.js';
import { IWorkingCopy, IWorkingCopyBackup, IWorkingCopySaveEvent, WorkingCopyCapabilities } from './workingCopy.js';
export interface IResourceWorkingCopy extends IWorkingCopy, IDisposable {
    readonly onDidChangeOrphaned: Event<void>;
    isOrphaned(): boolean;
    readonly onWillDispose: Event<void>;
    isDisposed(): boolean;
}
export declare abstract class ResourceWorkingCopy extends Disposable implements IResourceWorkingCopy {
    readonly resource: URI;
    protected readonly fileService: IFileService;
    constructor(resource: URI, fileService: IFileService);
    private readonly _onDidChangeOrphaned;
    readonly onDidChangeOrphaned: Event<void>;
    private orphaned;
    isOrphaned(): boolean;
    private onDidFilesChange;
    protected setOrphaned(orphaned: boolean): void;
    private readonly _onWillDispose;
    readonly onWillDispose: Event<void>;
    isDisposed(): boolean;
    dispose(): void;
    isModified(): boolean;
    abstract typeId: string;
    abstract name: string;
    abstract capabilities: WorkingCopyCapabilities;
    abstract onDidChangeDirty: Event<void>;
    abstract onDidChangeContent: Event<void>;
    abstract onDidSave: Event<IWorkingCopySaveEvent>;
    abstract isDirty(): boolean;
    abstract backup(token: CancellationToken): Promise<IWorkingCopyBackup>;
    abstract save(options?: ISaveOptions): Promise<boolean>;
    abstract revert(options?: IRevertOptions): Promise<void>;
}
