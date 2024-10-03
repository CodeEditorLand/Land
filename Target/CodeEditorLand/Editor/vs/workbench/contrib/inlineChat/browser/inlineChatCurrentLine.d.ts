import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IEditorContribution } from '../../../../editor/common/editorCommon.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IChatAgentService } from '../../chat/common/chatAgents.js';
import { EditorAction2, ServicesAccessor } from '../../../../editor/browser/editorExtensions.js';
export declare const CTX_INLINE_CHAT_EXPANSION: RawContextKey<boolean>;
export declare class InlineChatExansionContextKey implements IEditorContribution {
    static Id: string;
    private readonly _store;
    private readonly _editorListener;
    private readonly _ctxInlineChatExpansion;
    constructor(editor: ICodeEditor, contextKeyService: IContextKeyService, chatAgentService: IChatAgentService);
    dispose(): void;
    private _install;
    private _uninstall;
}
export declare class InlineChatExpandLineAction extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
