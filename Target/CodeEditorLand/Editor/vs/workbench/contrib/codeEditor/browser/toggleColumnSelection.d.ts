import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare class ToggleColumnSelectionAction extends Action2 {
    static readonly ID = "editor.action.toggleColumnSelection";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
    private _getCodeEditor;
}
