import { Action2 } from '../../../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../../../platform/instantiation/common/instantiation.js';
import './cellChatActions.js';
export declare class SelectAndInsertKernelVariableAction extends Action2 {
    constructor();
    static readonly ID = "notebook.chat.selectAndInsertKernelVariable";
    run(accessor: ServicesAccessor, ...args: any[]): Promise<void>;
    private addVariableReference;
}
