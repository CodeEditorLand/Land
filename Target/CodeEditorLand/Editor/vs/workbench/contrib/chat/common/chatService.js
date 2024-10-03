import { URI } from '../../../../base/common/uri.js';
import { Range } from '../../../../editor/common/core/range.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export function isIDocumentContext(obj) {
    return (!!obj &&
        typeof obj === 'object' &&
        'uri' in obj && obj.uri instanceof URI &&
        'version' in obj && typeof obj.version === 'number' &&
        'ranges' in obj && Array.isArray(obj.ranges) && obj.ranges.every(Range.isIRange));
}
export function isIUsedContext(obj) {
    return (!!obj &&
        typeof obj === 'object' &&
        'documents' in obj &&
        Array.isArray(obj.documents) &&
        obj.documents.every(isIDocumentContext));
}
export var ChatResponseReferencePartStatusKind;
(function (ChatResponseReferencePartStatusKind) {
    ChatResponseReferencePartStatusKind[ChatResponseReferencePartStatusKind["Complete"] = 1] = "Complete";
    ChatResponseReferencePartStatusKind[ChatResponseReferencePartStatusKind["Partial"] = 2] = "Partial";
    ChatResponseReferencePartStatusKind[ChatResponseReferencePartStatusKind["Omitted"] = 3] = "Omitted";
})(ChatResponseReferencePartStatusKind || (ChatResponseReferencePartStatusKind = {}));
export var ChatAgentVoteDirection;
(function (ChatAgentVoteDirection) {
    ChatAgentVoteDirection[ChatAgentVoteDirection["Down"] = 0] = "Down";
    ChatAgentVoteDirection[ChatAgentVoteDirection["Up"] = 1] = "Up";
})(ChatAgentVoteDirection || (ChatAgentVoteDirection = {}));
export var ChatAgentVoteDownReason;
(function (ChatAgentVoteDownReason) {
    ChatAgentVoteDownReason["IncorrectCode"] = "incorrectCode";
    ChatAgentVoteDownReason["DidNotFollowInstructions"] = "didNotFollowInstructions";
    ChatAgentVoteDownReason["IncompleteCode"] = "incompleteCode";
    ChatAgentVoteDownReason["MissingContext"] = "missingContext";
    ChatAgentVoteDownReason["PoorlyWrittenOrFormatted"] = "poorlyWrittenOrFormatted";
    ChatAgentVoteDownReason["RefusedAValidRequest"] = "refusedAValidRequest";
    ChatAgentVoteDownReason["OffensiveOrUnsafe"] = "offensiveOrUnsafe";
    ChatAgentVoteDownReason["Other"] = "other";
    ChatAgentVoteDownReason["WillReportIssue"] = "willReportIssue";
})(ChatAgentVoteDownReason || (ChatAgentVoteDownReason = {}));
export var ChatCopyKind;
(function (ChatCopyKind) {
    ChatCopyKind[ChatCopyKind["Action"] = 1] = "Action";
    ChatCopyKind[ChatCopyKind["Toolbar"] = 2] = "Toolbar";
})(ChatCopyKind || (ChatCopyKind = {}));
export const IChatService = createDecorator('IChatService');
export const KEYWORD_ACTIVIATION_SETTING_ID = 'accessibility.voice.keywordActivation';
