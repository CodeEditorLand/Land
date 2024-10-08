import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { IEditorContribution } from '../../../common/editorCommon.js';
import { IEditorWorkerService } from '../../../common/services/editorWorker.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
export declare class FormatOnType implements IEditorContribution {
    private readonly _editor;
    private readonly _languageFeaturesService;
    private readonly _workerService;
    private readonly _accessibilitySignalService;
    static readonly ID = "editor.contrib.autoFormat";
    private readonly _disposables;
    private readonly _sessionDisposables;
    constructor(_editor: ICodeEditor, _languageFeaturesService: ILanguageFeaturesService, _workerService: IEditorWorkerService, _accessibilitySignalService: IAccessibilitySignalService);
    dispose(): void;
    private _update;
    private _trigger;
}
