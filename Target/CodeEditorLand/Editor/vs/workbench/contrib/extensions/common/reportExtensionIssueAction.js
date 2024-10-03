var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ReportExtensionIssueAction_1;
import * as nls from '../../../../nls.js';
import { Action } from '../../../../base/common/actions.js';
import { IWorkbenchIssueService } from '../../issue/common/issue.js';
let ReportExtensionIssueAction = class ReportExtensionIssueAction extends Action {
    static { ReportExtensionIssueAction_1 = this; }
    static { this._id = 'workbench.extensions.action.reportExtensionIssue'; }
    static { this._label = nls.localize('reportExtensionIssue', "Report Issue"); }
    constructor(extension, issueService) {
        super(ReportExtensionIssueAction_1._id, ReportExtensionIssueAction_1._label, 'extension-action report-issue');
        this.extension = extension;
        this.issueService = issueService;
        this.enabled = extension.isBuiltin || (!!extension.repository && !!extension.repository.url);
    }
    async run() {
        await this.issueService.openReporter({
            extensionId: this.extension.identifier.value,
        });
    }
};
ReportExtensionIssueAction = ReportExtensionIssueAction_1 = __decorate([
    __param(1, IWorkbenchIssueService),
    __metadata("design:paramtypes", [Object, Object])
], ReportExtensionIssueAction);
export { ReportExtensionIssueAction };
