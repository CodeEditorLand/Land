/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Range } from '../../../../../editor/common/core/range.js';
import { TestId } from '../../common/testId.js';
import { ITestMessage, InternalTestItem } from '../../common/testTypes.js';
import { buildTestUri } from '../../common/testingUri.js';
export const getMessageArgs = (test, message) => ({
    $mid: 18 /* MarshalledId.TestMessageMenuArgs */,
    test: InternalTestItem.serialize(test),
    message: ITestMessage.serialize(message),
});
export const inspectSubjectHasStack = (subject) => subject instanceof MessageSubject && !!subject.stack?.length;
export class MessageSubject {
    get controllerId() {
        return TestId.root(this.test.extId);
    }
    get isDiffable() {
        return this.message.type === 0 /* TestMessageType.Error */ && ITestMessage.isDiffable(this.message);
    }
    get contextValue() {
        return this.message.type === 0 /* TestMessageType.Error */ ? this.message.contextValue : undefined;
    }
    get stack() {
        return this.message.type === 0 /* TestMessageType.Error */ && this.message.stackTrace?.length ? this.message.stackTrace : undefined;
    }
    constructor(result, test, taskIndex, messageIndex) {
        this.result = result;
        this.taskIndex = taskIndex;
        this.messageIndex = messageIndex;
        this.test = test.item;
        const messages = test.tasks[taskIndex].messages;
        this.messageIndex = messageIndex;
        const parts = { messageIndex, resultId: result.id, taskIndex, testExtId: test.item.extId };
        this.expectedUri = buildTestUri({ ...parts, type: 4 /* TestUriType.ResultExpectedOutput */ });
        this.actualUri = buildTestUri({ ...parts, type: 3 /* TestUriType.ResultActualOutput */ });
        this.messageUri = buildTestUri({ ...parts, type: 2 /* TestUriType.ResultMessage */ });
        const message = this.message = messages[this.messageIndex];
        this.context = getMessageArgs(test, message);
        this.revealLocation = message.location ?? (test.item.uri && test.item.range ? { uri: test.item.uri, range: Range.lift(test.item.range) } : undefined);
    }
}
export class TaskSubject {
    get controllerId() {
        return this.result.tasks[this.taskIndex].ctrlId;
    }
    constructor(result, taskIndex) {
        this.result = result;
        this.taskIndex = taskIndex;
        this.outputUri = buildTestUri({ resultId: result.id, taskIndex, type: 0 /* TestUriType.TaskOutput */ });
    }
}
export class TestOutputSubject {
    get controllerId() {
        return TestId.root(this.test.item.extId);
    }
    constructor(result, taskIndex, test) {
        this.result = result;
        this.taskIndex = taskIndex;
        this.test = test;
        this.outputUri = buildTestUri({ resultId: this.result.id, taskIndex: this.taskIndex, testExtId: this.test.item.extId, type: 1 /* TestUriType.TestOutput */ });
        this.task = result.tasks[this.taskIndex];
    }
}
export const equalsSubject = (a, b) => ((a instanceof MessageSubject && b instanceof MessageSubject && a.message === b.message) ||
    (a instanceof TaskSubject && b instanceof TaskSubject && a.result === b.result && a.taskIndex === b.taskIndex) ||
    (a instanceof TestOutputSubject && b instanceof TestOutputSubject && a.test === b.test && a.taskIndex === b.taskIndex));
export const mapFindTestMessage = (test, fn) => {
    for (let taskIndex = 0; taskIndex < test.tasks.length; taskIndex++) {
        const task = test.tasks[taskIndex];
        for (let messageIndex = 0; messageIndex < task.messages.length; messageIndex++) {
            const r = fn(task, task.messages[messageIndex], messageIndex, taskIndex);
            if (r !== undefined) {
                return r;
            }
        }
    }
    return undefined;
};
export const getSubjectTestItem = (subject) => {
    if (subject instanceof MessageSubject) {
        return subject.test;
    }
    if (subject instanceof TaskSubject) {
        return undefined;
    }
    return subject.test.item;
};
