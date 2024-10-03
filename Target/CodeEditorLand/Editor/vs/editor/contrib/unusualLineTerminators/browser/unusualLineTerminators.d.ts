import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { ICodeEditorService } from '../../../browser/services/codeEditorService.js';
import { IEditorContribution } from '../../../common/editorCommon.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
export declare class UnusualLineTerminatorsDetector extends Disposable implements IEditorContribution {
    private readonly _editor;
    private readonly _dialogService;
    private readonly _codeEditorService;
    static readonly ID = "editor.contrib.unusualLineTerminatorsDetector";
    private _config;
    private _isPresentingDialog;
    constructor(_editor: ICodeEditor, _dialogService: IDialogService, _codeEditorService: ICodeEditorService);
    private _checkForUnusualLineTerminators;
}
