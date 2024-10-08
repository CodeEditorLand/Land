/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { assert } from '../../../../base/common/assert.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { WellDefinedPrefixTree } from '../../../../base/common/prefixTree.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { TestId } from './testId.js';
export const ITestService = createDecorator('testService');
export const testCollectionIsEmpty = (collection) => !Iterable.some(collection.rootItems, r => r.children.size > 0);
export const getContextForTestItem = (collection, id) => {
    if (typeof id === 'string') {
        id = TestId.fromString(id);
    }
    if (id.isRoot) {
        return { controller: id.toString() };
    }
    const context = { $mid: 16 /* MarshalledId.TestItemContext */, tests: [] };
    for (const i of id.idsFromRoot()) {
        if (!i.isRoot) {
            const test = collection.getNodeById(i.toString());
            if (test) {
                context.tests.push(test);
            }
        }
    }
    return context;
};
/**
 * Ensures the test with the given ID exists in the collection, if possible.
 * If cancellation is requested, or the test cannot be found, it will return
 * undefined.
 */
export const expandAndGetTestById = async (collection, id, ct = CancellationToken.None) => {
    const idPath = [...TestId.fromString(id).idsFromRoot()];
    let expandToLevel = 0;
    for (let i = idPath.length - 1; !ct.isCancellationRequested && i >= expandToLevel;) {
        const id = idPath[i].toString();
        const existing = collection.getNodeById(id);
        if (!existing) {
            i--;
            continue;
        }
        if (i === idPath.length - 1) {
            return existing;
        }
        // expand children only if it looks like it's necessary
        if (!existing.children.has(idPath[i + 1].toString())) {
            await collection.expand(id, 0);
        }
        expandToLevel = i + 1; // avoid an infinite loop if the test does not exist
        i = idPath.length - 1;
    }
    return undefined;
};
/**
 * Waits for the test to no longer be in the "busy" state.
 */
const waitForTestToBeIdle = (testService, test) => {
    if (!test.item.busy) {
        return;
    }
    return new Promise(resolve => {
        const l = testService.onDidProcessDiff(() => {
            if (testService.collection.getNodeById(test.item.extId)?.item.busy !== true) {
                resolve(); // removed, or no longer busy
                l.dispose();
            }
        });
    });
};
/**
 * Iterator that expands to and iterates through tests in the file. Iterates
 * in strictly descending order.
 */
export const testsInFile = async function* (testService, ident, uri, waitForIdle = true) {
    for (const test of testService.collection.all) {
        if (!test.item.uri) {
            continue;
        }
        if (ident.extUri.isEqual(uri, test.item.uri)) {
            yield test;
        }
        if (ident.extUri.isEqualOrParent(uri, test.item.uri)) {
            if (test.expand === 1 /* TestItemExpandState.Expandable */) {
                await testService.collection.expand(test.item.extId, 1);
            }
            if (waitForIdle) {
                await waitForTestToBeIdle(testService, test);
            }
        }
    }
};
/**
 * Iterator that iterates to the top-level children of tests under the given
 * the URI.
 */
export const testsUnderUri = async function* (testService, ident, uri, waitForIdle = true) {
    const queue = [testService.collection.rootIds];
    while (queue.length) {
        for (const testId of queue.pop()) {
            const test = testService.collection.getNodeById(testId);
            // Expand tests with URIs that are parent of the item, add tests
            // that are within the URI. Don't add their children, since those
            // tests already encompass their children.
            if (!test) {
                // no-op
            }
            else if (test.item.uri && ident.extUri.isEqualOrParent(test.item.uri, uri)) {
                yield test;
            }
            else if (!test.item.uri || ident.extUri.isEqualOrParent(uri, test.item.uri)) {
                if (test.expand === 1 /* TestItemExpandState.Expandable */) {
                    await testService.collection.expand(test.item.extId, 1);
                }
                if (waitForIdle) {
                    await waitForTestToBeIdle(testService, test);
                }
                queue.push(test.children.values());
            }
        }
    }
};
/**
 * Simplifies the array of tests by preferring test item parents if all of
 * their children are included.
 */
export const simplifyTestsToExecute = (collection, tests) => {
    if (tests.length < 2) {
        return tests;
    }
    const tree = new WellDefinedPrefixTree();
    for (const test of tests) {
        tree.insert(TestId.fromString(test.item.extId).path, test);
    }
    const out = [];
    // Returns the node if it and any children should be included. Otherwise
    // pushes into the `out` any individual children that should be included.
    const process = (currentId, node) => {
        // directly included, don't try to over-specify, and children should be ignored
        if (node.value) {
            return node.value;
        }
        assert(!!node.children, 'expect to have children');
        const thisChildren = [];
        for (const [part, child] of node.children) {
            currentId.push(part);
            const c = process(currentId, child);
            if (c) {
                thisChildren.push(c);
            }
            currentId.pop();
        }
        if (!thisChildren.length) {
            return;
        }
        // If there are multiple children and we have all of them, then tell the
        // parent this node should be included. Otherwise include children individually.
        const id = new TestId(currentId);
        const test = collection.getNodeById(id.toString());
        if (test?.children.size === thisChildren.length) {
            return test;
        }
        out.push(...thisChildren);
        return;
    };
    for (const [id, node] of tree.entries) {
        const n = process([id], node);
        if (n) {
            out.push(n);
        }
    }
    return out;
};
