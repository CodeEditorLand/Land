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
import { localize } from '../../../../nls.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { BaseIssueReporterService } from './baseIssueReporterService.js';
import { IIssueFormService } from '../common/issue.js';
// GitHub has let us know that we could up our limit here to 8k. We chose 7500 to play it safe.
// ref https://github.com/microsoft/vscode/issues/159191
let IssueWebReporter = class IssueWebReporter extends BaseIssueReporterService {
    constructor(disableExtensions, data, os, product, window, issueFormService, themeService) {
        super(disableExtensions, data, os, product, window, true, issueFormService, themeService);
        const target = this.window.document.querySelector('.block-system .block-info');
        const webInfo = this.window.navigator.userAgent;
        if (webInfo) {
            target?.appendChild(this.window.document.createTextNode(webInfo));
            this.receivedSystemInfo = true;
            this.issueReporterModel.update({ systemInfoWeb: webInfo });
        }
        this.setEventHandlers();
    }
    setEventHandlers() {
        super.setEventHandlers();
        this.addEventListener('issue-type', 'change', (event) => {
            const issueType = parseInt(event.target.value);
            this.issueReporterModel.update({ issueType: issueType });
            // Resets placeholder
            const descriptionTextArea = this.getElementById('issue-title');
            if (descriptionTextArea) {
                descriptionTextArea.placeholder = localize('undefinedPlaceholder', "Please enter a title");
            }
            this.updatePreviewButtonState();
            this.setSourceOptions();
            this.render();
        });
    }
};
IssueWebReporter = __decorate([
    __param(5, IIssueFormService),
    __param(6, IThemeService),
    __metadata("design:paramtypes", [Boolean, Object, Object, Object, Window, Object, Object])
], IssueWebReporter);
export { IssueWebReporter };
