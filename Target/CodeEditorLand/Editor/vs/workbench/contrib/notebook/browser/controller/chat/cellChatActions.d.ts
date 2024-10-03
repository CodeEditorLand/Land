import { ServicesAccessor } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ICodeEditor } from '../../../../../../editor/browser/editorBrowser.js';
import { AbstractInlineChatAction } from '../../../../inlineChat/browser/inlineChatActions.js';
import { InlineChatController } from '../../../../inlineChat/browser/inlineChatController.js';
import { HunkInformation } from '../../../../inlineChat/browser/inlineChatSession.js';
export declare class AcceptChangesAndRun extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(accessor: ServicesAccessor, ctrl: InlineChatController, codeEditor: ICodeEditor, hunk?: HunkInformation | any): Promise<void>;
}
