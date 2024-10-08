/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as editorRange from '../../../editor/common/core/range.js';
import { createPrivateApiFor, getPrivateApiFor } from './extHostTestingPrivateApi.js';
import { TestId } from '../../contrib/testing/common/testId.js';
import { createTestItemChildren, TestItemCollection } from '../../contrib/testing/common/testItemCollection.js';
import { denamespaceTestTag } from '../../contrib/testing/common/testTypes.js';
import * as Convert from './extHostTypeConverters.js';
import { URI } from '../../../base/common/uri.js';
const testItemPropAccessor = (api, defaultValue, equals, toUpdate) => {
    let value = defaultValue;
    return {
        enumerable: true,
        configurable: false,
        get() {
            return value;
        },
        set(newValue) {
            if (!equals(value, newValue)) {
                const oldValue = value;
                value = newValue;
                api.listener?.(toUpdate(newValue, oldValue));
            }
        },
    };
};
const strictEqualComparator = (a, b) => a === b;
const propComparators = {
    range: (a, b) => {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return a.isEqual(b);
    },
    label: strictEqualComparator,
    description: strictEqualComparator,
    sortText: strictEqualComparator,
    busy: strictEqualComparator,
    error: strictEqualComparator,
    canResolveChildren: strictEqualComparator,
    tags: (a, b) => {
        if (a.length !== b.length) {
            return false;
        }
        if (a.some(t1 => !b.find(t2 => t1.id === t2.id))) {
            return false;
        }
        return true;
    },
};
const evSetProps = (fn) => v => ({ op: 4 /* TestItemEventOp.SetProp */, update: fn(v) });
const makePropDescriptors = (api, label) => ({
    range: (() => {
        let value;
        const updateProps = evSetProps(r => ({ range: editorRange.Range.lift(Convert.Range.from(r)) }));
        return {
            enumerable: true,
            configurable: false,
            get() {
                return value;
            },
            set(newValue) {
                api.listener?.({ op: 6 /* TestItemEventOp.DocumentSynced */ });
                if (!propComparators.range(value, newValue)) {
                    value = newValue;
                    api.listener?.(updateProps(newValue));
                }
            },
        };
    })(),
    label: testItemPropAccessor(api, label, propComparators.label, evSetProps(label => ({ label }))),
    description: testItemPropAccessor(api, undefined, propComparators.description, evSetProps(description => ({ description }))),
    sortText: testItemPropAccessor(api, undefined, propComparators.sortText, evSetProps(sortText => ({ sortText }))),
    canResolveChildren: testItemPropAccessor(api, false, propComparators.canResolveChildren, state => ({
        op: 2 /* TestItemEventOp.UpdateCanResolveChildren */,
        state,
    })),
    busy: testItemPropAccessor(api, false, propComparators.busy, evSetProps(busy => ({ busy }))),
    error: testItemPropAccessor(api, undefined, propComparators.error, evSetProps(error => ({ error: Convert.MarkdownString.fromStrict(error) || null }))),
    tags: testItemPropAccessor(api, [], propComparators.tags, (current, previous) => ({
        op: 1 /* TestItemEventOp.SetTags */,
        new: current.map(Convert.TestTag.from),
        old: previous.map(Convert.TestTag.from),
    })),
});
const toItemFromPlain = (item) => {
    const testId = TestId.fromString(item.extId);
    const testItem = new TestItemImpl(testId.controllerId, testId.localId, item.label, URI.revive(item.uri) || undefined);
    testItem.range = Convert.Range.to(item.range || undefined);
    testItem.description = item.description || undefined;
    testItem.sortText = item.sortText || undefined;
    testItem.tags = item.tags.map(t => Convert.TestTag.to({ id: denamespaceTestTag(t).tagId }));
    return testItem;
};
export const toItemFromContext = (context) => {
    let node;
    for (const test of context.tests) {
        const next = toItemFromPlain(test.item);
        getPrivateApiFor(next).parent = node;
        node = next;
    }
    return node;
};
export class TestItemImpl {
    /**
     * Note that data is deprecated and here for back-compat only
     */
    constructor(controllerId, id, label, uri) {
        if (id.includes("\0" /* TestIdPathParts.Delimiter */)) {
            throw new Error(`Test IDs may not include the ${JSON.stringify(id)} symbol`);
        }
        const api = createPrivateApiFor(this, controllerId);
        Object.defineProperties(this, {
            id: {
                value: id,
                enumerable: true,
                writable: false,
            },
            uri: {
                value: uri,
                enumerable: true,
                writable: false,
            },
            parent: {
                enumerable: false,
                get() {
                    return api.parent instanceof TestItemRootImpl ? undefined : api.parent;
                },
            },
            children: {
                value: createTestItemChildren(api, getPrivateApiFor, TestItemImpl),
                enumerable: true,
                writable: false,
            },
            ...makePropDescriptors(api, label),
        });
    }
}
export class TestItemRootImpl extends TestItemImpl {
    constructor(controllerId, label) {
        super(controllerId, controllerId, label, undefined);
        this._isRoot = true;
    }
}
export class ExtHostTestItemCollection extends TestItemCollection {
    constructor(controllerId, controllerLabel, editors) {
        super({
            controllerId,
            getDocumentVersion: uri => uri && editors.getDocument(uri)?.version,
            getApiFor: getPrivateApiFor,
            getChildren: (item) => item.children,
            root: new TestItemRootImpl(controllerId, controllerLabel),
            toITestItem: Convert.TestItem.from,
        });
    }
}
