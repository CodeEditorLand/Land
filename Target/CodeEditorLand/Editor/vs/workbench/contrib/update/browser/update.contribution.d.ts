import '../../../../platform/update/common/update.config.contribution.js';
import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare class ShowCurrentReleaseNotesAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ShowCurrentReleaseNotesFromCurrentFileAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class CheckForUpdateAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
