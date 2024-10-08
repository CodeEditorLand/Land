import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IEditorContribution } from '../../../../editor/common/editorCommon.js';
import { IEditorWorkerService } from '../../../../editor/common/services/editorWorker.js';
import { IChatEditingService } from '../common/chatEditingService.js';
export declare class ChatEditorController extends Disposable implements IEditorContribution {
    private readonly _editor;
    private readonly _chatEditingService;
    private readonly _editorWorkerService;
    static readonly ID = "editor.contrib.chatEditorController";
    private readonly _sessionStore;
    private readonly _decorations;
    private _viewZones;
    constructor(_editor: ICodeEditor, _chatEditingService: IChatEditingService, _editorWorkerService: IEditorWorkerService);
    private _update;
    private _updateSessionDecorations;
    private _getEntry;
    private _clearRendering;
    private _updateWithDiff;
}
