import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { URI } from '../../../../base/common/uri.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkingCopyBackupService } from './workingCopyBackup.js';
import { IFileWorkingCopy, IFileWorkingCopyModel } from './fileWorkingCopy.js';
export interface IBaseFileWorkingCopyManager<M extends IFileWorkingCopyModel, W extends IFileWorkingCopy<M>> extends IDisposable {
    /**
     * An event for when a file working copy was created.
     */
    readonly onDidCreate: Event<W>;
    /**
     * Access to all known file working copies within the manager.
     */
    readonly workingCopies: readonly W[];
    /**
     * Returns the file working copy for the provided resource
     * or `undefined` if none.
     */
    get(resource: URI): W | undefined;
    /**
     * Disposes all working copies of the manager and disposes the manager. This
     * method is different from `dispose` in that it will unregister any working
     * copy from the `IWorkingCopyService`. Since this impact things like backups,
     * the method is `async` because it needs to trigger `save` for any dirty
     * working copy to preserve the data.
     *
     * Callers should make sure to e.g. close any editors associated with the
     * working copy.
     */
    destroy(): Promise<void>;
}
export declare abstract class BaseFileWorkingCopyManager<M extends IFileWorkingCopyModel, W extends IFileWorkingCopy<M>> extends Disposable implements IBaseFileWorkingCopyManager<M, W> {
    protected readonly fileService: IFileService;
    protected readonly logService: ILogService;
    protected readonly workingCopyBackupService: IWorkingCopyBackupService;
    private readonly _onDidCreate;
    readonly onDidCreate: Event<W>;
    private readonly mapResourceToWorkingCopy;
    private readonly mapResourceToDisposeListener;
    constructor(fileService: IFileService, logService: ILogService, workingCopyBackupService: IWorkingCopyBackupService);
    protected has(resource: URI): boolean;
    protected add(resource: URI, workingCopy: W): void;
    protected remove(resource: URI): boolean;
    get workingCopies(): W[];
    get(resource: URI): W | undefined;
    dispose(): void;
    destroy(): Promise<void>;
    private saveWithFallback;
}
