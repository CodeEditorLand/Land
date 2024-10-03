import { createDecorator } from '../../instantiation/common/instantiation.js';
export var IssueSource;
(function (IssueSource) {
    IssueSource["VSCode"] = "vscode";
    IssueSource["Extension"] = "extension";
    IssueSource["Marketplace"] = "marketplace";
})(IssueSource || (IssueSource = {}));
export const IIssueMainService = createDecorator('issueService');
export const IProcessMainService = createDecorator('processService');
