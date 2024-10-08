/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
var SettingsChangeRelauncher_1;
import { dispose, Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { localize } from '../../../../nls.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { isEqual } from '../../../../base/common/resources.js';
import { isMacintosh, isNative, isLinux } from '../../../../base/common/platform.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IUserDataSyncEnablementService, IUserDataSyncService } from '../../../../platform/userDataSync/common/userDataSync.js';
import { IUserDataSyncWorkbenchService } from '../../../services/userDataSync/common/userDataSync.js';
let SettingsChangeRelauncher = class SettingsChangeRelauncher extends Disposable {
    static { SettingsChangeRelauncher_1 = this; }
    static { this.SETTINGS = [
        "window.titleBarStyle" /* TitleBarSetting.TITLE_BAR_STYLE */,
        'window.nativeTabs',
        'window.nativeFullScreen',
        'window.clickThroughInactive',
        'window.experimentalControlOverlay',
        'update.mode',
        'editor.accessibilitySupport',
        'security.workspace.trust.enabled',
        'workbench.enableExperiments',
        '_extensionsGallery.enablePPE',
        'security.restrictUNCAccess',
        'accessibility.verbosity.debug'
    ]; }
    constructor(hostService, configurationService, userDataSyncService, userDataSyncEnablementService, userDataSyncWorkbenchService, productService, dialogService) {
        super();
        this.hostService = hostService;
        this.configurationService = configurationService;
        this.userDataSyncService = userDataSyncService;
        this.userDataSyncEnablementService = userDataSyncEnablementService;
        this.productService = productService;
        this.dialogService = dialogService;
        this.titleBarStyle = new ChangeObserver('string');
        this.nativeTabs = new ChangeObserver('boolean');
        this.nativeFullScreen = new ChangeObserver('boolean');
        this.clickThroughInactive = new ChangeObserver('boolean');
        this.linuxWindowControlOverlay = new ChangeObserver('boolean');
        this.updateMode = new ChangeObserver('string');
        this.workspaceTrustEnabled = new ChangeObserver('boolean');
        this.experimentsEnabled = new ChangeObserver('boolean');
        this.enablePPEExtensionsGallery = new ChangeObserver('boolean');
        this.restrictUNCAccess = new ChangeObserver('boolean');
        this.accessibilityVerbosityDebug = new ChangeObserver('boolean');
        this.update(false);
        this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationChange(e)));
        this._register(userDataSyncWorkbenchService.onDidTurnOnSync(e => this.update(true)));
    }
    onConfigurationChange(e) {
        if (e && !SettingsChangeRelauncher_1.SETTINGS.some(key => e.affectsConfiguration(key))) {
            return;
        }
        // Skip if turning on sync is in progress
        if (this.isTurningOnSyncInProgress()) {
            return;
        }
        this.update(e.source !== 7 /* ConfigurationTarget.DEFAULT */ /* do not ask to relaunch if defaults changed */);
    }
    isTurningOnSyncInProgress() {
        return !this.userDataSyncEnablementService.isEnabled() && this.userDataSyncService.status === "syncing" /* SyncStatus.Syncing */;
    }
    update(askToRelaunch) {
        let changed = false;
        function processChanged(didChange) {
            changed = changed || didChange;
        }
        const config = this.configurationService.getValue();
        if (isNative) {
            // Titlebar style
            processChanged((config.window.titleBarStyle === "native" /* TitlebarStyle.NATIVE */ || config.window.titleBarStyle === "custom" /* TitlebarStyle.CUSTOM */) && this.titleBarStyle.handleChange(config.window?.titleBarStyle));
            // macOS: Native tabs
            processChanged(isMacintosh && this.nativeTabs.handleChange(config.window?.nativeTabs));
            // macOS: Native fullscreen
            processChanged(isMacintosh && this.nativeFullScreen.handleChange(config.window?.nativeFullScreen));
            // macOS: Click through (accept first mouse)
            processChanged(isMacintosh && this.clickThroughInactive.handleChange(config.window?.clickThroughInactive));
            // Linux: WCO
            processChanged(isLinux && this.linuxWindowControlOverlay.handleChange(config.window?.experimentalControlOverlay));
            // Update mode
            processChanged(this.updateMode.handleChange(config.update?.mode));
            // On linux turning on accessibility support will also pass this flag to the chrome renderer, thus a restart is required
            if (isLinux && typeof config.editor?.accessibilitySupport === 'string' && config.editor.accessibilitySupport !== this.accessibilitySupport) {
                this.accessibilitySupport = config.editor.accessibilitySupport;
                if (this.accessibilitySupport === 'on') {
                    changed = true;
                }
            }
            // Workspace trust
            processChanged(this.workspaceTrustEnabled.handleChange(config?.security?.workspace?.trust?.enabled));
            // UNC host access restrictions
            processChanged(this.restrictUNCAccess.handleChange(config?.security?.restrictUNCAccess));
            // Debug accessibility verbosity
            processChanged(this.accessibilityVerbosityDebug.handleChange(config?.accessibility?.verbosity?.debug));
        }
        // Experiments
        processChanged(this.experimentsEnabled.handleChange(config.workbench?.enableExperiments));
        // Profiles
        processChanged(this.productService.quality !== 'stable' && this.enablePPEExtensionsGallery.handleChange(config._extensionsGallery?.enablePPE));
        if (askToRelaunch && changed && this.hostService.hasFocus) {
            this.doConfirm(isNative ?
                localize('relaunchSettingMessage', "A setting has changed that requires a restart to take effect.") :
                localize('relaunchSettingMessageWeb', "A setting has changed that requires a reload to take effect."), isNative ?
                localize('relaunchSettingDetail', "Press the restart button to restart {0} and enable the setting.", this.productService.nameLong) :
                localize('relaunchSettingDetailWeb', "Press the reload button to reload {0} and enable the setting.", this.productService.nameLong), isNative ?
                localize({ key: 'restart', comment: ['&& denotes a mnemonic'] }, "&&Restart") :
                localize({ key: 'restartWeb', comment: ['&& denotes a mnemonic'] }, "&&Reload"), () => this.hostService.restart());
        }
    }
    async doConfirm(message, detail, primaryButton, confirmedFn) {
        const { confirmed } = await this.dialogService.confirm({ message, detail, primaryButton });
        if (confirmed) {
            confirmedFn();
        }
    }
};
SettingsChangeRelauncher = SettingsChangeRelauncher_1 = __decorate([
    __param(0, IHostService),
    __param(1, IConfigurationService),
    __param(2, IUserDataSyncService),
    __param(3, IUserDataSyncEnablementService),
    __param(4, IUserDataSyncWorkbenchService),
    __param(5, IProductService),
    __param(6, IDialogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], SettingsChangeRelauncher);
export { SettingsChangeRelauncher };
class ChangeObserver {
    static create(typeName) {
        return new ChangeObserver(typeName);
    }
    constructor(typeName) {
        this.typeName = typeName;
        this.lastValue = undefined;
    }
    /**
     * Returns if there was a change compared to the last value
     */
    handleChange(value) {
        if (typeof value === this.typeName && value !== this.lastValue) {
            this.lastValue = value;
            return true;
        }
        return false;
    }
}
let WorkspaceChangeExtHostRelauncher = class WorkspaceChangeExtHostRelauncher extends Disposable {
    constructor(contextService, extensionService, hostService, environmentService) {
        super();
        this.contextService = contextService;
        this.extensionHostRestarter = this._register(new RunOnceScheduler(async () => {
            if (!!environmentService.extensionTestsLocationURI) {
                return; // no restart when in tests: see https://github.com/microsoft/vscode/issues/66936
            }
            if (environmentService.remoteAuthority) {
                hostService.reload(); // TODO@aeschli, workaround
            }
            else if (isNative) {
                const stopped = await extensionService.stopExtensionHosts(localize('restartExtensionHost.reason', "Restarting extension host due to a workspace folder change."));
                if (stopped) {
                    extensionService.startExtensionHosts();
                }
            }
        }, 10));
        this.contextService.getCompleteWorkspace()
            .then(workspace => {
            this.firstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : undefined;
            this.handleWorkbenchState();
            this._register(this.contextService.onDidChangeWorkbenchState(() => setTimeout(() => this.handleWorkbenchState())));
        });
        this._register(toDisposable(() => {
            this.onDidChangeWorkspaceFoldersUnbind?.dispose();
        }));
    }
    handleWorkbenchState() {
        // React to folder changes when we are in workspace state
        if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
            // Update our known first folder path if we entered workspace
            const workspace = this.contextService.getWorkspace();
            this.firstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : undefined;
            // Install workspace folder listener
            if (!this.onDidChangeWorkspaceFoldersUnbind) {
                this.onDidChangeWorkspaceFoldersUnbind = this.contextService.onDidChangeWorkspaceFolders(() => this.onDidChangeWorkspaceFolders());
            }
        }
        // Ignore the workspace folder changes in EMPTY or FOLDER state
        else {
            dispose(this.onDidChangeWorkspaceFoldersUnbind);
            this.onDidChangeWorkspaceFoldersUnbind = undefined;
        }
    }
    onDidChangeWorkspaceFolders() {
        const workspace = this.contextService.getWorkspace();
        // Restart extension host if first root folder changed (impact on deprecated workspace.rootPath API)
        const newFirstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : undefined;
        if (!isEqual(this.firstFolderResource, newFirstFolderResource)) {
            this.firstFolderResource = newFirstFolderResource;
            this.extensionHostRestarter.schedule(); // buffer calls to extension host restart
        }
    }
};
WorkspaceChangeExtHostRelauncher = __decorate([
    __param(0, IWorkspaceContextService),
    __param(1, IExtensionService),
    __param(2, IHostService),
    __param(3, IWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], WorkspaceChangeExtHostRelauncher);
export { WorkspaceChangeExtHostRelauncher };
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(SettingsChangeRelauncher, 3 /* LifecyclePhase.Restored */);
workbenchRegistry.registerWorkbenchContribution(WorkspaceChangeExtHostRelauncher, 3 /* LifecyclePhase.Restored */);
