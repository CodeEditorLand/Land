import './media/sidebarpart.css';
import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare class FocusSideBarAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
