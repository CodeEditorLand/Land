import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export var IssueSource;
(function (IssueSource) {
    IssueSource["VSCode"] = "vscode";
    IssueSource["Extension"] = "extension";
    IssueSource["Marketplace"] = "marketplace";
})(IssueSource || (IssueSource = {}));
export const IIssueFormService = createDecorator('issueFormService');
export const IWorkbenchIssueService = createDecorator('workbenchIssueService');
export const IWorkbenchProcessService = createDecorator('workbenchProcessService');
