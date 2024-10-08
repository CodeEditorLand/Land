import { URI } from '../../../../../base/common/uri.js';
import { ITestResult } from '../../common/testResult.js';
import { IRichLocation, ITestItem, ITestMessage, ITestMessageMenuArgs, ITestRunTask, ITestTaskState, TestResultItem } from '../../common/testTypes.js';
export declare const getMessageArgs: (test: TestResultItem, message: ITestMessage) => ITestMessageMenuArgs;
interface ISubjectCommon {
    controllerId: string;
}
export declare const inspectSubjectHasStack: (subject: InspectSubject | undefined) => boolean;
export declare class MessageSubject implements ISubjectCommon {
    readonly result: ITestResult;
    readonly taskIndex: number;
    readonly messageIndex: number;
    readonly test: ITestItem;
    readonly message: ITestMessage;
    readonly expectedUri: URI;
    readonly actualUri: URI;
    readonly messageUri: URI;
    readonly revealLocation: IRichLocation | undefined;
    readonly context: ITestMessageMenuArgs | undefined;
    get controllerId(): string;
    get isDiffable(): boolean;
    get contextValue(): string | undefined;
    get stack(): import("../../common/testTypes.js").ITestMessageStackFrame[] | undefined;
    constructor(result: ITestResult, test: TestResultItem, taskIndex: number, messageIndex: number);
}
export declare class TaskSubject implements ISubjectCommon {
    readonly result: ITestResult;
    readonly taskIndex: number;
    readonly outputUri: URI;
    readonly revealLocation: undefined;
    get controllerId(): string;
    constructor(result: ITestResult, taskIndex: number);
}
export declare class TestOutputSubject implements ISubjectCommon {
    readonly result: ITestResult;
    readonly taskIndex: number;
    readonly test: TestResultItem;
    readonly outputUri: URI;
    readonly revealLocation: undefined;
    readonly task: ITestRunTask;
    get controllerId(): string;
    constructor(result: ITestResult, taskIndex: number, test: TestResultItem);
}
export type InspectSubject = MessageSubject | TaskSubject | TestOutputSubject;
export declare const equalsSubject: (a: InspectSubject, b: InspectSubject) => boolean;
export declare const mapFindTestMessage: <T>(test: TestResultItem, fn: (task: ITestTaskState, message: ITestMessage, messageIndex: number, taskIndex: number) => T | undefined) => (T & ({} | null)) | undefined;
export declare const getSubjectTestItem: (subject: InspectSubject) => ITestItem | undefined;
export {};
