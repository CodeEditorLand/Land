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
import * as nls from '../../../../nls.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions } from '../../../common/contributions.js';
import { IssueFormService } from './issueFormService.js';
import { BrowserIssueService } from './issueService.js';
import './issueTroubleshoot.js';
import { IIssueFormService, IWorkbenchIssueService } from '../common/issue.js';
import { BaseIssueContribution } from '../common/issue.contribution.js';
let WebIssueContribution = class WebIssueContribution extends BaseIssueContribution {
    constructor(productService, configurationService) {
        super(productService, configurationService);
        Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
            properties: {
                'issueReporter.experimental.webReporter': {
                    type: 'boolean',
                    default: productService.quality !== 'stable',
                    description: 'Enable experimental issue reporter for web.',
                },
            }
        });
    }
};
WebIssueContribution = __decorate([
    __param(0, IProductService),
    __param(1, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object])
], WebIssueContribution);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(WebIssueContribution, 3);
registerSingleton(IWorkbenchIssueService, BrowserIssueService, 1);
registerSingleton(IIssueFormService, IssueFormService, 1);
CommandsRegistry.registerCommand('_issues.getSystemStatus', (accessor) => {
    return nls.localize('statusUnsupported', "The --status argument is not yet supported in browsers.");
});
