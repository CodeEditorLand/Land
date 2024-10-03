import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { InlineChatController } from '../browser/inlineChatController.js';
import { AbstractInlineChatAction } from '../browser/inlineChatActions.js';
export declare class HoldToSpeak extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(accessor: ServicesAccessor, ctrl: InlineChatController, editor: ICodeEditor, ...args: any[]): void;
}
