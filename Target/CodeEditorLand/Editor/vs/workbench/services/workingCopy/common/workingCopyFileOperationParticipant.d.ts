import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IDisposable, Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkingCopyFileOperationParticipant, SourceTargetPair, IFileOperationUndoRedoInfo } from './workingCopyFileService.js';
import { FileOperation } from '../../../../platform/files/common/files.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
export declare class WorkingCopyFileOperationParticipant extends Disposable {
    private readonly logService;
    private readonly configurationService;
    private readonly participants;
    constructor(logService: ILogService, configurationService: IConfigurationService);
    addFileOperationParticipant(participant: IWorkingCopyFileOperationParticipant): IDisposable;
    participate(files: SourceTargetPair[], operation: FileOperation, undoInfo: IFileOperationUndoRedoInfo | undefined, token: CancellationToken): Promise<void>;
    dispose(): void;
}
