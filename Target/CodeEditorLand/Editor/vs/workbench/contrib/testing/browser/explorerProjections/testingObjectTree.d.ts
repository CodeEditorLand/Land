import { WorkbenchObjectTree } from '../../../../../platform/list/browser/listService.js';
import { TestExplorerTreeElement } from './index.js';
import { ISerializedTestTreeCollapseState } from './testingViewState.js';
export declare class TestingObjectTree<TFilterData = void> extends WorkbenchObjectTree<TestExplorerTreeElement, TFilterData> {
    getOptimizedViewState(updatePreviousState?: ISerializedTestTreeCollapseState): ISerializedTestTreeCollapseState;
}
