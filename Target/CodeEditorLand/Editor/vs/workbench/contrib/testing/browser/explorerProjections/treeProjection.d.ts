import { ObjectTree } from '../../../../../base/browser/ui/tree/objectTree.js';
import { FuzzyScore } from '../../../../../base/common/filters.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ITestTreeProjection, TestExplorerTreeElement, TestItemTreeElement } from './index.js';
import { ISerializedTestTreeCollapseState } from './testingViewState.js';
import { ITestResultService } from '../../common/testResultService.js';
import { ITestService } from '../../common/testService.js';
export declare class TreeProjection extends Disposable implements ITestTreeProjection {
    lastState: ISerializedTestTreeCollapseState;
    private readonly testService;
    private readonly results;
    private readonly updateEmitter;
    private readonly changedParents;
    private readonly resortedParents;
    private readonly items;
    private get rootsWithChildren();
    readonly onUpdate: import("../../../../workbench.web.main.internal.js").Event<void>;
    constructor(lastState: ISerializedTestTreeCollapseState, testService: ITestService, results: ITestResultService);
    getElementByTestId(testId: string): TestItemTreeElement | undefined;
    private applyDiff;
    applyTo(tree: ObjectTree<TestExplorerTreeElement, FuzzyScore>): void;
    expandElement(element: TestItemTreeElement, depth: number): void;
    private createItem;
    private unstoreItem;
    private storeItem;
}
