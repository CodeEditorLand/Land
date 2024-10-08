import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { HierarchicalKind } from '../../../../../../base/common/hierarchicalKind.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { CodeActionProvider } from '../../../../../../editor/common/languages.js';
import { ITextModel } from '../../../../../../editor/common/model.js';
import { ILanguageFeaturesService } from '../../../../../../editor/common/services/languageFeatures.js';
import { IInstantiationService, ServicesAccessor } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IProgress, IProgressStep } from '../../../../../../platform/progress/common/progress.js';
import { IWorkbenchContribution } from '../../../../../common/contributions.js';
import { NotebookTextModel } from '../../../common/model/notebookTextModel.js';
import { IWorkingCopyFileService } from '../../../../../services/workingCopy/common/workingCopyFileService.js';
export declare class CodeActionParticipantUtils {
    static checkAndRunFormatCodeAction(accessor: ServicesAccessor, notebookModel: NotebookTextModel, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<boolean>;
    static applyOnSaveGenericCodeActions(accessor: ServicesAccessor, model: ITextModel, codeActionsOnSave: readonly HierarchicalKind[], excludes: readonly HierarchicalKind[], progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
    static applyOnSaveFormatCodeAction(accessor: ServicesAccessor, model: ITextModel, formatCodeActionOnSave: HierarchicalKind, excludes: readonly HierarchicalKind[], extensionId: string | undefined, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<boolean>;
    static getActionsToRun(model: ITextModel, codeActionKind: HierarchicalKind, excludes: readonly HierarchicalKind[], languageFeaturesService: ILanguageFeaturesService, progress: IProgress<CodeActionProvider>, token: CancellationToken): Promise<import("../../../../../../editor/contrib/codeAction/common/types.js").CodeActionSet>;
}
export declare class SaveParticipantsContribution extends Disposable implements IWorkbenchContribution {
    private readonly instantiationService;
    private readonly workingCopyFileService;
    constructor(instantiationService: IInstantiationService, workingCopyFileService: IWorkingCopyFileService);
    private registerSaveParticipants;
}
