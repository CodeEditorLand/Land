import { URI } from '../../../../../base/common/uri.js';
import { Action2 } from '../../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
export declare class MergeEditorCopyContentsToJSON extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class MergeEditorSaveContentsToFolder extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class MergeEditorLoadContentsFromFolder extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, args?: {
        folderUri?: URI;
        resultState?: 'initial' | 'current';
    }): Promise<void>;
}
