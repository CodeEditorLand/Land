import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { Action2 } from '../../../../../platform/actions/common/actions.js';
export declare function registerChatContextActions(): void;
export declare class AttachContextAction extends Action2 {
    static readonly ID = "workbench.action.chat.attachContext";
    private static _cdt;
    constructor();
    private _getFileContextId;
    private _attachContext;
    run(accessor: ServicesAccessor, ...args: any[]): Promise<void>;
    private _show;
}
