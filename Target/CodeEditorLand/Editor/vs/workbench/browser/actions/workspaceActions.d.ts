import { ITelemetryData } from '../../../platform/telemetry/common/telemetry.js';
import { Action2 } from '../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../platform/instantiation/common/instantiation.js';
import { ILocalizedString } from '../../../platform/action/common/action.js';
export declare class OpenFileAction extends Action2 {
    static readonly ID = "workbench.action.files.openFile";
    constructor();
    run(accessor: ServicesAccessor, data?: ITelemetryData): Promise<void>;
}
export declare class OpenFolderAction extends Action2 {
    static readonly ID = "workbench.action.files.openFolder";
    constructor();
    run(accessor: ServicesAccessor, data?: ITelemetryData): Promise<void>;
}
export declare class OpenFolderViaWorkspaceAction extends Action2 {
    static readonly ID = "workbench.action.files.openFolderViaWorkspace";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class OpenFileFolderAction extends Action2 {
    static readonly ID = "workbench.action.files.openFileFolder";
    static readonly LABEL: ILocalizedString;
    constructor();
    run(accessor: ServicesAccessor, data?: ITelemetryData): Promise<void>;
}
export declare class AddRootFolderAction extends Action2 {
    static readonly ID = "workbench.action.addRootFolder";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class RemoveRootFolderAction extends Action2 {
    static readonly ID = "workbench.action.removeRootFolder";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
