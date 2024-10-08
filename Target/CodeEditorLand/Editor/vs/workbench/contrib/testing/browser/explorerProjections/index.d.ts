import { IIdentityProvider } from '../../../../../base/browser/ui/list/list.js';
import { ObjectTree } from '../../../../../base/browser/ui/tree/objectTree.js';
import { IObjectTreeElement } from '../../../../../base/browser/ui/tree/tree.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { FuzzyScore } from '../../../../../base/common/filters.js';
import { IMarkdownString } from '../../../../../base/common/htmlContent.js';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { ISerializedTestTreeCollapseState } from './testingViewState.js';
import { ITestItemContext, InternalTestItem, TestResultState } from '../../common/testTypes.js';
/**
 * Describes a rendering of tests in the explorer view. Different
 * implementations of this are used for trees and lists, and groupings.
 * Originally this was implemented as inline logic within the ViewModel and
 * using a single IncrementalTestChangeCollector, but this became hairy
 * with status projections.
 */
export interface ITestTreeProjection extends IDisposable {
    /**
     * Event that fires when the projection changes.
     */
    onUpdate: Event<void>;
    /**
     * State to use for applying default collapse state of items.
     */
    lastState: ISerializedTestTreeCollapseState;
    /**
     * Fired when an element in the tree is expanded.
     */
    expandElement(element: TestItemTreeElement, depth: number): void;
    /**
     * Gets an element by its extension-assigned ID.
     */
    getElementByTestId(testId: string): TestItemTreeElement | undefined;
    /**
     * Applies pending update to the tree.
     */
    applyTo(tree: ObjectTree<TestExplorerTreeElement, FuzzyScore>): void;
}
export declare abstract class TestItemTreeElement {
    readonly test: InternalTestItem;
    /**
     * Parent tree item. May not actually be the test item who owns this one
     * in a 'flat' projection.
     */
    readonly parent: TestItemTreeElement | null;
    protected readonly changeEmitter: Emitter<void>;
    /**
     * Fired whenever the element or test properties change.
     */
    readonly onChange: Event<void>;
    /**
     * Tree children of this item.
     */
    readonly children: Set<TestExplorerTreeElement>;
    /**
     * Unique ID of the element in the tree.
     */
    readonly treeId: string;
    /**
     * Depth of the element in the tree.
     */
    depth: number;
    /**
     * Whether the node's test result is 'retired' -- from an outdated test run.
     */
    retired: boolean;
    /**
     * State to show on the item. This is generally the item's computed state
     * from its children.
     */
    state: TestResultState;
    /**
     * Time it took this test/item to run.
     */
    duration: number | undefined;
    /**
     * Tree element description.
     */
    abstract description: string | null;
    constructor(test: InternalTestItem, 
    /**
     * Parent tree item. May not actually be the test item who owns this one
     * in a 'flat' projection.
     */
    parent?: TestItemTreeElement | null);
    toJSON(): ITestItemContext | {
        controllerId: string;
    };
}
export declare class TestTreeErrorMessage {
    readonly message: string | IMarkdownString;
    readonly parent: TestExplorerTreeElement;
    readonly treeId: string;
    readonly children: Set<never>;
    get description(): string;
    constructor(message: string | IMarkdownString, parent: TestExplorerTreeElement);
}
export type TestExplorerTreeElement = TestItemTreeElement | TestTreeErrorMessage;
export declare const testIdentityProvider: IIdentityProvider<TestExplorerTreeElement>;
export declare const getChildrenForParent: (serialized: ISerializedTestTreeCollapseState, rootsWithChildren: Iterable<TestExplorerTreeElement>, node: TestExplorerTreeElement | null) => Iterable<IObjectTreeElement<TestExplorerTreeElement>>;
