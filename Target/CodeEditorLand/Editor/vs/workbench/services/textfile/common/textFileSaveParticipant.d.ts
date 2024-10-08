import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProgress, IProgressService, IProgressStep } from '../../../../platform/progress/common/progress.js';
import { ITextFileSaveParticipant, ITextFileEditorModel, ITextFileSaveParticipantContext } from './textfiles.js';
import { IDisposable, Disposable } from '../../../../base/common/lifecycle.js';
export declare class TextFileSaveParticipant extends Disposable {
    private readonly logService;
    private readonly progressService;
    private readonly saveParticipants;
    constructor(logService: ILogService, progressService: IProgressService);
    addSaveParticipant(participant: ITextFileSaveParticipant): IDisposable;
    participate(model: ITextFileEditorModel, context: ITextFileSaveParticipantContext, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
    dispose(): void;
}
