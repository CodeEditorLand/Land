import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare class GoToFileAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): Promise<void>;
}
export declare class CollapseAllAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
}
export declare class ExpandAllAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
}
