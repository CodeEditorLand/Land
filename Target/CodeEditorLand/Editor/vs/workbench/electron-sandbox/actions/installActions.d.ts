import { Action2 } from '../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../platform/instantiation/common/instantiation.js';
export declare class InstallShellScriptAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class UninstallShellScriptAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
