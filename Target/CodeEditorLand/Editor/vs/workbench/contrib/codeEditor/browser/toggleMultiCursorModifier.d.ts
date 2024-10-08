import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare class ToggleMultiCursorModifierAction extends Action2 {
    static readonly ID = "workbench.action.toggleMultiCursorModifier";
    private static readonly multiCursorModifierConfigurationKey;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
