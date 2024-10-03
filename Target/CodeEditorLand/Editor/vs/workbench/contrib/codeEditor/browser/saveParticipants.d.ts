import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ITextFileEditorModel, ITextFileSaveParticipant, ITextFileSaveParticipantContext, ITextFileService } from '../../../services/textfile/common/textfiles.js';
export declare class TrimWhitespaceParticipant implements ITextFileSaveParticipant {
    private readonly configurationService;
    private readonly codeEditorService;
    constructor(configurationService: IConfigurationService, codeEditorService: ICodeEditorService);
    participate(model: ITextFileEditorModel, context: ITextFileSaveParticipantContext): Promise<void>;
    private doTrimTrailingWhitespace;
}
export declare class FinalNewLineParticipant implements ITextFileSaveParticipant {
    private readonly configurationService;
    private readonly codeEditorService;
    constructor(configurationService: IConfigurationService, codeEditorService: ICodeEditorService);
    participate(model: ITextFileEditorModel, context: ITextFileSaveParticipantContext): Promise<void>;
    private doInsertFinalNewLine;
}
export declare class TrimFinalNewLinesParticipant implements ITextFileSaveParticipant {
    private readonly configurationService;
    private readonly codeEditorService;
    constructor(configurationService: IConfigurationService, codeEditorService: ICodeEditorService);
    participate(model: ITextFileEditorModel, context: ITextFileSaveParticipantContext): Promise<void>;
    private findLastNonEmptyLine;
    private doTrimFinalNewLines;
}
export declare class SaveParticipantsContribution extends Disposable implements IWorkbenchContribution {
    private readonly instantiationService;
    private readonly textFileService;
    constructor(instantiationService: IInstantiationService, textFileService: ITextFileService);
    private registerSaveParticipants;
}
