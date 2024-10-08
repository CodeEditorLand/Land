import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare class ToggleMinimapAction extends Action2 {
    static readonly ID = "editor.action.toggleMinimap";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
