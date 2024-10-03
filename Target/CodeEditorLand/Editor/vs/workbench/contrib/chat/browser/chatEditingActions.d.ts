import { ServicesAccessor } from '../../../../editor/browser/editorExtensions.js';
import { Action2 } from '../../../../platform/actions/common/actions.js';
export declare class ChatEditingAcceptAllAction extends Action2 {
    static readonly ID = "chatEditing.acceptAllFiles";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): Promise<void>;
}
export declare class ChatEditingDiscardAllAction extends Action2 {
    static readonly ID = "chatEditing.discardAllFiles";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): Promise<void>;
}
export declare class ChatEditingShowChangesAction extends Action2 {
    static readonly ID = "chatEditing.openDiffs";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): Promise<void>;
}
