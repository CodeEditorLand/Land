import { Action } from '../../../../base/common/actions.js';
import { IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
import { IWorkbenchIssueService } from '../../issue/common/issue.js';
export declare class ReportExtensionIssueAction extends Action {
    private extension;
    private readonly issueService;
    private static readonly _id;
    private static readonly _label;
    constructor(extension: IExtensionDescription, issueService: IWorkbenchIssueService);
    run(): Promise<void>;
}
