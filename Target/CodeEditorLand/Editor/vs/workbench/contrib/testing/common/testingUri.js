import { assertNever } from '../../../../base/common/assert.js';
import { URI } from '../../../../base/common/uri.js';
export const TEST_DATA_SCHEME = 'vscode-test-data';
export const parseTestUri = (uri) => {
    const type = uri.authority;
    const [resultId, ...request] = uri.path.slice(1).split('/');
    if (request[0] === "message") {
        const taskIndex = Number(request[1]);
        const testExtId = uri.query;
        const index = Number(request[2]);
        const part = request[3];
        if (type === "results") {
            switch (part) {
                case "TestFailureMessage":
                    return { resultId, taskIndex, testExtId, messageIndex: index, type: 2 };
                case "ActualOutput":
                    return { resultId, taskIndex, testExtId, messageIndex: index, type: 3 };
                case "ExpectedOutput":
                    return { resultId, taskIndex, testExtId, messageIndex: index, type: 4 };
                case "message":
            }
        }
    }
    if (request[0] === "output") {
        const testExtId = uri.query;
        const taskIndex = Number(request[1]);
        return testExtId
            ? { resultId, taskIndex, testExtId, type: 1 }
            : { resultId, taskIndex, type: 0 };
    }
    return undefined;
};
export const buildTestUri = (parsed) => {
    const uriParts = {
        scheme: TEST_DATA_SCHEME,
        authority: "results"
    };
    if (parsed.type === 0) {
        return URI.from({
            ...uriParts,
            path: ['', parsed.resultId, "output", parsed.taskIndex].join('/'),
        });
    }
    const msgRef = (resultId, ...remaining) => URI.from({
        ...uriParts,
        query: parsed.testExtId,
        path: ['', resultId, "message", ...remaining].join('/'),
    });
    switch (parsed.type) {
        case 3:
            return msgRef(parsed.resultId, parsed.taskIndex, parsed.messageIndex, "ActualOutput");
        case 4:
            return msgRef(parsed.resultId, parsed.taskIndex, parsed.messageIndex, "ExpectedOutput");
        case 2:
            return msgRef(parsed.resultId, parsed.taskIndex, parsed.messageIndex, "TestFailureMessage");
        case 1:
            return URI.from({
                ...uriParts,
                query: parsed.testExtId,
                path: ['', parsed.resultId, "output", parsed.taskIndex].join('/'),
            });
        default:
            assertNever(parsed, 'Invalid test uri');
    }
};
