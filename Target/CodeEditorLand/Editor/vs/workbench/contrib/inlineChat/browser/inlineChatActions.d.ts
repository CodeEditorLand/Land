import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { EditorAction2 } from '../../../../editor/browser/editorExtensions.js';
import { InlineChatController } from './inlineChatController.js';
import { Action2, IAction2Options } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { HunkInformation } from './inlineChatSession.js';
export declare const START_INLINE_CHAT: import("../../../../base/common/themables.js").ThemeIcon;
export interface IHoldForSpeech {
    (accessor: ServicesAccessor, controller: InlineChatController, source: Action2): void;
}
export declare function setHoldForSpeech(holdForSpeech: IHoldForSpeech): void;
export declare class StartSessionAction extends EditorAction2 {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, ..._args: any[]): void;
}
export declare class UnstashSessionAction extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor, ..._args: any[]): Promise<void>;
}
export declare abstract class AbstractInlineChatAction extends EditorAction2 {
    static readonly category: import("../../../../nls.js").ILocalizedString;
    constructor(desc: IAction2Options);
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, ..._args: any[]): void;
    abstract runInlineChatCommand(accessor: ServicesAccessor, ctrl: InlineChatController, editor: ICodeEditor, ...args: any[]): void;
}
export declare class ArrowOutUpAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, ..._args: any[]): void;
}
export declare class ArrowOutDownAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, ..._args: any[]): void;
}
export declare class FocusInlineChat extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor, ..._args: any[]): void;
}
export declare class AcceptChanges extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, hunk?: HunkInformation | any): Promise<void>;
}
export declare class DiscardHunkAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, hunk?: HunkInformation | any): Promise<void>;
}
export declare class RerunAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, ..._args: any[]): Promise<void>;
}
export declare class CloseAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, ..._args: any[]): Promise<void>;
}
export declare class ConfigureInlineChatAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, ..._args: any[]): Promise<void>;
}
export declare class MoveToNextHunk extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(accessor: ServicesAccessor, ctrl: InlineChatController, editor: ICodeEditor, ...args: any[]): void;
}
export declare class MoveToPreviousHunk extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(accessor: ServicesAccessor, ctrl: InlineChatController, editor: ICodeEditor, ...args: any[]): void;
}
export declare class ViewInChatAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, ..._args: any[]): Promise<void>;
}
export declare class ToggleDiffForChange extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, hunkInfo: HunkInformation | any): void;
}
