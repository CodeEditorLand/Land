import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { MarshalledId } from '../../../../base/common/marshallingIds.js';
import { URI, UriComponents } from '../../../../base/common/uri.js';
import { IPosition, Position } from '../../../../editor/common/core/position.js';
import { IRange, Range } from '../../../../editor/common/core/range.js';
export declare const enum TestResultState {
    Unset = 0,
    Queued = 1,
    Running = 2,
    Passed = 3,
    Failed = 4,
    Skipped = 5,
    Errored = 6
}
export declare const testResultStateToContextValues: {
    [K in TestResultState]: string;
};
export declare const enum ExtTestRunProfileKind {
    Run = 1,
    Debug = 2,
    Coverage = 3
}
export declare const enum TestControllerCapability {
    Refresh = 2,
    CodeRelatedToTest = 4,
    TestRelatedToCode = 8
}
export declare const enum TestRunProfileBitset {
    Run = 2,
    Debug = 4,
    Coverage = 8,
    HasNonDefaultProfile = 16,
    HasConfigurable = 32,
    SupportsContinuousRun = 64
}
export declare const testRunProfileBitsetList: TestRunProfileBitset[];
export interface ITestRunProfile {
    controllerId: string;
    profileId: number;
    label: string;
    group: TestRunProfileBitset;
    isDefault: boolean;
    tag: string | null;
    hasConfigurationHandler: boolean;
    supportsContinuousRun: boolean;
}
export interface ResolvedTestRunRequest {
    group: TestRunProfileBitset;
    targets: {
        testIds: string[];
        controllerId: string;
        profileId: number;
    }[];
    exclude?: string[];
    continuous?: boolean;
    preserveFocus?: boolean;
}
export interface ExtensionRunTestsRequest {
    id: string;
    include: string[];
    exclude: string[];
    controllerId: string;
    profile?: {
        group: TestRunProfileBitset;
        id: number;
    };
    persist: boolean;
    preserveFocus: boolean;
    continuous: boolean;
}
export interface ICallProfileRunHandler {
    controllerId: string;
    profileId: number;
    excludeExtIds: string[];
    testIds: string[];
}
export declare const isStartControllerTests: (t: ICallProfileRunHandler | IStartControllerTests) => t is IStartControllerTests;
export interface IStartControllerTests extends ICallProfileRunHandler {
    runId: string;
}
export interface IStartControllerTestsResult {
    error?: string;
}
export interface IRichLocation {
    range: Range;
    uri: URI;
}
export interface ITestUriCanonicalizer {
    asCanonicalUri(uri: URI): URI;
}
export declare namespace IRichLocation {
    interface Serialize {
        range: IRange;
        uri: UriComponents;
    }
    const serialize: (location: Readonly<IRichLocation>) => Serialize;
    const deserialize: (uriIdentity: ITestUriCanonicalizer, location: Serialize) => IRichLocation;
}
export declare const enum TestMessageType {
    Error = 0,
    Output = 1
}
export interface ITestMessageStackFrame {
    label: string;
    uri: URI | undefined;
    position: Position | undefined;
}
export declare namespace ITestMessageStackFrame {
    interface Serialized {
        label: string;
        uri: UriComponents | undefined;
        position: IPosition | undefined;
    }
    const serialize: (stack: Readonly<ITestMessageStackFrame>) => Serialized;
    const deserialize: (uriIdentity: ITestUriCanonicalizer, stack: Serialized) => ITestMessageStackFrame;
}
export interface ITestErrorMessage {
    message: string | IMarkdownString;
    type: TestMessageType.Error;
    expected: string | undefined;
    actual: string | undefined;
    contextValue: string | undefined;
    location: IRichLocation | undefined;
    stackTrace: undefined | ITestMessageStackFrame[];
}
export declare namespace ITestErrorMessage {
    interface Serialized {
        message: string | IMarkdownString;
        type: TestMessageType.Error;
        expected: string | undefined;
        actual: string | undefined;
        contextValue: string | undefined;
        location: IRichLocation.Serialize | undefined;
        stackTrace: undefined | ITestMessageStackFrame.Serialized[];
    }
    const serialize: (message: Readonly<ITestErrorMessage>) => Serialized;
    const deserialize: (uriIdentity: ITestUriCanonicalizer, message: Serialized) => ITestErrorMessage;
}
export interface ITestOutputMessage {
    message: string;
    type: TestMessageType.Output;
    offset: number;
    length: number;
    marker?: number;
    location: IRichLocation | undefined;
}
export declare const getMarkId: (marker: number, start: boolean) => string;
export declare namespace ITestOutputMessage {
    interface Serialized {
        message: string;
        offset: number;
        length: number;
        type: TestMessageType.Output;
        location: IRichLocation.Serialize | undefined;
    }
    const serialize: (message: Readonly<ITestOutputMessage>) => Serialized;
    const deserialize: (uriIdentity: ITestUriCanonicalizer, message: Serialized) => ITestOutputMessage;
}
export type ITestMessage = ITestErrorMessage | ITestOutputMessage;
export declare namespace ITestMessage {
    type Serialized = ITestErrorMessage.Serialized | ITestOutputMessage.Serialized;
    const serialize: (message: Readonly<ITestMessage>) => Serialized;
    const deserialize: (uriIdentity: ITestUriCanonicalizer, message: Serialized) => ITestMessage;
    const isDiffable: (message: ITestMessage) => message is ITestErrorMessage & {
        actual: string;
        expected: string;
    };
}
export interface ITestTaskState {
    state: TestResultState;
    duration: number | undefined;
    messages: ITestMessage[];
}
export declare namespace ITestTaskState {
    interface Serialized {
        state: TestResultState;
        duration: number | undefined;
        messages: ITestMessage.Serialized[];
    }
    const serializeWithoutMessages: (state: ITestTaskState) => Serialized;
    const serialize: (state: Readonly<ITestTaskState>) => Serialized;
    const deserialize: (uriIdentity: ITestUriCanonicalizer, state: Serialized) => ITestTaskState;
}
export interface ITestRunTask {
    id: string;
    name: string;
    running: boolean;
    ctrlId: string;
}
export interface ITestTag {
    readonly id: string;
}
export declare const namespaceTestTag: (ctrlId: string, tagId: string) => string;
export declare const denamespaceTestTag: (namespaced: string) => {
    ctrlId: string;
    tagId: string;
};
export interface ITestTagDisplayInfo {
    id: string;
}
export interface ITestItem {
    extId: string;
    label: string;
    tags: string[];
    busy: boolean;
    children?: never;
    uri: URI | undefined;
    range: Range | null;
    description: string | null;
    error: string | IMarkdownString | null;
    sortText: string | null;
}
export declare namespace ITestItem {
    interface Serialized {
        extId: string;
        label: string;
        tags: string[];
        busy: boolean;
        children?: never;
        uri: UriComponents | undefined;
        range: IRange | null;
        description: string | null;
        error: string | IMarkdownString | null;
        sortText: string | null;
    }
    const serialize: (item: Readonly<ITestItem>) => Serialized;
    const deserialize: (uriIdentity: ITestUriCanonicalizer, serialized: Serialized) => ITestItem;
}
export declare const enum TestItemExpandState {
    NotExpandable = 0,
    Expandable = 1,
    BusyExpanding = 2,
    Expanded = 3
}
export interface InternalTestItem {
    controllerId: string;
    expand: TestItemExpandState;
    item: ITestItem;
}
export declare namespace InternalTestItem {
    interface Serialized {
        expand: TestItemExpandState;
        item: ITestItem.Serialized;
    }
    const serialize: (item: Readonly<InternalTestItem>) => Serialized;
    const deserialize: (uriIdentity: ITestUriCanonicalizer, serialized: Serialized) => InternalTestItem;
}
export interface ITestItemUpdate {
    extId: string;
    expand?: TestItemExpandState;
    item?: Partial<ITestItem>;
}
export declare namespace ITestItemUpdate {
    interface Serialized {
        extId: string;
        expand?: TestItemExpandState;
        item?: Partial<ITestItem.Serialized>;
    }
    const serialize: (u: Readonly<ITestItemUpdate>) => Serialized;
    const deserialize: (u: Serialized) => ITestItemUpdate;
}
export declare const applyTestItemUpdate: (internal: InternalTestItem | ITestItemUpdate, patch: ITestItemUpdate) => void;
export interface TestMessageFollowupRequest {
    resultId: string;
    extId: string;
    taskIndex: number;
    messageIndex: number;
}
export interface TestMessageFollowupResponse {
    id: number;
    title: string;
}
export interface TestResultItem extends InternalTestItem {
    tasks: ITestTaskState[];
    ownComputedState: TestResultState;
    computedState: TestResultState;
    ownDuration?: number;
    retired?: boolean;
}
export declare namespace TestResultItem {
    interface Serialized extends InternalTestItem.Serialized {
        tasks: ITestTaskState.Serialized[];
        ownComputedState: TestResultState;
        computedState: TestResultState;
    }
    const serializeWithoutMessages: (original: TestResultItem) => Serialized;
    const serialize: (original: Readonly<TestResultItem>) => Serialized;
    const deserialize: (uriIdentity: ITestUriCanonicalizer, serialized: Serialized) => TestResultItem;
}
export interface ISerializedTestResults {
    id: string;
    completedAt: number;
    items: TestResultItem.Serialized[];
    tasks: {
        id: string;
        name: string | undefined;
        ctrlId: string;
        hasCoverage: boolean;
    }[];
    name: string;
    request: ResolvedTestRunRequest;
}
export interface ITestCoverage {
    files: IFileCoverage[];
}
export interface ICoverageCount {
    covered: number;
    total: number;
}
export declare namespace ICoverageCount {
    const empty: () => ICoverageCount;
    const sum: (target: ICoverageCount, src: Readonly<ICoverageCount>) => void;
}
export interface IFileCoverage {
    id: string;
    uri: URI;
    testIds?: string[];
    statement: ICoverageCount;
    branch?: ICoverageCount;
    declaration?: ICoverageCount;
}
export declare namespace IFileCoverage {
    interface Serialized {
        id: string;
        uri: UriComponents;
        testIds: string[] | undefined;
        statement: ICoverageCount;
        branch?: ICoverageCount;
        declaration?: ICoverageCount;
    }
    const serialize: (original: Readonly<IFileCoverage>) => Serialized;
    const deserialize: (uriIdentity: ITestUriCanonicalizer, serialized: Serialized) => IFileCoverage;
    const empty: (id: string, uri: URI) => IFileCoverage;
}
export declare const KEEP_N_LAST_COVERAGE_REPORTS = 3;
export declare const enum DetailType {
    Declaration = 0,
    Statement = 1,
    Branch = 2
}
export type CoverageDetails = IDeclarationCoverage | IStatementCoverage;
export declare namespace CoverageDetails {
    type Serialized = IDeclarationCoverage.Serialized | IStatementCoverage.Serialized;
    const serialize: (original: Readonly<CoverageDetails>) => Serialized;
    const deserialize: (serialized: Serialized) => CoverageDetails;
}
export interface IBranchCoverage {
    count: number | boolean;
    label?: string;
    location?: Range | Position;
}
export declare namespace IBranchCoverage {
    interface Serialized {
        count: number | boolean;
        label?: string;
        location?: IRange | IPosition;
    }
    const serialize: (original: IBranchCoverage) => Serialized;
    const deserialize: (original: Serialized) => IBranchCoverage;
}
export interface IDeclarationCoverage {
    type: DetailType.Declaration;
    name: string;
    count: number | boolean;
    location: Range | Position;
}
export declare namespace IDeclarationCoverage {
    interface Serialized {
        type: DetailType.Declaration;
        name: string;
        count: number | boolean;
        location: IRange | IPosition;
    }
    const serialize: (original: IDeclarationCoverage) => Serialized;
    const deserialize: (original: Serialized) => IDeclarationCoverage;
}
export interface IStatementCoverage {
    type: DetailType.Statement;
    count: number | boolean;
    location: Range | Position;
    branches?: IBranchCoverage[];
}
export declare namespace IStatementCoverage {
    interface Serialized {
        type: DetailType.Statement;
        count: number | boolean;
        location: IRange | IPosition;
        branches?: IBranchCoverage.Serialized[];
    }
    const serialize: (original: Readonly<IStatementCoverage>) => Serialized;
    const deserialize: (serialized: Serialized) => IStatementCoverage;
}
export declare const enum TestDiffOpType {
    Add = 0,
    Update = 1,
    DocumentSynced = 2,
    Remove = 3,
    IncrementPendingExtHosts = 4,
    Retire = 5,
    AddTag = 6,
    RemoveTag = 7
}
export type TestsDiffOp = {
    op: TestDiffOpType.Add;
    item: InternalTestItem;
} | {
    op: TestDiffOpType.Update;
    item: ITestItemUpdate;
} | {
    op: TestDiffOpType.Remove;
    itemId: string;
} | {
    op: TestDiffOpType.Retire;
    itemId: string;
} | {
    op: TestDiffOpType.IncrementPendingExtHosts;
    amount: number;
} | {
    op: TestDiffOpType.AddTag;
    tag: ITestTagDisplayInfo;
} | {
    op: TestDiffOpType.RemoveTag;
    id: string;
} | {
    op: TestDiffOpType.DocumentSynced;
    uri: URI;
    docv?: number;
};
export declare namespace TestsDiffOp {
    type Serialized = {
        op: TestDiffOpType.Add;
        item: InternalTestItem.Serialized;
    } | {
        op: TestDiffOpType.Update;
        item: ITestItemUpdate.Serialized;
    } | {
        op: TestDiffOpType.Remove;
        itemId: string;
    } | {
        op: TestDiffOpType.Retire;
        itemId: string;
    } | {
        op: TestDiffOpType.IncrementPendingExtHosts;
        amount: number;
    } | {
        op: TestDiffOpType.AddTag;
        tag: ITestTagDisplayInfo;
    } | {
        op: TestDiffOpType.RemoveTag;
        id: string;
    } | {
        op: TestDiffOpType.DocumentSynced;
        uri: UriComponents;
        docv?: number;
    };
    const deserialize: (uriIdentity: ITestUriCanonicalizer, u: Serialized) => TestsDiffOp;
    const serialize: (u: Readonly<TestsDiffOp>) => Serialized;
}
export interface ITestItemContext {
    $mid: MarshalledId.TestItemContext;
    tests: InternalTestItem.Serialized[];
}
export interface ITestMessageMenuArgs {
    $mid: MarshalledId.TestMessageMenuArgs;
    test: InternalTestItem.Serialized;
    message: ITestMessage.Serialized;
}
export type TestsDiff = TestsDiffOp[];
export interface IncrementalTestCollectionItem extends InternalTestItem {
    children: Set<string>;
}
export interface IncrementalChangeCollector<T> {
    add?(node: T): void;
    update?(node: T): void;
    remove?(node: T, isNestedOperation: boolean): void;
    complete?(): void;
}
export declare abstract class AbstractIncrementalTestCollection<T extends IncrementalTestCollectionItem> {
    private readonly uriIdentity;
    private readonly _tags;
    protected readonly items: Map<string, T>;
    protected readonly roots: Set<T>;
    protected busyControllerCount: number;
    protected pendingRootCount: number;
    readonly tags: ReadonlyMap<string, ITestTagDisplayInfo>;
    constructor(uriIdentity: ITestUriCanonicalizer);
    apply(diff: TestsDiff): void;
    protected add(item: InternalTestItem, changes: IncrementalChangeCollector<T>): T | undefined;
    protected update(patch: ITestItemUpdate, changes: IncrementalChangeCollector<T>): T | undefined;
    protected remove(itemId: string, changes: IncrementalChangeCollector<T>): void;
    protected retireTest(testId: string): void;
    updatePendingRoots(delta: number): void;
    protected createChangeCollector(): IncrementalChangeCollector<T>;
    protected abstract createItem(internal: InternalTestItem, parent?: T): T;
}
