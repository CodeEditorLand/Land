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
var ProductContribution_1;
import * as nls from '../../../../nls.js';
import severity from '../../../../base/common/severity.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IActivityService, NumberBadge, ProgressBadge } from '../../../services/activity/common/activity.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IUpdateService } from '../../../../platform/update/common/update.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.js';
import { ReleaseNotesManager } from './releaseNotesEditor.js';
import { isMacintosh, isWeb, isWindows } from '../../../../base/common/platform.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { RawContextKey, IContextKeyService, ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { MenuRegistry, MenuId, registerAction2, Action2 } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IUserDataSyncEnablementService, IUserDataSyncService, IUserDataSyncStoreManagementService } from '../../../../platform/userDataSync/common/userDataSync.js';
import { IsWebContext } from '../../../../platform/contextkey/common/contextkeys.js';
import { Promises } from '../../../../base/common/async.js';
import { IUserDataSyncWorkbenchService } from '../../../services/userDataSync/common/userDataSync.js';
import { Event } from '../../../../base/common/event.js';
import { Action } from '../../../../base/common/actions.js';
export const CONTEXT_UPDATE_STATE = new RawContextKey('updateState', "uninitialized");
export const MAJOR_MINOR_UPDATE_AVAILABLE = new RawContextKey('majorMinorUpdateAvailable', false);
export const RELEASE_NOTES_URL = new RawContextKey('releaseNotesUrl', '');
export const DOWNLOAD_URL = new RawContextKey('downloadUrl', '');
let releaseNotesManager = undefined;
export function showReleaseNotesInEditor(instantiationService, version, useCurrentFile) {
    if (!releaseNotesManager) {
        releaseNotesManager = instantiationService.createInstance(ReleaseNotesManager);
    }
    return releaseNotesManager.show(version, useCurrentFile);
}
async function openLatestReleaseNotesInBrowser(accessor) {
    const openerService = accessor.get(IOpenerService);
    const productService = accessor.get(IProductService);
    if (productService.releaseNotesUrl) {
        const uri = URI.parse(productService.releaseNotesUrl);
        await openerService.open(uri);
    }
    else {
        throw new Error(nls.localize('update.noReleaseNotesOnline', "This version of {0} does not have release notes online", productService.nameLong));
    }
}
async function showReleaseNotes(accessor, version) {
    const instantiationService = accessor.get(IInstantiationService);
    try {
        await showReleaseNotesInEditor(instantiationService, version, false);
    }
    catch (err) {
        try {
            await instantiationService.invokeFunction(openLatestReleaseNotesInBrowser);
        }
        catch (err2) {
            throw new Error(`${err.message} and ${err2.message}`);
        }
    }
}
function parseVersion(version) {
    const match = /([0-9]+)\.([0-9]+)\.([0-9]+)/.exec(version);
    if (!match) {
        return undefined;
    }
    return {
        major: parseInt(match[1]),
        minor: parseInt(match[2]),
        patch: parseInt(match[3])
    };
}
function isMajorMinorUpdate(before, after) {
    return before.major < after.major || before.minor < after.minor;
}
let ProductContribution = class ProductContribution {
    static { ProductContribution_1 = this; }
    static { this.KEY = 'releaseNotes/lastVersion'; }
    constructor(storageService, instantiationService, notificationService, environmentService, openerService, configurationService, hostService, productService, contextKeyService) {
        if (productService.releaseNotesUrl) {
            const releaseNotesUrlKey = RELEASE_NOTES_URL.bindTo(contextKeyService);
            releaseNotesUrlKey.set(productService.releaseNotesUrl);
        }
        if (productService.downloadUrl) {
            const downloadUrlKey = DOWNLOAD_URL.bindTo(contextKeyService);
            downloadUrlKey.set(productService.downloadUrl);
        }
        if (isWeb) {
            return;
        }
        hostService.hadLastFocus().then(async (hadLastFocus) => {
            if (!hadLastFocus) {
                return;
            }
            const lastVersion = parseVersion(storageService.get(ProductContribution_1.KEY, -1, ''));
            const currentVersion = parseVersion(productService.version);
            const shouldShowReleaseNotes = configurationService.getValue('update.showReleaseNotes');
            const releaseNotesUrl = productService.releaseNotesUrl;
            if (shouldShowReleaseNotes && !environmentService.skipReleaseNotes && releaseNotesUrl && lastVersion && currentVersion && isMajorMinorUpdate(lastVersion, currentVersion)) {
                showReleaseNotesInEditor(instantiationService, productService.version, false)
                    .then(undefined, () => {
                    notificationService.prompt(severity.Info, nls.localize('read the release notes', "Welcome to {0} v{1}! Would you like to read the Release Notes?", productService.nameLong, productService.version), [{
                            label: nls.localize('releaseNotes', "Release Notes"),
                            run: () => {
                                const uri = URI.parse(releaseNotesUrl);
                                openerService.open(uri);
                            }
                        }]);
                });
            }
            storageService.store(ProductContribution_1.KEY, productService.version, -1, 1);
        });
    }
};
ProductContribution = ProductContribution_1 = __decorate([
    __param(0, IStorageService),
    __param(1, IInstantiationService),
    __param(2, INotificationService),
    __param(3, IBrowserWorkbenchEnvironmentService),
    __param(4, IOpenerService),
    __param(5, IConfigurationService),
    __param(6, IHostService),
    __param(7, IProductService),
    __param(8, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ProductContribution);
export { ProductContribution };
let UpdateContribution = class UpdateContribution extends Disposable {
    constructor(storageService, instantiationService, notificationService, dialogService, updateService, activityService, contextKeyService, productService, openerService, configurationService, hostService) {
        super();
        this.storageService = storageService;
        this.instantiationService = instantiationService;
        this.notificationService = notificationService;
        this.dialogService = dialogService;
        this.updateService = updateService;
        this.activityService = activityService;
        this.contextKeyService = contextKeyService;
        this.productService = productService;
        this.openerService = openerService;
        this.configurationService = configurationService;
        this.hostService = hostService;
        this.badgeDisposable = this._register(new MutableDisposable());
        this.state = updateService.state;
        this.updateStateContextKey = CONTEXT_UPDATE_STATE.bindTo(this.contextKeyService);
        this.majorMinorUpdateAvailableContextKey = MAJOR_MINOR_UPDATE_AVAILABLE.bindTo(this.contextKeyService);
        this._register(updateService.onStateChange(this.onUpdateStateChange, this));
        this.onUpdateStateChange(this.updateService.state);
        const currentVersion = this.productService.commit;
        const lastKnownVersion = this.storageService.get('update/lastKnownVersion', -1);
        if (currentVersion !== lastKnownVersion) {
            this.storageService.remove('update/lastKnownVersion', -1);
            this.storageService.remove('update/updateNotificationTime', -1);
        }
        this.registerGlobalActivityActions();
    }
    async onUpdateStateChange(state) {
        this.updateStateContextKey.set(state.type);
        switch (state.type) {
            case "disabled":
                if (state.reason === 5) {
                    this.notificationService.notify({
                        severity: Severity.Info,
                        message: nls.localize('update service disabled', "Updates are disabled because you are running the user-scope installation of {0} as Administrator.", this.productService.nameLong),
                        actions: {
                            primary: [
                                new Action('', nls.localize('learn more', "Learn More"), undefined, undefined, () => {
                                    this.openerService.open('https://aka.ms/vscode-windows-setup');
                                })
                            ]
                        },
                        neverShowAgain: { id: 'no-updates-running-as-admin', }
                    });
                }
                break;
            case "idle":
                if (state.error) {
                    this.onError(state.error);
                }
                else if (this.state.type === "checking for updates" && this.state.explicit && await this.hostService.hadLastFocus()) {
                    this.onUpdateNotAvailable();
                }
                break;
            case "available for download":
                this.onUpdateAvailable(state.update);
                break;
            case "downloaded":
                this.onUpdateDownloaded(state.update);
                break;
            case "ready": {
                const productVersion = state.update.productVersion;
                if (productVersion) {
                    const currentVersion = parseVersion(this.productService.version);
                    const nextVersion = parseVersion(productVersion);
                    this.majorMinorUpdateAvailableContextKey.set(Boolean(currentVersion && nextVersion && isMajorMinorUpdate(currentVersion, nextVersion)));
                    this.onUpdateReady(state.update);
                }
                break;
            }
        }
        let badge = undefined;
        let priority = undefined;
        if (state.type === "available for download" || state.type === "downloaded" || state.type === "ready") {
            badge = new NumberBadge(1, () => nls.localize('updateIsReady', "New {0} update available.", this.productService.nameShort));
        }
        else if (state.type === "checking for updates") {
            badge = new ProgressBadge(() => nls.localize('checkingForUpdates', "Checking for Updates..."));
            priority = 1;
        }
        else if (state.type === "downloading") {
            badge = new ProgressBadge(() => nls.localize('downloading', "Downloading..."));
            priority = 1;
        }
        else if (state.type === "updating") {
            badge = new ProgressBadge(() => nls.localize('updating', "Updating..."));
            priority = 1;
        }
        this.badgeDisposable.clear();
        if (badge) {
            this.badgeDisposable.value = this.activityService.showGlobalActivity({ badge, priority });
        }
        this.state = state;
    }
    onError(error) {
        if (/The request timed out|The network connection was lost/i.test(error)) {
            return;
        }
        error = error.replace(/See https:\/\/github\.com\/Squirrel\/Squirrel\.Mac\/issues\/182 for more information/, 'This might mean the application was put on quarantine by macOS. See [this link](https://github.com/microsoft/vscode/issues/7426#issuecomment-425093469) for more information');
        this.notificationService.notify({
            severity: Severity.Error,
            message: error,
            source: nls.localize('update service', "Update Service"),
        });
    }
    onUpdateNotAvailable() {
        this.dialogService.info(nls.localize('noUpdatesAvailable', "There are currently no updates available."));
    }
    onUpdateAvailable(update) {
        if (!this.shouldShowNotification()) {
            return;
        }
        const productVersion = update.productVersion;
        if (!productVersion) {
            return;
        }
        this.notificationService.prompt(severity.Info, nls.localize('thereIsUpdateAvailable', "There is an available update."), [{
                label: nls.localize('download update', "Download Update"),
                run: () => this.updateService.downloadUpdate()
            }, {
                label: nls.localize('later', "Later"),
                run: () => { }
            }, {
                label: nls.localize('releaseNotes', "Release Notes"),
                run: () => {
                    this.instantiationService.invokeFunction(accessor => showReleaseNotes(accessor, productVersion));
                }
            }]);
    }
    onUpdateDownloaded(update) {
        if (isMacintosh) {
            return;
        }
        if (this.configurationService.getValue('update.enableWindowsBackgroundUpdates') && this.productService.target === 'user') {
            return;
        }
        if (!this.shouldShowNotification()) {
            return;
        }
        const productVersion = update.productVersion;
        if (!productVersion) {
            return;
        }
        this.notificationService.prompt(severity.Info, nls.localize('updateAvailable', "There's an update available: {0} {1}", this.productService.nameLong, productVersion), [{
                label: nls.localize('installUpdate', "Install Update"),
                run: () => this.updateService.applyUpdate()
            }, {
                label: nls.localize('later', "Later"),
                run: () => { }
            }, {
                label: nls.localize('releaseNotes', "Release Notes"),
                run: () => {
                    this.instantiationService.invokeFunction(accessor => showReleaseNotes(accessor, productVersion));
                }
            }]);
    }
    onUpdateReady(update) {
        if (!(isWindows && this.productService.target !== 'user') && !this.shouldShowNotification()) {
            return;
        }
        const actions = [{
                label: nls.localize('updateNow', "Update Now"),
                run: () => this.updateService.quitAndInstall()
            }, {
                label: nls.localize('later', "Later"),
                run: () => { }
            }];
        const productVersion = update.productVersion;
        if (productVersion) {
            actions.push({
                label: nls.localize('releaseNotes', "Release Notes"),
                run: () => {
                    this.instantiationService.invokeFunction(accessor => showReleaseNotes(accessor, productVersion));
                }
            });
        }
        this.notificationService.prompt(severity.Info, nls.localize('updateAvailableAfterRestart', "Restart {0} to apply the latest update.", this.productService.nameLong), actions, { sticky: true });
    }
    shouldShowNotification() {
        const currentVersion = this.productService.commit;
        const currentMillis = new Date().getTime();
        const lastKnownVersion = this.storageService.get('update/lastKnownVersion', -1);
        if (currentVersion !== lastKnownVersion) {
            this.storageService.store('update/lastKnownVersion', currentVersion, -1, 1);
            this.storageService.store('update/updateNotificationTime', currentMillis, -1, 1);
        }
        const updateNotificationMillis = this.storageService.getNumber('update/updateNotificationTime', -1, currentMillis);
        const diffDays = (currentMillis - updateNotificationMillis) / (1000 * 60 * 60 * 24);
        return diffDays > 5;
    }
    registerGlobalActivityActions() {
        CommandsRegistry.registerCommand('update.check', () => this.updateService.checkForUpdates(true));
        MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
            group: '7_update',
            command: {
                id: 'update.check',
                title: nls.localize('checkForUpdates', "Check for Updates...")
            },
            when: CONTEXT_UPDATE_STATE.isEqualTo("idle")
        });
        CommandsRegistry.registerCommand('update.checking', () => { });
        MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
            group: '7_update',
            command: {
                id: 'update.checking',
                title: nls.localize('checkingForUpdates', "Checking for Updates..."),
                precondition: ContextKeyExpr.false()
            },
            when: CONTEXT_UPDATE_STATE.isEqualTo("checking for updates")
        });
        CommandsRegistry.registerCommand('update.downloadNow', () => this.updateService.downloadUpdate());
        MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
            group: '7_update',
            command: {
                id: 'update.downloadNow',
                title: nls.localize('download update_1', "Download Update (1)")
            },
            when: CONTEXT_UPDATE_STATE.isEqualTo("available for download")
        });
        CommandsRegistry.registerCommand('update.downloading', () => { });
        MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
            group: '7_update',
            command: {
                id: 'update.downloading',
                title: nls.localize('DownloadingUpdate', "Downloading Update..."),
                precondition: ContextKeyExpr.false()
            },
            when: CONTEXT_UPDATE_STATE.isEqualTo("downloading")
        });
        CommandsRegistry.registerCommand('update.install', () => this.updateService.applyUpdate());
        MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
            group: '7_update',
            command: {
                id: 'update.install',
                title: nls.localize('installUpdate...', "Install Update... (1)")
            },
            when: CONTEXT_UPDATE_STATE.isEqualTo("downloaded")
        });
        CommandsRegistry.registerCommand('update.updating', () => { });
        MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
            group: '7_update',
            command: {
                id: 'update.updating',
                title: nls.localize('installingUpdate', "Installing Update..."),
                precondition: ContextKeyExpr.false()
            },
            when: CONTEXT_UPDATE_STATE.isEqualTo("updating")
        });
        if (this.productService.quality === 'stable') {
            CommandsRegistry.registerCommand('update.showUpdateReleaseNotes', () => {
                if (this.updateService.state.type !== "ready") {
                    return;
                }
                const productVersion = this.updateService.state.update.productVersion;
                if (productVersion) {
                    this.instantiationService.invokeFunction(accessor => showReleaseNotes(accessor, productVersion));
                }
            });
            MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
                group: '7_update',
                order: 1,
                command: {
                    id: 'update.showUpdateReleaseNotes',
                    title: nls.localize('showUpdateReleaseNotes', "Show Update Release Notes")
                },
                when: ContextKeyExpr.and(CONTEXT_UPDATE_STATE.isEqualTo("ready"), MAJOR_MINOR_UPDATE_AVAILABLE)
            });
        }
        CommandsRegistry.registerCommand('update.restart', () => this.updateService.quitAndInstall());
        MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
            group: '7_update',
            order: 2,
            command: {
                id: 'update.restart',
                title: nls.localize('restartToUpdate', "Restart to Update (1)")
            },
            when: CONTEXT_UPDATE_STATE.isEqualTo("ready")
        });
        CommandsRegistry.registerCommand('_update.state', () => {
            return this.state;
        });
    }
};
UpdateContribution = __decorate([
    __param(0, IStorageService),
    __param(1, IInstantiationService),
    __param(2, INotificationService),
    __param(3, IDialogService),
    __param(4, IUpdateService),
    __param(5, IActivityService),
    __param(6, IContextKeyService),
    __param(7, IProductService),
    __param(8, IOpenerService),
    __param(9, IConfigurationService),
    __param(10, IHostService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], UpdateContribution);
export { UpdateContribution };
let SwitchProductQualityContribution = class SwitchProductQualityContribution extends Disposable {
    constructor(productService, environmentService) {
        super();
        this.productService = productService;
        this.environmentService = environmentService;
        this.registerGlobalActivityActions();
    }
    registerGlobalActivityActions() {
        const quality = this.productService.quality;
        const productQualityChangeHandler = this.environmentService.options?.productQualityChangeHandler;
        if (productQualityChangeHandler && (quality === 'stable' || quality === 'insider')) {
            const newQuality = quality === 'stable' ? 'insider' : 'stable';
            const commandId = `update.switchQuality.${newQuality}`;
            const isSwitchingToInsiders = newQuality === 'insider';
            this._register(registerAction2(class SwitchQuality extends Action2 {
                constructor() {
                    super({
                        id: commandId,
                        title: isSwitchingToInsiders ? nls.localize('switchToInsiders', "Switch to Insiders Version...") : nls.localize('switchToStable', "Switch to Stable Version..."),
                        precondition: IsWebContext,
                        menu: {
                            id: MenuId.GlobalActivity,
                            when: IsWebContext,
                            group: '7_update',
                        }
                    });
                }
                async run(accessor) {
                    const dialogService = accessor.get(IDialogService);
                    const userDataSyncEnablementService = accessor.get(IUserDataSyncEnablementService);
                    const userDataSyncStoreManagementService = accessor.get(IUserDataSyncStoreManagementService);
                    const storageService = accessor.get(IStorageService);
                    const userDataSyncWorkbenchService = accessor.get(IUserDataSyncWorkbenchService);
                    const userDataSyncService = accessor.get(IUserDataSyncService);
                    const notificationService = accessor.get(INotificationService);
                    try {
                        const selectSettingsSyncServiceDialogShownKey = 'switchQuality.selectSettingsSyncServiceDialogShown';
                        const userDataSyncStore = userDataSyncStoreManagementService.userDataSyncStore;
                        let userDataSyncStoreType;
                        if (userDataSyncStore && isSwitchingToInsiders && userDataSyncEnablementService.isEnabled()
                            && !storageService.getBoolean(selectSettingsSyncServiceDialogShownKey, -1, false)) {
                            userDataSyncStoreType = await this.selectSettingsSyncService(dialogService);
                            if (!userDataSyncStoreType) {
                                return;
                            }
                            storageService.store(selectSettingsSyncServiceDialogShownKey, true, -1, 0);
                            if (userDataSyncStoreType === 'stable') {
                                await userDataSyncStoreManagementService.switch(userDataSyncStoreType);
                            }
                        }
                        const res = await dialogService.confirm({
                            type: 'info',
                            message: nls.localize('relaunchMessage', "Changing the version requires a reload to take effect"),
                            detail: newQuality === 'insider' ?
                                nls.localize('relaunchDetailInsiders', "Press the reload button to switch to the Insiders version of VS Code.") :
                                nls.localize('relaunchDetailStable', "Press the reload button to switch to the Stable version of VS Code."),
                            primaryButton: nls.localize({ key: 'reload', comment: ['&& denotes a mnemonic'] }, "&&Reload")
                        });
                        if (res.confirmed) {
                            const promises = [];
                            if (userDataSyncService.status === "syncing") {
                                promises.push(Event.toPromise(Event.filter(userDataSyncService.onDidChangeStatus, status => status !== "syncing")));
                            }
                            if (isSwitchingToInsiders && userDataSyncStoreType) {
                                promises.push(userDataSyncWorkbenchService.synchroniseUserDataSyncStoreType());
                            }
                            await Promises.settled(promises);
                            productQualityChangeHandler(newQuality);
                        }
                        else {
                            if (userDataSyncStoreType) {
                                storageService.remove(selectSettingsSyncServiceDialogShownKey, -1);
                            }
                        }
                    }
                    catch (error) {
                        notificationService.error(error);
                    }
                }
                async selectSettingsSyncService(dialogService) {
                    const { result } = await dialogService.prompt({
                        type: Severity.Info,
                        message: nls.localize('selectSyncService.message', "Choose the settings sync service to use after changing the version"),
                        detail: nls.localize('selectSyncService.detail', "The Insiders version of VS Code will synchronize your settings, keybindings, extensions, snippets and UI State using separate insiders settings sync service by default."),
                        buttons: [
                            {
                                label: nls.localize({ key: 'use insiders', comment: ['&& denotes a mnemonic'] }, "&&Insiders"),
                                run: () => 'insiders'
                            },
                            {
                                label: nls.localize({ key: 'use stable', comment: ['&& denotes a mnemonic'] }, "&&Stable (current)"),
                                run: () => 'stable'
                            }
                        ],
                        cancelButton: true
                    });
                    return result;
                }
            }));
        }
    }
};
SwitchProductQualityContribution = __decorate([
    __param(0, IProductService),
    __param(1, IBrowserWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object])
], SwitchProductQualityContribution);
export { SwitchProductQualityContribution };
