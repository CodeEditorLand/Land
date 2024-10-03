import { URI } from '../../../../base/common/uri.js';
import { IUntitledFileWorkingCopy, IUntitledFileWorkingCopyInitialContents, IUntitledFileWorkingCopyModel, IUntitledFileWorkingCopyModelFactory, IUntitledFileWorkingCopySaveDelegate } from './untitledFileWorkingCopy.js';
import { Event } from '../../../../base/common/event.js';
import { IWorkingCopyService } from './workingCopyService.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkingCopyBackupService } from './workingCopyBackup.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { BaseFileWorkingCopyManager, IBaseFileWorkingCopyManager } from './abstractFileWorkingCopyManager.js';
export interface IUntitledFileWorkingCopyManager<M extends IUntitledFileWorkingCopyModel> extends IBaseFileWorkingCopyManager<M, IUntitledFileWorkingCopy<M>> {
    readonly onDidChangeDirty: Event<IUntitledFileWorkingCopy<M>>;
    readonly onWillDispose: Event<IUntitledFileWorkingCopy<M>>;
    resolve(options?: INewUntitledFileWorkingCopyOptions): Promise<IUntitledFileWorkingCopy<M>>;
    resolve(options?: INewUntitledFileWorkingCopyWithAssociatedResourceOptions): Promise<IUntitledFileWorkingCopy<M>>;
    resolve(options?: INewOrExistingUntitledFileWorkingCopyOptions): Promise<IUntitledFileWorkingCopy<M>>;
}
export interface INewUntitledFileWorkingCopyOptions {
    contents?: IUntitledFileWorkingCopyInitialContents;
}
export interface INewUntitledFileWorkingCopyWithAssociatedResourceOptions extends INewUntitledFileWorkingCopyOptions {
    associatedResource: {
        authority?: string;
        path?: string;
        query?: string;
        fragment?: string;
    };
}
export interface INewOrExistingUntitledFileWorkingCopyOptions extends INewUntitledFileWorkingCopyOptions {
    untitledResource: URI;
    isScratchpad?: boolean;
}
export declare class UntitledFileWorkingCopyManager<M extends IUntitledFileWorkingCopyModel> extends BaseFileWorkingCopyManager<M, IUntitledFileWorkingCopy<M>> implements IUntitledFileWorkingCopyManager<M> {
    private readonly workingCopyTypeId;
    private readonly modelFactory;
    private readonly saveDelegate;
    private readonly labelService;
    private readonly workingCopyService;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: Event<IUntitledFileWorkingCopy<M>>;
    private readonly _onWillDispose;
    readonly onWillDispose: Event<IUntitledFileWorkingCopy<M>>;
    private readonly mapResourceToWorkingCopyListeners;
    constructor(workingCopyTypeId: string, modelFactory: IUntitledFileWorkingCopyModelFactory<M>, saveDelegate: IUntitledFileWorkingCopySaveDelegate<M>, fileService: IFileService, labelService: ILabelService, logService: ILogService, workingCopyBackupService: IWorkingCopyBackupService, workingCopyService: IWorkingCopyService);
    resolve(options?: INewUntitledFileWorkingCopyOptions): Promise<IUntitledFileWorkingCopy<M>>;
    resolve(options?: INewUntitledFileWorkingCopyWithAssociatedResourceOptions): Promise<IUntitledFileWorkingCopy<M>>;
    resolve(options?: INewOrExistingUntitledFileWorkingCopyOptions): Promise<IUntitledFileWorkingCopy<M>>;
    private doCreateOrGet;
    private massageOptions;
    private doCreate;
    private registerWorkingCopy;
    protected remove(resource: URI): boolean;
    dispose(): void;
}
