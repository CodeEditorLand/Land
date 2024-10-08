import { RawContextKey, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ISnippetsService } from './snippets.js';
import { IEditorContribution } from '../../../../editor/common/editorCommon.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
export declare class TabCompletionController implements IEditorContribution {
    private readonly _editor;
    private readonly _snippetService;
    private readonly _clipboardService;
    private readonly _languageFeaturesService;
    static readonly ID = "editor.tabCompletionController";
    static readonly ContextKey: RawContextKey<boolean>;
    static get(editor: ICodeEditor): TabCompletionController | null;
    private readonly _hasSnippets;
    private readonly _configListener;
    private _enabled?;
    private _selectionListener?;
    private _activeSnippets;
    private _completionProvider?;
    constructor(_editor: ICodeEditor, _snippetService: ISnippetsService, _clipboardService: IClipboardService, _languageFeaturesService: ILanguageFeaturesService, contextKeyService: IContextKeyService);
    dispose(): void;
    private _update;
    private _updateSnippets;
    performSnippetCompletions(): Promise<void>;
}
