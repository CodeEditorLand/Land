import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProgress, IProgressService, IProgressStep } from '../../../../platform/progress/common/progress.js';
import { IDisposable, Disposable } from '../../../../base/common/lifecycle.js';
import { IStoredFileWorkingCopySaveParticipant, IStoredFileWorkingCopySaveParticipantContext } from './workingCopyFileService.js';
import { IStoredFileWorkingCopy, IStoredFileWorkingCopyModel } from './storedFileWorkingCopy.js';
export declare class StoredFileWorkingCopySaveParticipant extends Disposable {
    private readonly logService;
    private readonly progressService;
    private readonly saveParticipants;
    get length(): number;
    constructor(logService: ILogService, progressService: IProgressService);
    addSaveParticipant(participant: IStoredFileWorkingCopySaveParticipant): IDisposable;
    participate(workingCopy: IStoredFileWorkingCopy<IStoredFileWorkingCopyModel>, context: IStoredFileWorkingCopySaveParticipantContext, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
    dispose(): void;
}
