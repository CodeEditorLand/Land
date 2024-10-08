import { Action2, IAction2Options } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { MergeEditorViewModel } from '../browser/view/viewModel.js';
import { MergeEditorContents } from '../common/mergeEditor.js';
export declare class MergeEditorOpenContentsFromJSON extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, args?: {
        data?: MergeEditorContents;
        resultState?: 'initial' | 'current';
    }): Promise<void>;
}
declare abstract class MergeEditorAction extends Action2 {
    constructor(desc: Readonly<IAction2Options>);
    run(accessor: ServicesAccessor): void;
    abstract runWithViewModel(viewModel: MergeEditorViewModel, accessor: ServicesAccessor): void;
}
export declare class OpenSelectionInTemporaryMergeEditor extends MergeEditorAction {
    constructor();
    runWithViewModel(viewModel: MergeEditorViewModel, accessor: ServicesAccessor): Promise<void>;
}
export {};
