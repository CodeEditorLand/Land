import { Action2 } from '../../../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../../../platform/instantiation/common/instantiation.js';
export declare class ToggleCellToolbarPositionAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, context: any): Promise<void>;
    togglePosition(viewType: string, toolbarPosition: string | {
        [key: string]: string;
    }): {
        [key: string]: string;
    };
}
