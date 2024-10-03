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
var TroubleshootIssueService_1, IssueTroubleshootUi_1;
import { localize, localize2 } from '../../../../nls.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IWorkbenchIssueService } from '../common/issue.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IUserDataProfileImportExportService, IUserDataProfileManagementService, IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IExtensionBisectService } from '../../../services/extensionManagement/browser/extensionBisect.js';
import { INotificationService, NotificationPriority, Severity } from '../../../../platform/notification/common/notification.js';
import { IWorkbenchExtensionEnablementService } from '../../../services/extensionManagement/common/extensionManagement.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions } from '../../../common/contributions.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { URI } from '../../../../base/common/uri.js';
import { RemoteNameContext } from '../../../common/contextkeys.js';
import { IsWebContext } from '../../../../platform/contextkey/common/contextkeys.js';
const ITroubleshootIssueService = createDecorator('ITroubleshootIssueService');
var TroubleshootStage;
(function (TroubleshootStage) {
    TroubleshootStage[TroubleshootStage["EXTENSIONS"] = 1] = "EXTENSIONS";
    TroubleshootStage[TroubleshootStage["WORKBENCH"] = 2] = "WORKBENCH";
})(TroubleshootStage || (TroubleshootStage = {}));
class TroubleShootState {
    static fromJSON(raw) {
        if (!raw) {
            return undefined;
        }
        try {
            const data = JSON.parse(raw);
            if ((data.stage === TroubleshootStage.EXTENSIONS || data.stage === TroubleshootStage.WORKBENCH)
                && typeof data.profile === 'string') {
                return new TroubleShootState(data.stage, data.profile);
            }
        }
        catch { }
        return undefined;
    }
    constructor(stage, profile) {
        this.stage = stage;
        this.profile = profile;
    }
}
let TroubleshootIssueService = class TroubleshootIssueService extends Disposable {
    static { TroubleshootIssueService_1 = this; }
    static { this.storageKey = 'issueTroubleshootState'; }
    constructor(userDataProfileService, userDataProfilesService, userDataProfileManagementService, userDataProfileImportExportService, dialogService, extensionBisectService, notificationService, extensionManagementService, extensionEnablementService, issueService, productService, hostService, storageService, openerService) {
        super();
        this.userDataProfileService = userDataProfileService;
        this.userDataProfilesService = userDataProfilesService;
        this.userDataProfileManagementService = userDataProfileManagementService;
        this.userDataProfileImportExportService = userDataProfileImportExportService;
        this.dialogService = dialogService;
        this.extensionBisectService = extensionBisectService;
        this.notificationService = notificationService;
        this.extensionManagementService = extensionManagementService;
        this.extensionEnablementService = extensionEnablementService;
        this.issueService = issueService;
        this.productService = productService;
        this.hostService = hostService;
        this.storageService = storageService;
        this.openerService = openerService;
    }
    isActive() {
        return this.state !== undefined;
    }
    async start() {
        if (this.isActive()) {
            throw new Error('invalid state');
        }
        const res = await this.dialogService.confirm({
            message: localize('troubleshoot issue', "Troubleshoot Issue"),
            detail: localize('detail.start', "Issue troubleshooting is a process to help you identify the cause for an issue. The cause for an issue can be a misconfiguration, due to an extension, or be {0} itself.\n\nDuring the process the window reloads repeatedly. Each time you must confirm if you are still seeing the issue.", this.productService.nameLong),
            primaryButton: localize({ key: 'msg', comment: ['&& denotes a mnemonic'] }, "&&Troubleshoot Issue"),
            custom: true
        });
        if (!res.confirmed) {
            return;
        }
        const originalProfile = this.userDataProfileService.currentProfile;
        await this.userDataProfileImportExportService.createTroubleshootProfile();
        this.state = new TroubleShootState(TroubleshootStage.EXTENSIONS, originalProfile.id);
        await this.resume();
    }
    async resume() {
        if (!this.isActive()) {
            return;
        }
        if (this.state?.stage === TroubleshootStage.EXTENSIONS && !this.extensionBisectService.isActive) {
            await this.reproduceIssueWithExtensionsDisabled();
        }
        if (this.state?.stage === TroubleshootStage.WORKBENCH) {
            await this.reproduceIssueWithEmptyProfile();
        }
        await this.stop();
    }
    async stop() {
        if (!this.isActive()) {
            return;
        }
        if (this.notificationHandle) {
            this.notificationHandle.close();
            this.notificationHandle = undefined;
        }
        if (this.extensionBisectService.isActive) {
            await this.extensionBisectService.reset();
        }
        const profile = this.userDataProfilesService.profiles.find(p => p.id === this.state?.profile) ?? this.userDataProfilesService.defaultProfile;
        this.state = undefined;
        await this.userDataProfileManagementService.switchProfile(profile);
    }
    async reproduceIssueWithExtensionsDisabled() {
        if (!(await this.extensionManagementService.getInstalled(1)).length) {
            this.state = new TroubleShootState(TroubleshootStage.WORKBENCH, this.state.profile);
            return;
        }
        const result = await this.askToReproduceIssue(localize('profile.extensions.disabled', "Issue troubleshooting is active and has temporarily disabled all installed extensions. Check if you can still reproduce the problem and proceed by selecting from these options."));
        if (result === 'good') {
            const profile = this.userDataProfilesService.profiles.find(p => p.id === this.state.profile) ?? this.userDataProfilesService.defaultProfile;
            await this.reproduceIssueWithExtensionsBisect(profile);
        }
        if (result === 'bad') {
            this.state = new TroubleShootState(TroubleshootStage.WORKBENCH, this.state.profile);
        }
        if (result === 'stop') {
            await this.stop();
        }
    }
    async reproduceIssueWithEmptyProfile() {
        await this.userDataProfileManagementService.createAndEnterTransientProfile();
        this.updateState(this.state);
        const result = await this.askToReproduceIssue(localize('empty.profile', "Issue troubleshooting is active and has temporarily reset your configurations to defaults. Check if you can still reproduce the problem and proceed by selecting from these options."));
        if (result === 'stop') {
            await this.stop();
        }
        if (result === 'good') {
            await this.askToReportIssue(localize('issue is with configuration', "Issue troubleshooting has identified that the issue is caused by your configurations. Please report the issue by exporting your configurations using \"Export Profile\" command and share the file in the issue report."));
        }
        if (result === 'bad') {
            await this.askToReportIssue(localize('issue is in core', "Issue troubleshooting has identified that the issue is with {0}.", this.productService.nameLong));
        }
    }
    async reproduceIssueWithExtensionsBisect(profile) {
        await this.userDataProfileManagementService.switchProfile(profile);
        const extensions = (await this.extensionManagementService.getInstalled(1)).filter(ext => this.extensionEnablementService.isEnabled(ext));
        await this.extensionBisectService.start(extensions);
        await this.hostService.reload();
    }
    askToReproduceIssue(message) {
        return new Promise((c, e) => {
            const goodPrompt = {
                label: localize('I cannot reproduce', "I Can't Reproduce"),
                run: () => c('good')
            };
            const badPrompt = {
                label: localize('This is Bad', "I Can Reproduce"),
                run: () => c('bad')
            };
            const stop = {
                label: localize('Stop', "Stop"),
                run: () => c('stop')
            };
            this.notificationHandle = this.notificationService.prompt(Severity.Info, message, [goodPrompt, badPrompt, stop], { sticky: true, priority: NotificationPriority.URGENT });
        });
    }
    async askToReportIssue(message) {
        let isCheckedInInsiders = false;
        if (this.productService.quality === 'stable') {
            const res = await this.askToReproduceIssueWithInsiders();
            if (res === 'good') {
                await this.dialogService.prompt({
                    type: Severity.Info,
                    message: localize('troubleshoot issue', "Troubleshoot Issue"),
                    detail: localize('use insiders', "This likely means that the issue has been addressed already and will be available in an upcoming release. You can safely use {0} insiders until the new stable version is available.", this.productService.nameLong),
                    custom: true
                });
                return;
            }
            if (res === 'stop') {
                await this.stop();
                return;
            }
            if (res === 'bad') {
                isCheckedInInsiders = true;
            }
        }
        await this.issueService.openReporter({
            issueBody: `> ${message} ${isCheckedInInsiders ? `It is confirmed that the issue exists in ${this.productService.nameLong} Insiders` : ''}`,
        });
    }
    async askToReproduceIssueWithInsiders() {
        const confirmRes = await this.dialogService.confirm({
            type: 'info',
            message: localize('troubleshoot issue', "Troubleshoot Issue"),
            primaryButton: localize('download insiders', "Download {0} Insiders", this.productService.nameLong),
            cancelButton: localize('report anyway', "Report Issue Anyway"),
            detail: localize('ask to download insiders', "Please try to download and reproduce the issue in {0} insiders.", this.productService.nameLong),
            custom: {
                disableCloseAction: true,
            }
        });
        if (!confirmRes.confirmed) {
            return undefined;
        }
        const opened = await this.openerService.open(URI.parse('https://aka.ms/vscode-insiders'));
        if (!opened) {
            return undefined;
        }
        const res = await this.dialogService.prompt({
            type: 'info',
            message: localize('troubleshoot issue', "Troubleshoot Issue"),
            buttons: [{
                    label: localize('good', "I can't reproduce"),
                    run: () => 'good'
                }, {
                    label: localize('bad', "I can reproduce"),
                    run: () => 'bad'
                }],
            cancelButton: {
                label: localize('stop', "Stop"),
                run: () => 'stop'
            },
            detail: localize('ask to reproduce issue', "Please try to reproduce the issue in {0} insiders and confirm if the issue exists there.", this.productService.nameLong),
            custom: {
                disableCloseAction: true,
            }
        });
        return res.result;
    }
    get state() {
        if (this._state === undefined) {
            const raw = this.storageService.get(TroubleshootIssueService_1.storageKey, 0);
            this._state = TroubleShootState.fromJSON(raw);
        }
        return this._state || undefined;
    }
    set state(state) {
        this._state = state ?? null;
        this.updateState(state);
    }
    updateState(state) {
        if (state) {
            this.storageService.store(TroubleshootIssueService_1.storageKey, JSON.stringify(state), 0, 1);
        }
        else {
            this.storageService.remove(TroubleshootIssueService_1.storageKey, 0);
        }
    }
};
TroubleshootIssueService = TroubleshootIssueService_1 = __decorate([
    __param(0, IUserDataProfileService),
    __param(1, IUserDataProfilesService),
    __param(2, IUserDataProfileManagementService),
    __param(3, IUserDataProfileImportExportService),
    __param(4, IDialogService),
    __param(5, IExtensionBisectService),
    __param(6, INotificationService),
    __param(7, IExtensionManagementService),
    __param(8, IWorkbenchExtensionEnablementService),
    __param(9, IWorkbenchIssueService),
    __param(10, IProductService),
    __param(11, IHostService),
    __param(12, IStorageService),
    __param(13, IOpenerService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TroubleshootIssueService);
let IssueTroubleshootUi = class IssueTroubleshootUi extends Disposable {
    static { IssueTroubleshootUi_1 = this; }
    static { this.ctxIsTroubleshootActive = new RawContextKey('isIssueTroubleshootActive', false); }
    constructor(contextKeyService, troubleshootIssueService, storageService) {
        super();
        this.contextKeyService = contextKeyService;
        this.troubleshootIssueService = troubleshootIssueService;
        this.updateContext();
        if (troubleshootIssueService.isActive()) {
            troubleshootIssueService.resume();
        }
        this._register(storageService.onDidChangeValue(0, TroubleshootIssueService.storageKey, this._register(new DisposableStore()))(() => {
            this.updateContext();
        }));
    }
    updateContext() {
        IssueTroubleshootUi_1.ctxIsTroubleshootActive.bindTo(this.contextKeyService).set(this.troubleshootIssueService.isActive());
    }
};
IssueTroubleshootUi = IssueTroubleshootUi_1 = __decorate([
    __param(0, IContextKeyService),
    __param(1, ITroubleshootIssueService),
    __param(2, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object])
], IssueTroubleshootUi);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(IssueTroubleshootUi, 3);
registerAction2(class TroubleshootIssueAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.troubleshootIssue.start',
            title: localize2('troubleshootIssue', 'Troubleshoot Issue...'),
            category: Categories.Help,
            f1: true,
            precondition: ContextKeyExpr.and(IssueTroubleshootUi.ctxIsTroubleshootActive.negate(), RemoteNameContext.isEqualTo(''), IsWebContext.negate()),
        });
    }
    run(accessor) {
        return accessor.get(ITroubleshootIssueService).start();
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.troubleshootIssue.stop',
            title: localize2('title.stop', 'Stop Troubleshoot Issue'),
            category: Categories.Help,
            f1: true,
            precondition: IssueTroubleshootUi.ctxIsTroubleshootActive
        });
    }
    async run(accessor) {
        return accessor.get(ITroubleshootIssueService).stop();
    }
});
registerSingleton(ITroubleshootIssueService, TroubleshootIssueService, 1);
