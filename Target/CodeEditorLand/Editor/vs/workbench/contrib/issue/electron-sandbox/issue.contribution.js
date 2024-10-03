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
import { localize, localize2 } from '../../../../nls.js';
import { registerAction2, Action2 } from '../../../../platform/actions/common/actions.js';
import { IWorkbenchIssueService, IIssueFormService } from '../common/issue.js';
import { BaseIssueContribution } from '../common/issue.contribution.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions } from '../../../common/contributions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Extensions as QuickAccessExtensions } from '../../../../platform/quickinput/common/quickAccess.js';
import { IssueQuickAccess } from '../browser/issueQuickAccess.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { NativeIssueService } from './issueService.js';
import './issueMainService.js';
import '../browser/issueTroubleshoot.js';
import { Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { NativeIssueFormService } from './nativeIssueFormService.js';
registerSingleton(IWorkbenchIssueService, NativeIssueService, 1);
registerSingleton(IIssueFormService, NativeIssueFormService, 1);
let NativeIssueContribution = class NativeIssueContribution extends BaseIssueContribution {
    constructor(productService, configurationService) {
        super(productService, configurationService);
        if (productService.reportIssueUrl) {
            this._register(registerAction2(ReportPerformanceIssueUsingReporterAction));
        }
        let disposable;
        const registerQuickAccessProvider = () => {
            disposable = Registry.as(QuickAccessExtensions.Quickaccess).registerQuickAccessProvider({
                ctor: IssueQuickAccess,
                prefix: IssueQuickAccess.PREFIX,
                contextKey: 'inReportIssuePicker',
                placeholder: localize('tasksQuickAccessPlaceholder', "Type the name of an extension to report on."),
                helpEntries: [{
                        description: localize('openIssueReporter', "Open Issue Reporter"),
                        commandId: 'workbench.action.openIssueReporter'
                    }]
            });
        };
        Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
            properties: {
                'issueReporter.experimental.auxWindow': {
                    type: 'boolean',
                    default: true,
                    description: 'Enable the new experimental issue reporter in electron.',
                },
            }
        });
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (!configurationService.getValue('extensions.experimental.issueQuickAccess') && disposable) {
                disposable.dispose();
                disposable = undefined;
            }
            else if (!disposable) {
                registerQuickAccessProvider();
            }
        }));
        if (configurationService.getValue('extensions.experimental.issueQuickAccess')) {
            registerQuickAccessProvider();
        }
    }
};
NativeIssueContribution = __decorate([
    __param(0, IProductService),
    __param(1, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object])
], NativeIssueContribution);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(NativeIssueContribution, 3);
class ReportPerformanceIssueUsingReporterAction extends Action2 {
    static { this.ID = 'workbench.action.reportPerformanceIssueUsingReporter'; }
    constructor() {
        super({
            id: ReportPerformanceIssueUsingReporterAction.ID,
            title: localize2({ key: 'reportPerformanceIssue', comment: [`Here, 'issue' means problem or bug`] }, "Report Performance Issue..."),
            category: Categories.Help,
            f1: true
        });
    }
    async run(accessor) {
        const issueService = accessor.get(IWorkbenchIssueService);
        return issueService.openReporter({ issueType: 1 });
    }
}
