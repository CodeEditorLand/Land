import { URI } from '../../../../base/common/uri.js';
export declare const TEST_DATA_SCHEME = "vscode-test-data";
export declare const enum TestUriType {
    TaskOutput = 0,
    TestOutput = 1,
    ResultMessage = 2,
    ResultActualOutput = 3,
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
