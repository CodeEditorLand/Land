import { IIdentityProvider } from '../../../../../base/browser/ui/list/list.js';
import { ObjectTree } from '../../../../../base/browser/ui/tree/objectTree.js';
import { IObjectTreeElement } from '../../../../../base/browser/ui/tree/tree.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { FuzzyScore } from '../../../../../base/common/filters.js';
import { IMarkdownString } from '../../../../../base/common/htmlContent.js';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { ISerializedTestTreeCollapseState } from './testingViewState.js';
import { ITestItemContext, InternalTestItem, TestResultState } from '../../common/testTypes.js';
export interface ITestTreeProjection extends IDisposable {
    onUpdate: Event<void>;
    lastState: ISerializedTestTreeCollapseState;
    expandElement(element: TestItemTreeElement, depth: number): void;
    getElementByTestId(testId: string): TestItemTreeElement | undefined;
    applyTo(tree: ObjectTree<TestExplorerTreeElement, FuzzyScore>): void;
}
export declare abstract class TestItemTreeElement {
    readonly test: InternalTestItem;
    readonly parent: TestItemTreeElement | null;
    protected readonly changeEmitter: Emitter<void>;
    readonly onChange: Event<void>;
    readonly children: Set<TestExplorerTreeElement>;
    readonly treeId: string;
    depth: number;
    retired: boolean;
    state: TestResultState;
    duration: number | undefined;
    abstract description: string | null;
    constructor(test: InternalTestItem, parent?: TestItemTreeElement | null);
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
