import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { URI } from '../../../../base/common/uri.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkingCopyBackupService } from './workingCopyBackup.js';
import { IFileWorkingCopy, IFileWorkingCopyModel } from './fileWorkingCopy.js';
export interface IBaseFileWorkingCopyManager<M extends IFileWorkingCopyModel, W extends IFileWorkingCopy<M>> extends IDisposable {
    readonly onDidCreate: Event<W>;
    readonly workingCopies: readonly W[];
    get(resource: URI): W | undefined;
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
