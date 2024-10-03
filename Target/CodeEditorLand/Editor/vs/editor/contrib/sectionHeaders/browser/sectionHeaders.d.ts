import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { IEditorContribution } from '../../../common/editorCommon.js';
import { ILanguageConfigurationService } from '../../../common/languages/languageConfigurationRegistry.js';
import { IEditorWorkerService } from '../../../common/services/editorWorker.js';
export declare class SectionHeaderDetector extends Disposable implements IEditorContribution {
    private readonly editor;
    private readonly languageConfigurationService;
    private readonly editorWorkerService;
    static readonly ID: string;
    private options;
    private decorations;
    private computeSectionHeaders;
    private computePromise;
    private currentOccurrences;
    constructor(editor: ICodeEditor, languageConfigurationService: ILanguageConfigurationService, editorWorkerService: IEditorWorkerService);
    private createOptions;
    private findSectionHeaders;
    private updateDecorations;
    private stop;
    dispose(): void;
}
