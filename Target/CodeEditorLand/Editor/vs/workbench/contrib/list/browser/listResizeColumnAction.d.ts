import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { Action2 } from '../../../../platform/actions/common/actions.js';
export declare class ListResizeColumnAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
