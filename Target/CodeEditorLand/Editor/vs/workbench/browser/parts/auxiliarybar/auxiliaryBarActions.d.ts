import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare class ToggleAuxiliaryBarAction extends Action2 {
    static readonly ID = "workbench.action.toggleAuxiliaryBar";
    static readonly LABEL: import("../../../../nls.js").ILocalizedString;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
