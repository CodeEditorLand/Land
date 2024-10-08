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
import './media/workspaceTrustEditor.css';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Severity } from '../../../../platform/notification/common/notification.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { Extensions as WorkbenchExtensions, registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
import { EditorPaneDescriptor } from '../../../browser/editor.js';
import { shieldIcon, WorkspaceTrustEditor } from './workspaceTrustEditor.js';
import { WorkspaceTrustEditorInput } from '../../../services/workspaces/browser/workspaceTrustEditorInput.js';
import { WORKSPACE_TRUST_BANNER, WORKSPACE_TRUST_EMPTY_WINDOW, WORKSPACE_TRUST_ENABLED, WORKSPACE_TRUST_STARTUP_PROMPT, WORKSPACE_TRUST_UNTRUSTED_FILES } from '../../../services/workspaces/common/workspaceTrust.js';
import { EditorExtensions } from '../../../common/editor.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { isEmptyWorkspaceIdentifier, isSingleFolderWorkspaceIdentifier, IWorkspaceContextService, toWorkspaceIdentifier } from '../../../../platform/workspace/common/workspace.js';
import { dirname, resolve } from '../../../../base/common/path.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IBannerService } from '../../../services/banner/browser/bannerService.js';
import { isVirtualWorkspace } from '../../../../platform/workspace/common/virtualWorkspace.js';
import { LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID } from '../../extensions/common/extensions.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { WORKSPACE_TRUST_SETTING_TAG } from '../../preferences/common/preferences.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { MANAGE_TRUST_COMMAND_ID, WorkspaceTrustContext } from '../common/workspace.js';
import { isWeb } from '../../../../base/common/platform.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { securityConfigurationNodeBase } from '../../../common/configuration.js';
import { basename, dirname as uriDirname } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
const BANNER_RESTRICTED_MODE = 'workbench.banner.restrictedMode';
const STARTUP_PROMPT_SHOWN_KEY = 'workspace.trust.startupPrompt.shown';
const BANNER_RESTRICTED_MODE_DISMISSED_KEY = 'workbench.banner.restrictedMode.dismissed';
let WorkspaceTrustContextKeys = class WorkspaceTrustContextKeys extends Disposable {
    constructor(contextKeyService, workspaceTrustEnablementService, workspaceTrustManagementService) {
        super();
        this._ctxWorkspaceTrustEnabled = WorkspaceTrustContext.IsEnabled.bindTo(contextKeyService);
        this._ctxWorkspaceTrustEnabled.set(workspaceTrustEnablementService.isWorkspaceTrustEnabled());
        this._ctxWorkspaceTrustState = WorkspaceTrustContext.IsTrusted.bindTo(contextKeyService);
        this._ctxWorkspaceTrustState.set(workspaceTrustManagementService.isWorkspaceTrusted());
        this._register(workspaceTrustManagementService.onDidChangeTrust(trusted => this._ctxWorkspaceTrustState.set(trusted)));
    }
};
WorkspaceTrustContextKeys = __decorate([
    __param(0, IContextKeyService),
    __param(1, IWorkspaceTrustEnablementService),
    __param(2, IWorkspaceTrustManagementService),
    __metadata("design:paramtypes", [Object, Object, Object])
], WorkspaceTrustContextKeys);
export { WorkspaceTrustContextKeys };
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(WorkspaceTrustContextKeys, 3 /* LifecyclePhase.Restored */);
/*
 * Trust Request via Service UX handler
 */
let WorkspaceTrustRequestHandler = class WorkspaceTrustRequestHandler extends Disposable {
    static { this.ID = 'workbench.contrib.workspaceTrustRequestHandler'; }
    constructor(dialogService, commandService, workspaceContextService, workspaceTrustManagementService, workspaceTrustRequestService) {
        super();
        this.dialogService = dialogService;
        this.commandService = commandService;
        this.workspaceContextService = workspaceContextService;
        this.workspaceTrustManagementService = workspaceTrustManagementService;
        this.workspaceTrustRequestService = workspaceTrustRequestService;
        this.registerListeners();
    }
    get useWorkspaceLanguage() {
        return !isSingleFolderWorkspaceIdentifier(toWorkspaceIdentifier(this.workspaceContextService.getWorkspace()));
    }
    registerListeners() {
        // Open files trust request
        this._register(this.workspaceTrustRequestService.onDidInitiateOpenFilesTrustRequest(async () => {
            await this.workspaceTrustManagementService.workspaceResolved;
            // Details
            const markdownDetails = [
                this.workspaceContextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ?
                    localize('openLooseFileWorkspaceDetails', "You are trying to open untrusted files in a workspace which is trusted.") :
                    localize('openLooseFileWindowDetails', "You are trying to open untrusted files in a window which is trusted."),
                localize('openLooseFileLearnMore', "If you don't want to open untrusted files, we recommend to open them in Restricted Mode in a new window as the files may be malicious. See [our docs](https://aka.ms/vscode-workspace-trust) to learn more.")
            ];
            // Dialog
            await this.dialogService.prompt({
                type: Severity.Info,
                message: this.workspaceContextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ?
                    localize('openLooseFileWorkspaceMesssage', "Do you want to allow untrusted files in this workspace?") :
                    localize('openLooseFileWindowMesssage', "Do you want to allow untrusted files in this window?"),
                buttons: [
                    {
                        label: localize({ key: 'open', comment: ['&& denotes a mnemonic'] }, "&&Open"),
                        run: ({ checkboxChecked }) => this.workspaceTrustRequestService.completeOpenFilesTrustRequest(1 /* WorkspaceTrustUriResponse.Open */, !!checkboxChecked)
                    },
                    {
                        label: localize({ key: 'newWindow', comment: ['&& denotes a mnemonic'] }, "Open in &&Restricted Mode"),
                        run: ({ checkboxChecked }) => this.workspaceTrustRequestService.completeOpenFilesTrustRequest(2 /* WorkspaceTrustUriResponse.OpenInNewWindow */, !!checkboxChecked)
                    }
                ],
                cancelButton: {
                    run: () => this.workspaceTrustRequestService.completeOpenFilesTrustRequest(3 /* WorkspaceTrustUriResponse.Cancel */)
                },
                checkbox: {
                    label: localize('openLooseFileWorkspaceCheckbox', "Remember my decision for all workspaces"),
                    checked: false
                },
                custom: {
                    icon: Codicon.shield,
                    markdownDetails: markdownDetails.map(md => { return { markdown: new MarkdownString(md) }; })
                }
            });
        }));
        // Workspace trust request
        this._register(this.workspaceTrustRequestService.onDidInitiateWorkspaceTrustRequest(async (requestOptions) => {
            await this.workspaceTrustManagementService.workspaceResolved;
            // Title
            const message = this.useWorkspaceLanguage ?
                localize('workspaceTrust', "Do you trust the authors of the files in this workspace?") :
                localize('folderTrust', "Do you trust the authors of the files in this folder?");
            // Message
            const defaultDetails = localize('immediateTrustRequestMessage', "A feature you are trying to use may be a security risk if you do not trust the source of the files or folders you currently have open.");
            const details = requestOptions?.message ?? defaultDetails;
            // Buttons
            const buttons = requestOptions?.buttons ?? [
                { label: this.useWorkspaceLanguage ? localize({ key: 'grantWorkspaceTrustButton', comment: ['&& denotes a mnemonic'] }, "&&Trust Workspace & Continue") : localize({ key: 'grantFolderTrustButton', comment: ['&& denotes a mnemonic'] }, "&&Trust Folder & Continue"), type: 'ContinueWithTrust' },
                { label: localize({ key: 'manageWorkspaceTrustButton', comment: ['&& denotes a mnemonic'] }, "&&Manage"), type: 'Manage' }
            ];
            // Add Cancel button if not provided
            if (!buttons.some(b => b.type === 'Cancel')) {
                buttons.push({ label: localize('cancelWorkspaceTrustButton', "Cancel"), type: 'Cancel' });
            }
            // Dialog
            const { result } = await this.dialogService.prompt({
                type: Severity.Info,
                message,
                custom: {
                    icon: Codicon.shield,
                    markdownDetails: [
                        { markdown: new MarkdownString(details) },
                        { markdown: new MarkdownString(localize('immediateTrustRequestLearnMore', "If you don't trust the authors of these files, we do not recommend continuing as the files may be malicious. See [our docs](https://aka.ms/vscode-workspace-trust) to learn more.")) }
                    ]
                },
                buttons: buttons.filter(b => b.type !== 'Cancel').map(button => {
                    return {
                        label: button.label,
                        run: () => button.type
                    };
                }),
                cancelButton: (() => {
                    const cancelButton = buttons.find(b => b.type === 'Cancel');
                    if (!cancelButton) {
                        return undefined;
                    }
                    return {
                        label: cancelButton.label,
                        run: () => cancelButton.type
                    };
                })()
            });
            // Dialog result
            switch (result) {
                case 'ContinueWithTrust':
                    await this.workspaceTrustRequestService.completeWorkspaceTrustRequest(true);
                    break;
                case 'ContinueWithoutTrust':
                    await this.workspaceTrustRequestService.completeWorkspaceTrustRequest(undefined);
                    break;
                case 'Manage':
                    this.workspaceTrustRequestService.cancelWorkspaceTrustRequest();
                    await this.commandService.executeCommand(MANAGE_TRUST_COMMAND_ID);
                    break;
                case 'Cancel':
                    this.workspaceTrustRequestService.cancelWorkspaceTrustRequest();
                    break;
            }
        }));
    }
};
WorkspaceTrustRequestHandler = __decorate([
    __param(0, IDialogService),
    __param(1, ICommandService),
    __param(2, IWorkspaceContextService),
    __param(3, IWorkspaceTrustManagementService),
    __param(4, IWorkspaceTrustRequestService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], WorkspaceTrustRequestHandler);
export { WorkspaceTrustRequestHandler };
/*
 * Trust UX and Startup Handler
 */
let WorkspaceTrustUXHandler = class WorkspaceTrustUXHandler extends Disposable {
    constructor(dialogService, workspaceContextService, workspaceTrustEnablementService, workspaceTrustManagementService, configurationService, statusbarService, storageService, workspaceTrustRequestService, bannerService, labelService, hostService, productService, remoteAgentService, environmentService, fileService) {
        super();
        this.dialogService = dialogService;
        this.workspaceContextService = workspaceContextService;
        this.workspaceTrustEnablementService = workspaceTrustEnablementService;
        this.workspaceTrustManagementService = workspaceTrustManagementService;
        this.configurationService = configurationService;
        this.statusbarService = statusbarService;
        this.storageService = storageService;
        this.workspaceTrustRequestService = workspaceTrustRequestService;
        this.bannerService = bannerService;
        this.labelService = labelService;
        this.hostService = hostService;
        this.productService = productService;
        this.remoteAgentService = remoteAgentService;
        this.environmentService = environmentService;
        this.fileService = fileService;
        this.entryId = `status.workspaceTrust`;
        this.statusbarEntryAccessor = this._register(new MutableDisposable());
        (async () => {
            await this.workspaceTrustManagementService.workspaceTrustInitialized;
            if (this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
                this.registerListeners();
                this.updateStatusbarEntry(this.workspaceTrustManagementService.isWorkspaceTrusted());
                // Show modal dialog
                if (this.hostService.hasFocus) {
                    this.showModalOnStart();
                }
                else {
                    const focusDisposable = this.hostService.onDidChangeFocus(focused => {
                        if (focused) {
                            focusDisposable.dispose();
                            this.showModalOnStart();
                        }
                    });
                }
            }
        })();
    }
    registerListeners() {
        this._register(this.workspaceContextService.onWillChangeWorkspaceFolders(e => {
            if (e.fromCache) {
                return;
            }
            if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
                return;
            }
            const addWorkspaceFolder = async (e) => {
                const trusted = this.workspaceTrustManagementService.isWorkspaceTrusted();
                // Workspace is trusted and there are added/changed folders
                if (trusted && (e.changes.added.length || e.changes.changed.length)) {
                    const addedFoldersTrustInfo = await Promise.all(e.changes.added.map(folder => this.workspaceTrustManagementService.getUriTrustInfo(folder.uri)));
                    if (!addedFoldersTrustInfo.map(info => info.trusted).every(trusted => trusted)) {
                        const { confirmed } = await this.dialogService.confirm({
                            type: Severity.Info,
                            message: localize('addWorkspaceFolderMessage', "Do you trust the authors of the files in this folder?"),
                            detail: localize('addWorkspaceFolderDetail', "You are adding files that are not currently trusted to a trusted workspace. Do you trust the authors of these new files?"),
                            cancelButton: localize('no', 'No'),
                            custom: { icon: Codicon.shield }
                        });
                        // Mark added/changed folders as trusted
                        await this.workspaceTrustManagementService.setUrisTrust(addedFoldersTrustInfo.map(i => i.uri), confirmed);
                    }
                }
            };
            return e.join(addWorkspaceFolder(e));
        }));
        this._register(this.workspaceTrustManagementService.onDidChangeTrust(trusted => {
            this.updateWorkbenchIndicators(trusted);
        }));
        this._register(this.workspaceTrustRequestService.onDidInitiateWorkspaceTrustRequestOnStartup(async () => {
            let titleString;
            let learnMoreString;
            let trustOption;
            let dontTrustOption;
            const isAiGeneratedWorkspace = await this.isAiGeneratedWorkspace();
            if (isAiGeneratedWorkspace && this.productService.aiGeneratedWorkspaceTrust) {
                titleString = this.productService.aiGeneratedWorkspaceTrust.title;
                learnMoreString = this.productService.aiGeneratedWorkspaceTrust.startupTrustRequestLearnMore;
                trustOption = this.productService.aiGeneratedWorkspaceTrust.trustOption;
                dontTrustOption = this.productService.aiGeneratedWorkspaceTrust.dontTrustOption;
            }
            else {
                console.warn('AI generated workspace trust dialog contents not available.');
            }
            const title = titleString ?? (this.useWorkspaceLanguage ?
                localize('workspaceTrust', "Do you trust the authors of the files in this workspace?") :
                localize('folderTrust', "Do you trust the authors of the files in this folder?"));
            let checkboxText;
            const workspaceIdentifier = toWorkspaceIdentifier(this.workspaceContextService.getWorkspace());
            const isSingleFolderWorkspace = isSingleFolderWorkspaceIdentifier(workspaceIdentifier);
            const isEmptyWindow = isEmptyWorkspaceIdentifier(workspaceIdentifier);
            if (!isAiGeneratedWorkspace && this.workspaceTrustManagementService.canSetParentFolderTrust()) {
                const name = basename(uriDirname(workspaceIdentifier.uri));
                checkboxText = localize('checkboxString', "Trust the authors of all files in the parent folder '{0}'", name);
            }
            // Show Workspace Trust Start Dialog
            this.doShowModal(title, { label: trustOption ?? localize({ key: 'trustOption', comment: ['&& denotes a mnemonic'] }, "&&Yes, I trust the authors"), sublabel: isSingleFolderWorkspace ? localize('trustFolderOptionDescription', "Trust folder and enable all features") : localize('trustWorkspaceOptionDescription', "Trust workspace and enable all features") }, { label: dontTrustOption ?? localize({ key: 'dontTrustOption', comment: ['&& denotes a mnemonic'] }, "&&No, I don't trust the authors"), sublabel: isSingleFolderWorkspace ? localize('dontTrustFolderOptionDescription', "Browse folder in restricted mode") : localize('dontTrustWorkspaceOptionDescription', "Browse workspace in restricted mode") }, [
                !isSingleFolderWorkspace ?
                    localize('workspaceStartupTrustDetails', "{0} provides features that may automatically execute files in this workspace.", this.productService.nameShort) :
                    localize('folderStartupTrustDetails', "{0} provides features that may automatically execute files in this folder.", this.productService.nameShort),
                learnMoreString ?? localize('startupTrustRequestLearnMore', "If you don't trust the authors of these files, we recommend to continue in restricted mode as the files may be malicious. See [our docs](https://aka.ms/vscode-workspace-trust) to learn more."),
                !isEmptyWindow ?
                    `\`${this.labelService.getWorkspaceLabel(workspaceIdentifier, { verbose: 2 /* Verbosity.LONG */ })}\`` : '',
            ], checkboxText);
        }));
    }
    updateWorkbenchIndicators(trusted) {
        const bannerItem = this.getBannerItem(!trusted);
        this.updateStatusbarEntry(trusted);
        if (bannerItem) {
            if (!trusted) {
                this.bannerService.show(bannerItem);
            }
            else {
                this.bannerService.hide(BANNER_RESTRICTED_MODE);
            }
        }
    }
    //#region Dialog
    async doShowModal(question, trustedOption, untrustedOption, markdownStrings, trustParentString) {
        await this.dialogService.prompt({
            type: Severity.Info,
            message: question,
            checkbox: trustParentString ? {
                label: trustParentString
            } : undefined,
            buttons: [
                {
                    label: trustedOption.label,
                    run: async ({ checkboxChecked }) => {
                        if (checkboxChecked) {
                            await this.workspaceTrustManagementService.setParentFolderTrust(true);
                        }
                        else {
                            await this.workspaceTrustRequestService.completeWorkspaceTrustRequest(true);
                        }
                    }
                },
                {
                    label: untrustedOption.label,
                    run: () => {
                        this.updateWorkbenchIndicators(false);
                        this.workspaceTrustRequestService.cancelWorkspaceTrustRequest();
                    }
                }
            ],
            custom: {
                buttonDetails: [
                    trustedOption.sublabel,
                    untrustedOption.sublabel
                ],
                disableCloseAction: true,
                icon: Codicon.shield,
                markdownDetails: markdownStrings.map(md => { return { markdown: new MarkdownString(md) }; })
            }
        });
        this.storageService.store(STARTUP_PROMPT_SHOWN_KEY, true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
    }
    async showModalOnStart() {
        if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
            this.updateWorkbenchIndicators(true);
            return;
        }
        // Don't show modal prompt if workspace trust cannot be changed
        if (!(this.workspaceTrustManagementService.canSetWorkspaceTrust())) {
            return;
        }
        // Don't show modal prompt for virtual workspaces by default
        if (isVirtualWorkspace(this.workspaceContextService.getWorkspace())) {
            this.updateWorkbenchIndicators(false);
            return;
        }
        // Don't show modal prompt for empty workspaces by default
        if (this.workspaceContextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
            this.updateWorkbenchIndicators(false);
            return;
        }
        if (this.startupPromptSetting === 'never') {
            this.updateWorkbenchIndicators(false);
            return;
        }
        if (this.startupPromptSetting === 'once' && this.storageService.getBoolean(STARTUP_PROMPT_SHOWN_KEY, 1 /* StorageScope.WORKSPACE */, false)) {
            this.updateWorkbenchIndicators(false);
            return;
        }
        // Use the workspace trust request service to show modal dialog
        this.workspaceTrustRequestService.requestWorkspaceTrustOnStartup();
    }
    get startupPromptSetting() {
        return this.configurationService.getValue(WORKSPACE_TRUST_STARTUP_PROMPT);
    }
    get useWorkspaceLanguage() {
        return !isSingleFolderWorkspaceIdentifier(toWorkspaceIdentifier(this.workspaceContextService.getWorkspace()));
    }
    async isAiGeneratedWorkspace() {
        const aiGeneratedWorkspaces = URI.joinPath(this.environmentService.workspaceStorageHome, 'aiGeneratedWorkspaces.json');
        return await this.fileService.exists(aiGeneratedWorkspaces).then(async (result) => {
            if (result) {
                try {
                    const content = await this.fileService.readFile(aiGeneratedWorkspaces);
                    const workspaces = JSON.parse(content.value.toString());
                    if (workspaces.indexOf(this.workspaceContextService.getWorkspace().folders[0].uri.toString()) > -1) {
                        return true;
                    }
                }
                catch (e) {
                    // Ignore errors when resolving file contents
                }
            }
            return false;
        });
    }
    //#endregion
    //#region Banner
    getBannerItem(restrictedMode) {
        const dismissedRestricted = this.storageService.getBoolean(BANNER_RESTRICTED_MODE_DISMISSED_KEY, 1 /* StorageScope.WORKSPACE */, false);
        // never show the banner
        if (this.bannerSetting === 'never') {
            return undefined;
        }
        // info has been dismissed
        if (this.bannerSetting === 'untilDismissed' && dismissedRestricted) {
            return undefined;
        }
        const actions = [
            {
                label: localize('restrictedModeBannerManage', "Manage"),
                href: 'command:' + MANAGE_TRUST_COMMAND_ID
            },
            {
                label: localize('restrictedModeBannerLearnMore', "Learn More"),
                href: 'https://aka.ms/vscode-workspace-trust'
            }
        ];
        return {
            id: BANNER_RESTRICTED_MODE,
            icon: shieldIcon,
            ariaLabel: this.getBannerItemAriaLabels(),
            message: this.getBannerItemMessages(),
            actions,
            onClose: () => {
                if (restrictedMode) {
                    this.storageService.store(BANNER_RESTRICTED_MODE_DISMISSED_KEY, true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                }
            }
        };
    }
    getBannerItemAriaLabels() {
        switch (this.workspaceContextService.getWorkbenchState()) {
            case 1 /* WorkbenchState.EMPTY */:
                return localize('restrictedModeBannerAriaLabelWindow', "Restricted Mode is intended for safe code browsing. Trust this window to enable all features. Use navigation keys to access banner actions.");
            case 2 /* WorkbenchState.FOLDER */:
                return localize('restrictedModeBannerAriaLabelFolder', "Restricted Mode is intended for safe code browsing. Trust this folder to enable all features. Use navigation keys to access banner actions.");
            case 3 /* WorkbenchState.WORKSPACE */:
                return localize('restrictedModeBannerAriaLabelWorkspace', "Restricted Mode is intended for safe code browsing. Trust this workspace to enable all features. Use navigation keys to access banner actions.");
        }
    }
    getBannerItemMessages() {
        switch (this.workspaceContextService.getWorkbenchState()) {
            case 1 /* WorkbenchState.EMPTY */:
                return localize('restrictedModeBannerMessageWindow', "Restricted Mode is intended for safe code browsing. Trust this window to enable all features.");
            case 2 /* WorkbenchState.FOLDER */:
                return localize('restrictedModeBannerMessageFolder', "Restricted Mode is intended for safe code browsing. Trust this folder to enable all features.");
            case 3 /* WorkbenchState.WORKSPACE */:
                return localize('restrictedModeBannerMessageWorkspace', "Restricted Mode is intended for safe code browsing. Trust this workspace to enable all features.");
        }
    }
    get bannerSetting() {
        const result = this.configurationService.getValue(WORKSPACE_TRUST_BANNER);
        // In serverless environments, we don't need to aggressively show the banner
        if (result !== 'always' && isWeb && !this.remoteAgentService.getConnection()?.remoteAuthority) {
            return 'never';
        }
        return result;
    }
    //#endregion
    //#region Statusbar
    getRestrictedModeStatusbarEntry() {
        let ariaLabel = '';
        let toolTip;
        switch (this.workspaceContextService.getWorkbenchState()) {
            case 1 /* WorkbenchState.EMPTY */: {
                ariaLabel = localize('status.ariaUntrustedWindow', "Restricted Mode: Some features are disabled because this window is not trusted.");
                toolTip = {
                    value: localize({ key: 'status.tooltipUntrustedWindow2', comment: ['[abc]({n}) are links.  Only translate `features are disabled` and `window is not trusted`. Do not change brackets and parentheses or {n}'] }, "Running in Restricted Mode\n\nSome [features are disabled]({0}) because this [window is not trusted]({1}).", `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`, `command:${MANAGE_TRUST_COMMAND_ID}`),
                    isTrusted: true,
                    supportThemeIcons: true
                };
                break;
            }
            case 2 /* WorkbenchState.FOLDER */: {
                ariaLabel = localize('status.ariaUntrustedFolder', "Restricted Mode: Some features are disabled because this folder is not trusted.");
                toolTip = {
                    value: localize({ key: 'status.tooltipUntrustedFolder2', comment: ['[abc]({n}) are links.  Only translate `features are disabled` and `folder is not trusted`. Do not change brackets and parentheses or {n}'] }, "Running in Restricted Mode\n\nSome [features are disabled]({0}) because this [folder is not trusted]({1}).", `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`, `command:${MANAGE_TRUST_COMMAND_ID}`),
                    isTrusted: true,
                    supportThemeIcons: true
                };
                break;
            }
            case 3 /* WorkbenchState.WORKSPACE */: {
                ariaLabel = localize('status.ariaUntrustedWorkspace', "Restricted Mode: Some features are disabled because this workspace is not trusted.");
                toolTip = {
                    value: localize({ key: 'status.tooltipUntrustedWorkspace2', comment: ['[abc]({n}) are links. Only translate `features are disabled` and `workspace is not trusted`. Do not change brackets and parentheses or {n}'] }, "Running in Restricted Mode\n\nSome [features are disabled]({0}) because this [workspace is not trusted]({1}).", `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`, `command:${MANAGE_TRUST_COMMAND_ID}`),
                    isTrusted: true,
                    supportThemeIcons: true
                };
                break;
            }
        }
        return {
            name: localize('status.WorkspaceTrust', "Workspace Trust"),
            text: `$(shield) ${localize('untrusted', "Restricted Mode")}`,
            ariaLabel: ariaLabel,
            tooltip: toolTip,
            command: MANAGE_TRUST_COMMAND_ID,
            kind: 'prominent'
        };
    }
    updateStatusbarEntry(trusted) {
        if (trusted && this.statusbarEntryAccessor.value) {
            this.statusbarEntryAccessor.clear();
            return;
        }
        if (!trusted && !this.statusbarEntryAccessor.value) {
            const entry = this.getRestrictedModeStatusbarEntry();
            this.statusbarEntryAccessor.value = this.statusbarService.addEntry(entry, this.entryId, 0 /* StatusbarAlignment.LEFT */, 0.99 * Number.MAX_VALUE /* Right of remote indicator */);
        }
    }
};
WorkspaceTrustUXHandler = __decorate([
    __param(0, IDialogService),
    __param(1, IWorkspaceContextService),
    __param(2, IWorkspaceTrustEnablementService),
    __param(3, IWorkspaceTrustManagementService),
    __param(4, IConfigurationService),
    __param(5, IStatusbarService),
    __param(6, IStorageService),
    __param(7, IWorkspaceTrustRequestService),
    __param(8, IBannerService),
    __param(9, ILabelService),
    __param(10, IHostService),
    __param(11, IProductService),
    __param(12, IRemoteAgentService),
    __param(13, IEnvironmentService),
    __param(14, IFileService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], WorkspaceTrustUXHandler);
export { WorkspaceTrustUXHandler };
registerWorkbenchContribution2(WorkspaceTrustRequestHandler.ID, WorkspaceTrustRequestHandler, 2 /* WorkbenchPhase.BlockRestore */);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(WorkspaceTrustUXHandler, 3 /* LifecyclePhase.Restored */);
/**
 * Trusted Workspace GUI Editor
 */
class WorkspaceTrustEditorInputSerializer {
    canSerialize(editorInput) {
        return true;
    }
    serialize(input) {
        return '';
    }
    deserialize(instantiationService) {
        return instantiationService.createInstance(WorkspaceTrustEditorInput);
    }
}
Registry.as(EditorExtensions.EditorFactory)
    .registerEditorSerializer(WorkspaceTrustEditorInput.ID, WorkspaceTrustEditorInputSerializer);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(WorkspaceTrustEditor, WorkspaceTrustEditor.ID, localize('workspaceTrustEditor', "Workspace Trust Editor")), [
    new SyncDescriptor(WorkspaceTrustEditorInput)
]);
/*
 * Actions
 */
// Configure Workspace Trust Settings
const CONFIGURE_TRUST_COMMAND_ID = 'workbench.trust.configure';
const WORKSPACES_CATEGORY = localize2('workspacesCategory', 'Workspaces');
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: CONFIGURE_TRUST_COMMAND_ID,
            title: localize2('configureWorkspaceTrustSettings', "Configure Workspace Trust Settings"),
            precondition: ContextKeyExpr.and(WorkspaceTrustContext.IsEnabled, ContextKeyExpr.equals(`config.${WORKSPACE_TRUST_ENABLED}`, true)),
            category: WORKSPACES_CATEGORY,
            f1: true
        });
    }
    run(accessor) {
        accessor.get(IPreferencesService).openUserSettings({ jsonEditor: false, query: `@tag:${WORKSPACE_TRUST_SETTING_TAG}` });
    }
});
// Manage Workspace Trust
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: MANAGE_TRUST_COMMAND_ID,
            title: localize2('manageWorkspaceTrust', "Manage Workspace Trust"),
            precondition: ContextKeyExpr.and(WorkspaceTrustContext.IsEnabled, ContextKeyExpr.equals(`config.${WORKSPACE_TRUST_ENABLED}`, true)),
            category: WORKSPACES_CATEGORY,
            f1: true,
        });
    }
    run(accessor) {
        const editorService = accessor.get(IEditorService);
        const instantiationService = accessor.get(IInstantiationService);
        const input = instantiationService.createInstance(WorkspaceTrustEditorInput);
        editorService.openEditor(input, { pinned: true });
        return;
    }
});
/*
 * Configuration
 */
Registry.as(ConfigurationExtensions.Configuration)
    .registerConfiguration({
    ...securityConfigurationNodeBase,
    properties: {
        [WORKSPACE_TRUST_ENABLED]: {
            type: 'boolean',
            default: true,
            description: localize('workspace.trust.description', "Controls whether or not Workspace Trust is enabled within VS Code."),
            tags: [WORKSPACE_TRUST_SETTING_TAG],
            scope: 1 /* ConfigurationScope.APPLICATION */,
        },
        [WORKSPACE_TRUST_STARTUP_PROMPT]: {
            type: 'string',
            default: 'once',
            description: localize('workspace.trust.startupPrompt.description', "Controls when the startup prompt to trust a workspace is shown."),
            tags: [WORKSPACE_TRUST_SETTING_TAG],
            scope: 1 /* ConfigurationScope.APPLICATION */,
            enum: ['always', 'once', 'never'],
            enumDescriptions: [
                localize('workspace.trust.startupPrompt.always', "Ask for trust every time an untrusted workspace is opened."),
                localize('workspace.trust.startupPrompt.once', "Ask for trust the first time an untrusted workspace is opened."),
                localize('workspace.trust.startupPrompt.never', "Do not ask for trust when an untrusted workspace is opened."),
            ]
        },
        [WORKSPACE_TRUST_BANNER]: {
            type: 'string',
            default: 'untilDismissed',
            description: localize('workspace.trust.banner.description', "Controls when the restricted mode banner is shown."),
            tags: [WORKSPACE_TRUST_SETTING_TAG],
            scope: 1 /* ConfigurationScope.APPLICATION */,
            enum: ['always', 'untilDismissed', 'never'],
            enumDescriptions: [
                localize('workspace.trust.banner.always', "Show the banner every time an untrusted workspace is open."),
                localize('workspace.trust.banner.untilDismissed', "Show the banner when an untrusted workspace is opened until dismissed."),
                localize('workspace.trust.banner.never', "Do not show the banner when an untrusted workspace is open."),
            ]
        },
        [WORKSPACE_TRUST_UNTRUSTED_FILES]: {
            type: 'string',
            default: 'prompt',
            markdownDescription: localize('workspace.trust.untrustedFiles.description', "Controls how to handle opening untrusted files in a trusted workspace. This setting also applies to opening files in an empty window which is trusted via `#{0}#`.", WORKSPACE_TRUST_EMPTY_WINDOW),
            tags: [WORKSPACE_TRUST_SETTING_TAG],
            scope: 1 /* ConfigurationScope.APPLICATION */,
            enum: ['prompt', 'open', 'newWindow'],
            enumDescriptions: [
                localize('workspace.trust.untrustedFiles.prompt', "Ask how to handle untrusted files for each workspace. Once untrusted files are introduced to a trusted workspace, you will not be prompted again."),
                localize('workspace.trust.untrustedFiles.open', "Always allow untrusted files to be introduced to a trusted workspace without prompting."),
                localize('workspace.trust.untrustedFiles.newWindow', "Always open untrusted files in a separate window in restricted mode without prompting."),
            ]
        },
        [WORKSPACE_TRUST_EMPTY_WINDOW]: {
            type: 'boolean',
            default: true,
            markdownDescription: localize('workspace.trust.emptyWindow.description', "Controls whether or not the empty window is trusted by default within VS Code. When used with `#{0}#`, you can enable the full functionality of VS Code without prompting in an empty window.", WORKSPACE_TRUST_UNTRUSTED_FILES),
            tags: [WORKSPACE_TRUST_SETTING_TAG],
            scope: 1 /* ConfigurationScope.APPLICATION */
        }
    }
});
let WorkspaceTrustTelemetryContribution = class WorkspaceTrustTelemetryContribution extends Disposable {
    constructor(environmentService, telemetryService, workspaceContextService, workspaceTrustEnablementService, workspaceTrustManagementService) {
        super();
        this.environmentService = environmentService;
        this.telemetryService = telemetryService;
        this.workspaceContextService = workspaceContextService;
        this.workspaceTrustEnablementService = workspaceTrustEnablementService;
        this.workspaceTrustManagementService = workspaceTrustManagementService;
        this.workspaceTrustManagementService.workspaceTrustInitialized
            .then(() => {
            this.logInitialWorkspaceTrustInfo();
            this.logWorkspaceTrust(this.workspaceTrustManagementService.isWorkspaceTrusted());
            this._register(this.workspaceTrustManagementService.onDidChangeTrust(isTrusted => this.logWorkspaceTrust(isTrusted)));
        });
    }
    logInitialWorkspaceTrustInfo() {
        if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
            const disabledByCliFlag = this.environmentService.disableWorkspaceTrust;
            this.telemetryService.publicLog2('workspaceTrustDisabled', {
                reason: disabledByCliFlag ? 'cli' : 'setting'
            });
            return;
        }
        this.telemetryService.publicLog2('workspaceTrustFolderCounts', {
            trustedFoldersCount: this.workspaceTrustManagementService.getTrustedUris().length,
        });
    }
    async logWorkspaceTrust(isTrusted) {
        if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
            return;
        }
        this.telemetryService.publicLog2('workspaceTrustStateChanged', {
            workspaceId: this.workspaceContextService.getWorkspace().id,
            isTrusted: isTrusted
        });
        if (isTrusted) {
            const getDepth = (folder) => {
                let resolvedPath = resolve(folder);
                let depth = 0;
                while (dirname(resolvedPath) !== resolvedPath && depth < 100) {
                    resolvedPath = dirname(resolvedPath);
                    depth++;
                }
                return depth;
            };
            for (const folder of this.workspaceContextService.getWorkspace().folders) {
                const { trusted, uri } = await this.workspaceTrustManagementService.getUriTrustInfo(folder.uri);
                if (!trusted) {
                    continue;
                }
                const workspaceFolderDepth = getDepth(folder.uri.fsPath);
                const trustedFolderDepth = getDepth(uri.fsPath);
                const delta = workspaceFolderDepth - trustedFolderDepth;
                this.telemetryService.publicLog2('workspaceFolderDepthBelowTrustedFolder', { workspaceFolderDepth, trustedFolderDepth, delta });
            }
        }
    }
};
WorkspaceTrustTelemetryContribution = __decorate([
    __param(0, IWorkbenchEnvironmentService),
    __param(1, ITelemetryService),
    __param(2, IWorkspaceContextService),
    __param(3, IWorkspaceTrustEnablementService),
    __param(4, IWorkspaceTrustManagementService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], WorkspaceTrustTelemetryContribution);
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(WorkspaceTrustTelemetryContribution, 3 /* LifecyclePhase.Restored */);
