import { WorkbenchObjectTree } from '../../../../../platform/list/browser/listService.js';
import { TestExplorerTreeElement } from './index.js';
import { ISerializedTestTreeCollapseState } from './testingViewState.js';
export declare class TestingObjectTree<TFilterData = void> extends WorkbenchObjectTree<TestExplorerTreeElement, TFilterData> {
    /**
     * Gets a serialized view state for the tree, optimized for storage.
     *
     * @param updatePreviousState Optional previous state to mutate and update
     * instead of creating a new one.
     */
    getOptimizedViewState(updatePreviousState?: ISerializedTestTreeCollapseState): ISerializedTestTreeCollapseState;
}
