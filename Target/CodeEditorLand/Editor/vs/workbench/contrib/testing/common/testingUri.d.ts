import { URI } from '../../../../base/common/uri.js';
export declare const TEST_DATA_SCHEME = "vscode-test-data";
export declare const enum TestUriType {
    /** All console output for a task */
    TaskOutput = 0,
    /** All console output for a test in a task */
    TestOutput = 1,
    /** Specific message in a test */
    ResultMessage = 2,
    /** Specific actual output message in a test */
    ResultActualOutput = 3,
    /** Specific expected output message in a test */
    ResultExpectedOutput = 4
}
interface IAllOutputReference {
    type: TestUriType.TaskOutput;
    resultId: string;
    taskIndex: number;
}
interface IResultTestUri {
    resultId: string;
    taskIndex: number;
    testExtId: string;
}
interface ITestOutputReference extends IResultTestUri {
    type: TestUriType.TestOutput;
}
interface IResultTestMessageReference extends IResultTestUri {
    type: TestUriType.ResultMessage;
    messageIndex: number;
}
interface ITestDiffOutputReference extends IResultTestUri {
    type: TestUriType.ResultActualOutput | TestUriType.ResultExpectedOutput;
    messageIndex: number;
}
export type ParsedTestUri = IAllOutputReference | IResultTestMessageReference | ITestDiffOutputReference | ITestOutputReference;
export declare const parseTestUri: (uri: URI) => ParsedTestUri | undefined;
export declare const buildTestUri: (parsed: ParsedTestUri) => URI;
export {};
