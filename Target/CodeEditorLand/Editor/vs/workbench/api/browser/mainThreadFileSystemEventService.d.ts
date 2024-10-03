import { IFileService, IWatchOptions } from '../../../platform/files/common/files.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { MainThreadFileSystemEventServiceShape } from '../common/extHost.protocol.js';
import { IWorkingCopyFileService } from '../../services/workingCopy/common/workingCopyFileService.js';
import { IBulkEditService } from '../../../editor/browser/services/bulkEditService.js';
import { IProgressService } from '../../../platform/progress/common/progress.js';
import { IDialogService } from '../../../platform/dialogs/common/dialogs.js';
import { IStorageService } from '../../../platform/storage/common/storage.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IEnvironmentService } from '../../../platform/environment/common/environment.js';
import { IUriIdentityService } from '../../../platform/uriIdentity/common/uriIdentity.js';
import { UriComponents } from '../../../base/common/uri.js';
export declare class MainThreadFileSystemEventService implements MainThreadFileSystemEventServiceShape {
    private readonly _fileService;
    private readonly _logService;
    static readonly MementoKeyAdditionalEdits = "file.particpants.additionalEdits";
    private readonly _proxy;
    private readonly _listener;
    private readonly _watches;
    constructor(extHostContext: IExtHostContext, _fileService: IFileService, workingCopyFileService: IWorkingCopyFileService, bulkEditService: IBulkEditService, progressService: IProgressService, dialogService: IDialogService, storageService: IStorageService, logService: ILogService, envService: IEnvironmentService, uriIdentService: IUriIdentityService, _logService: ILogService);
    $watch(extensionId: string, session: number, resource: UriComponents, unvalidatedOpts: IWatchOptions, correlate: boolean): Promise<void>;
    $unwatch(session: number): void;
    dispose(): void;
}
