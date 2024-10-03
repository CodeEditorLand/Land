import { URI } from '../../../../base/common/uri.js';
import { Position } from '../../../../editor/common/core/position.js';
import { Range } from '../../../../editor/common/core/range.js';
import { TestId } from './testId.js';
export const testResultStateToContextValues = {
    [0]: 'unset',
    [1]: 'queued',
    [2]: 'running',
    [3]: 'passed',
    [4]: 'failed',
    [5]: 'skipped',
    [6]: 'errored',
};
export const testRunProfileBitsetList = [
    2,
    4,
    8,
    16,
    32,
    64,
];
export const isStartControllerTests = (t) => 'runId' in t;
export var IRichLocation;
(function (IRichLocation) {
    IRichLocation.serialize = (location) => ({
        range: location.range.toJSON(),
        uri: location.uri.toJSON(),
    });
    IRichLocation.deserialize = (uriIdentity, location) => ({
        range: Range.lift(location.range),
        uri: uriIdentity.asCanonicalUri(URI.revive(location.uri)),
    });
})(IRichLocation || (IRichLocation = {}));
export var ITestMessageStackFrame;
(function (ITestMessageStackFrame) {
    ITestMessageStackFrame.serialize = (stack) => ({
        label: stack.label,
        uri: stack.uri?.toJSON(),
        position: stack.position?.toJSON(),
    });
    ITestMessageStackFrame.deserialize = (uriIdentity, stack) => ({
        label: stack.label,
        uri: stack.uri ? uriIdentity.asCanonicalUri(URI.revive(stack.uri)) : undefined,
        position: stack.position ? Position.lift(stack.position) : undefined,
    });
})(ITestMessageStackFrame || (ITestMessageStackFrame = {}));
export var ITestErrorMessage;
(function (ITestErrorMessage) {
    ITestErrorMessage.serialize = (message) => ({
        message: message.message,
        type: 0,
        expected: message.expected,
        actual: message.actual,
        contextValue: message.contextValue,
        location: message.location && IRichLocation.serialize(message.location),
        stackTrace: message.stackTrace?.map(ITestMessageStackFrame.serialize),
    });
    ITestErrorMessage.deserialize = (uriIdentity, message) => ({
        message: message.message,
        type: 0,
        expected: message.expected,
        actual: message.actual,
        contextValue: message.contextValue,
        location: message.location && IRichLocation.deserialize(uriIdentity, message.location),
        stackTrace: message.stackTrace && message.stackTrace.map(s => ITestMessageStackFrame.deserialize(uriIdentity, s)),
    });
})(ITestErrorMessage || (ITestErrorMessage = {}));
export const getMarkId = (marker, start) => `${start ? 's' : 'e'}${marker}`;
export var ITestOutputMessage;
(function (ITestOutputMessage) {
    ITestOutputMessage.serialize = (message) => ({
        message: message.message,
        type: 1,
        offset: message.offset,
        length: message.length,
        location: message.location && IRichLocation.serialize(message.location),
    });
    ITestOutputMessage.deserialize = (uriIdentity, message) => ({
        message: message.message,
        type: 1,
        offset: message.offset,
        length: message.length,
        location: message.location && IRichLocation.deserialize(uriIdentity, message.location),
    });
})(ITestOutputMessage || (ITestOutputMessage = {}));
export var ITestMessage;
(function (ITestMessage) {
    ITestMessage.serialize = (message) => message.type === 0 ? ITestErrorMessage.serialize(message) : ITestOutputMessage.serialize(message);
    ITestMessage.deserialize = (uriIdentity, message) => message.type === 0 ? ITestErrorMessage.deserialize(uriIdentity, message) : ITestOutputMessage.deserialize(uriIdentity, message);
    ITestMessage.isDiffable = (message) => message.type === 0 && message.actual !== undefined && message.expected !== undefined;
})(ITestMessage || (ITestMessage = {}));
export var ITestTaskState;
(function (ITestTaskState) {
    ITestTaskState.serializeWithoutMessages = (state) => ({
        state: state.state,
        duration: state.duration,
        messages: [],
    });
    ITestTaskState.serialize = (state) => ({
        state: state.state,
        duration: state.duration,
        messages: state.messages.map(ITestMessage.serialize),
    });
    ITestTaskState.deserialize = (uriIdentity, state) => ({
        state: state.state,
        duration: state.duration,
        messages: state.messages.map(m => ITestMessage.deserialize(uriIdentity, m)),
    });
})(ITestTaskState || (ITestTaskState = {}));
const testTagDelimiter = '\0';
export const namespaceTestTag = (ctrlId, tagId) => ctrlId + testTagDelimiter + tagId;
export const denamespaceTestTag = (namespaced) => {
    const index = namespaced.indexOf(testTagDelimiter);
    return { ctrlId: namespaced.slice(0, index), tagId: namespaced.slice(index + 1) };
};
export var ITestItem;
(function (ITestItem) {
    ITestItem.serialize = (item) => ({
        extId: item.extId,
        label: item.label,
        tags: item.tags,
        busy: item.busy,
        children: undefined,
        uri: item.uri?.toJSON(),
        range: item.range?.toJSON() || null,
        description: item.description,
        error: item.error,
        sortText: item.sortText
    });
    ITestItem.deserialize = (uriIdentity, serialized) => ({
        extId: serialized.extId,
        label: serialized.label,
        tags: serialized.tags,
        busy: serialized.busy,
        children: undefined,
        uri: serialized.uri ? uriIdentity.asCanonicalUri(URI.revive(serialized.uri)) : undefined,
        range: serialized.range ? Range.lift(serialized.range) : null,
        description: serialized.description,
        error: serialized.error,
        sortText: serialized.sortText
    });
})(ITestItem || (ITestItem = {}));
export var InternalTestItem;
(function (InternalTestItem) {
    InternalTestItem.serialize = (item) => ({
        expand: item.expand,
        item: ITestItem.serialize(item.item)
    });
    InternalTestItem.deserialize = (uriIdentity, serialized) => ({
        controllerId: TestId.root(serialized.item.extId),
        expand: serialized.expand,
        item: ITestItem.deserialize(uriIdentity, serialized.item)
    });
})(InternalTestItem || (InternalTestItem = {}));
export var ITestItemUpdate;
(function (ITestItemUpdate) {
    ITestItemUpdate.serialize = (u) => {
        let item;
        if (u.item) {
            item = {};
            if (u.item.label !== undefined) {
                item.label = u.item.label;
            }
            if (u.item.tags !== undefined) {
                item.tags = u.item.tags;
            }
            if (u.item.busy !== undefined) {
                item.busy = u.item.busy;
            }
            if (u.item.uri !== undefined) {
                item.uri = u.item.uri?.toJSON();
            }
            if (u.item.range !== undefined) {
                item.range = u.item.range?.toJSON();
            }
            if (u.item.description !== undefined) {
                item.description = u.item.description;
            }
            if (u.item.error !== undefined) {
                item.error = u.item.error;
            }
            if (u.item.sortText !== undefined) {
                item.sortText = u.item.sortText;
            }
        }
        return { extId: u.extId, expand: u.expand, item };
    };
    ITestItemUpdate.deserialize = (u) => {
        let item;
        if (u.item) {
            item = {};
            if (u.item.label !== undefined) {
                item.label = u.item.label;
            }
            if (u.item.tags !== undefined) {
                item.tags = u.item.tags;
            }
            if (u.item.busy !== undefined) {
                item.busy = u.item.busy;
            }
            if (u.item.range !== undefined) {
                item.range = u.item.range ? Range.lift(u.item.range) : null;
            }
            if (u.item.description !== undefined) {
                item.description = u.item.description;
            }
            if (u.item.error !== undefined) {
                item.error = u.item.error;
            }
            if (u.item.sortText !== undefined) {
                item.sortText = u.item.sortText;
            }
        }
        return { extId: u.extId, expand: u.expand, item };
    };
})(ITestItemUpdate || (ITestItemUpdate = {}));
export const applyTestItemUpdate = (internal, patch) => {
    if (patch.expand !== undefined) {
        internal.expand = patch.expand;
    }
    if (patch.item !== undefined) {
        internal.item = internal.item ? Object.assign(internal.item, patch.item) : patch.item;
    }
};
export var TestResultItem;
(function (TestResultItem) {
    TestResultItem.serializeWithoutMessages = (original) => ({
        ...InternalTestItem.serialize(original),
        ownComputedState: original.ownComputedState,
        computedState: original.computedState,
        tasks: original.tasks.map(ITestTaskState.serializeWithoutMessages),
    });
    TestResultItem.serialize = (original) => ({
        ...InternalTestItem.serialize(original),
        ownComputedState: original.ownComputedState,
        computedState: original.computedState,
        tasks: original.tasks.map(ITestTaskState.serialize),
    });
    TestResultItem.deserialize = (uriIdentity, serialized) => ({
        ...InternalTestItem.deserialize(uriIdentity, serialized),
        ownComputedState: serialized.ownComputedState,
        computedState: serialized.computedState,
        tasks: serialized.tasks.map(m => ITestTaskState.deserialize(uriIdentity, m)),
        retired: true,
    });
})(TestResultItem || (TestResultItem = {}));
export var ICoverageCount;
(function (ICoverageCount) {
    ICoverageCount.empty = () => ({ covered: 0, total: 0 });
    ICoverageCount.sum = (target, src) => {
        target.covered += src.covered;
        target.total += src.total;
    };
})(ICoverageCount || (ICoverageCount = {}));
export var IFileCoverage;
(function (IFileCoverage) {
    IFileCoverage.serialize = (original) => ({
        id: original.id,
        statement: original.statement,
        branch: original.branch,
        declaration: original.declaration,
        testIds: original.testIds,
        uri: original.uri.toJSON(),
    });
    IFileCoverage.deserialize = (uriIdentity, serialized) => ({
        id: serialized.id,
        statement: serialized.statement,
        branch: serialized.branch,
        declaration: serialized.declaration,
        testIds: serialized.testIds,
        uri: uriIdentity.asCanonicalUri(URI.revive(serialized.uri)),
    });
    IFileCoverage.empty = (id, uri) => ({
        id,
        uri,
        statement: ICoverageCount.empty(),
    });
})(IFileCoverage || (IFileCoverage = {}));
function serializeThingWithLocation(serialized) {
    return {
        ...serialized,
        location: serialized.location?.toJSON(),
    };
}
function deserializeThingWithLocation(serialized) {
    serialized.location = serialized.location ? (Position.isIPosition(serialized.location) ? Position.lift(serialized.location) : Range.lift(serialized.location)) : undefined;
    return serialized;
}
export const KEEP_N_LAST_COVERAGE_REPORTS = 3;
export var CoverageDetails;
(function (CoverageDetails) {
    CoverageDetails.serialize = (original) => original.type === 0 ? IDeclarationCoverage.serialize(original) : IStatementCoverage.serialize(original);
    CoverageDetails.deserialize = (serialized) => serialized.type === 0 ? IDeclarationCoverage.deserialize(serialized) : IStatementCoverage.deserialize(serialized);
})(CoverageDetails || (CoverageDetails = {}));
export var IBranchCoverage;
(function (IBranchCoverage) {
    IBranchCoverage.serialize = serializeThingWithLocation;
    IBranchCoverage.deserialize = deserializeThingWithLocation;
})(IBranchCoverage || (IBranchCoverage = {}));
export var IDeclarationCoverage;
(function (IDeclarationCoverage) {
    IDeclarationCoverage.serialize = serializeThingWithLocation;
    IDeclarationCoverage.deserialize = deserializeThingWithLocation;
})(IDeclarationCoverage || (IDeclarationCoverage = {}));
export var IStatementCoverage;
(function (IStatementCoverage) {
    IStatementCoverage.serialize = (original) => ({
        ...serializeThingWithLocation(original),
        branches: original.branches?.map(IBranchCoverage.serialize),
    });
    IStatementCoverage.deserialize = (serialized) => ({
        ...deserializeThingWithLocation(serialized),
        branches: serialized.branches?.map(IBranchCoverage.deserialize),
    });
})(IStatementCoverage || (IStatementCoverage = {}));
export var TestsDiffOp;
(function (TestsDiffOp) {
    TestsDiffOp.deserialize = (uriIdentity, u) => {
        if (u.op === 0) {
            return { op: u.op, item: InternalTestItem.deserialize(uriIdentity, u.item) };
        }
        else if (u.op === 1) {
            return { op: u.op, item: ITestItemUpdate.deserialize(u.item) };
        }
        else if (u.op === 2) {
            return { op: u.op, uri: uriIdentity.asCanonicalUri(URI.revive(u.uri)), docv: u.docv };
        }
        else {
            return u;
        }
    };
    TestsDiffOp.serialize = (u) => {
        if (u.op === 0) {
            return { op: u.op, item: InternalTestItem.serialize(u.item) };
        }
        else if (u.op === 1) {
            return { op: u.op, item: ITestItemUpdate.serialize(u.item) };
        }
        else {
            return u;
        }
    };
})(TestsDiffOp || (TestsDiffOp = {}));
export class AbstractIncrementalTestCollection {
    constructor(uriIdentity) {
        this.uriIdentity = uriIdentity;
        this._tags = new Map();
        this.items = new Map();
        this.roots = new Set();
        this.busyControllerCount = 0;
        this.pendingRootCount = 0;
        this.tags = this._tags;
    }
    apply(diff) {
        const changes = this.createChangeCollector();
        for (const op of diff) {
            switch (op.op) {
                case 0:
                    this.add(InternalTestItem.deserialize(this.uriIdentity, op.item), changes);
                    break;
                case 1:
                    this.update(ITestItemUpdate.deserialize(op.item), changes);
                    break;
                case 3:
                    this.remove(op.itemId, changes);
                    break;
                case 5:
                    this.retireTest(op.itemId);
                    break;
                case 4:
                    this.updatePendingRoots(op.amount);
                    break;
                case 6:
                    this._tags.set(op.tag.id, op.tag);
                    break;
                case 7:
                    this._tags.delete(op.id);
                    break;
            }
        }
        changes.complete?.();
    }
    add(item, changes) {
        const parentId = TestId.parentId(item.item.extId)?.toString();
        let created;
        if (!parentId) {
            created = this.createItem(item);
            this.roots.add(created);
            this.items.set(item.item.extId, created);
        }
        else if (this.items.has(parentId)) {
            const parent = this.items.get(parentId);
            parent.children.add(item.item.extId);
            created = this.createItem(item, parent);
            this.items.set(item.item.extId, created);
        }
        else {
            console.error(`Test with unknown parent ID: ${JSON.stringify(item)}`);
            return;
        }
        changes.add?.(created);
        if (item.expand === 2) {
            this.busyControllerCount++;
        }
        return created;
    }
    update(patch, changes) {
        const existing = this.items.get(patch.extId);
        if (!existing) {
            return;
        }
        if (patch.expand !== undefined) {
            if (existing.expand === 2) {
                this.busyControllerCount--;
            }
            if (patch.expand === 2) {
                this.busyControllerCount++;
            }
        }
        applyTestItemUpdate(existing, patch);
        changes.update?.(existing);
        return existing;
    }
    remove(itemId, changes) {
        const toRemove = this.items.get(itemId);
        if (!toRemove) {
            return;
        }
        const parentId = TestId.parentId(toRemove.item.extId)?.toString();
        if (parentId) {
            const parent = this.items.get(parentId);
            parent.children.delete(toRemove.item.extId);
        }
        else {
            this.roots.delete(toRemove);
        }
        const queue = [[itemId]];
        while (queue.length) {
            for (const itemId of queue.pop()) {
                const existing = this.items.get(itemId);
                if (existing) {
                    queue.push(existing.children);
                    this.items.delete(itemId);
                    changes.remove?.(existing, existing !== toRemove);
                    if (existing.expand === 2) {
                        this.busyControllerCount--;
                    }
                }
            }
        }
    }
    retireTest(testId) {
    }
    updatePendingRoots(delta) {
        this.pendingRootCount += delta;
    }
    createChangeCollector() {
        return {};
    }
}
