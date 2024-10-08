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
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable, DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { LinkedList } from '../../../../base/common/linkedList.js';
import { Schemas } from '../../../../base/common/network.js';
import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IRemoteAuthorityResolverService } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { getRemoteAuthority } from '../../../../platform/remote/common/remoteHosts.js';
import { isVirtualResource } from '../../../../platform/workspace/common/virtualWorkspace.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { isSavedWorkspace, isSingleFolderWorkspaceIdentifier, isTemporaryWorkspace, IWorkspaceContextService, toWorkspaceIdentifier } from '../../../../platform/workspace/common/workspace.js';
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService, IWorkspaceTrustEnablementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { Memento } from '../../../common/memento.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { isEqualAuthority } from '../../../../base/common/resources.js';
import { isWeb } from '../../../../base/common/platform.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { promiseWithResolvers } from '../../../../base/common/async.js';
export const WORKSPACE_TRUST_ENABLED = 'security.workspace.trust.enabled';
export const WORKSPACE_TRUST_STARTUP_PROMPT = 'security.workspace.trust.startupPrompt';
export const WORKSPACE_TRUST_BANNER = 'security.workspace.trust.banner';
export const WORKSPACE_TRUST_UNTRUSTED_FILES = 'security.workspace.trust.untrustedFiles';
export const WORKSPACE_TRUST_EMPTY_WINDOW = 'security.workspace.trust.emptyWindow';
export const WORKSPACE_TRUST_EXTENSION_SUPPORT = 'extensions.supportUntrustedWorkspaces';
export const WORKSPACE_TRUST_STORAGE_KEY = 'content.trust.model.key';
export class CanonicalWorkspace {
    constructor(originalWorkspace, canonicalFolderUris, canonicalConfiguration) {
        this.originalWorkspace = originalWorkspace;
        this.canonicalFolderUris = canonicalFolderUris;
        this.canonicalConfiguration = canonicalConfiguration;
    }
    get folders() {
        return this.originalWorkspace.folders.map((folder, index) => {
            return {
                index: folder.index,
                name: folder.name,
                toResource: folder.toResource,
                uri: this.canonicalFolderUris[index]
            };
        });
    }
    get transient() {
        return this.originalWorkspace.transient;
    }
    get configuration() {
        return this.canonicalConfiguration ?? this.originalWorkspace.configuration;
    }
    get id() {
        return this.originalWorkspace.id;
    }
}
let WorkspaceTrustEnablementService = class WorkspaceTrustEnablementService extends Disposable {
    constructor(configurationService, environmentService) {
        super();
        this.configurationService = configurationService;
        this.environmentService = environmentService;
    }
    isWorkspaceTrustEnabled() {
        if (this.environmentService.disableWorkspaceTrust) {
            return false;
        }
        return !!this.configurationService.getValue(WORKSPACE_TRUST_ENABLED);
    }
};
WorkspaceTrustEnablementService = __decorate([
    __param(0, IConfigurationService),
    __param(1, IWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object])
], WorkspaceTrustEnablementService);
export { WorkspaceTrustEnablementService };
let WorkspaceTrustManagementService = class WorkspaceTrustManagementService extends Disposable {
    constructor(configurationService, remoteAuthorityResolverService, storageService, uriIdentityService, environmentService, workspaceService, workspaceTrustEnablementService, fileService) {
        super();
        this.configurationService = configurationService;
        this.remoteAuthorityResolverService = remoteAuthorityResolverService;
        this.storageService = storageService;
        this.uriIdentityService = uriIdentityService;
        this.environmentService = environmentService;
        this.workspaceService = workspaceService;
        this.workspaceTrustEnablementService = workspaceTrustEnablementService;
        this.fileService = fileService;
        this.storageKey = WORKSPACE_TRUST_STORAGE_KEY;
        this._onDidChangeTrust = this._register(new Emitter());
        this.onDidChangeTrust = this._onDidChangeTrust.event;
        this._onDidChangeTrustedFolders = this._register(new Emitter());
        this.onDidChangeTrustedFolders = this._onDidChangeTrustedFolders.event;
        this._canonicalStartupFiles = [];
        this._canonicalUrisResolved = false;
        this._canonicalWorkspace = this.workspaceService.getWorkspace();
        ({ promise: this._workspaceResolvedPromise, resolve: this._workspaceResolvedPromiseResolve } = promiseWithResolvers());
        ({ promise: this._workspaceTrustInitializedPromise, resolve: this._workspaceTrustInitializedPromiseResolve } = promiseWithResolvers());
        this._storedTrustState = new WorkspaceTrustMemento(isWeb && this.isEmptyWorkspace() ? undefined : this.storageService);
        this._trustTransitionManager = this._register(new WorkspaceTrustTransitionManager());
        this._trustStateInfo = this.loadTrustInfo();
        this._isTrusted = this.calculateWorkspaceTrust();
        this.initializeWorkspaceTrust();
        this.registerListeners();
    }
    //#region initialize
    initializeWorkspaceTrust() {
        // Resolve canonical Uris
        this.resolveCanonicalUris()
            .then(async () => {
            this._canonicalUrisResolved = true;
            await this.updateWorkspaceTrust();
        })
            .finally(() => {
            this._workspaceResolvedPromiseResolve();
            if (!this.environmentService.remoteAuthority) {
                this._workspaceTrustInitializedPromiseResolve();
            }
        });
        // Remote - resolve remote authority
        if (this.environmentService.remoteAuthority) {
            this.remoteAuthorityResolverService.resolveAuthority(this.environmentService.remoteAuthority)
                .then(async (result) => {
                this._remoteAuthority = result;
                await this.fileService.activateProvider(Schemas.vscodeRemote);
                await this.updateWorkspaceTrust();
            })
                .finally(() => {
                this._workspaceTrustInitializedPromiseResolve();
            });
        }
        // Empty workspace - save initial state to memento
        if (this.isEmptyWorkspace()) {
            this._workspaceTrustInitializedPromise.then(() => {
                if (this._storedTrustState.isEmptyWorkspaceTrusted === undefined) {
                    this._storedTrustState.isEmptyWorkspaceTrusted = this.isWorkspaceTrusted();
                }
            });
        }
    }
    //#endregion
    //#region private interface
    registerListeners() {
        this._register(this.workspaceService.onDidChangeWorkspaceFolders(async () => await this.updateWorkspaceTrust()));
        this._register(this.storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, this.storageKey, this._register(new DisposableStore()))(async () => {
            /* This will only execute if storage was changed by a user action in a separate window */
            if (JSON.stringify(this._trustStateInfo) !== JSON.stringify(this.loadTrustInfo())) {
                this._trustStateInfo = this.loadTrustInfo();
                this._onDidChangeTrustedFolders.fire();
                await this.updateWorkspaceTrust();
            }
        }));
    }
    async getCanonicalUri(uri) {
        let canonicalUri = uri;
        if (this.environmentService.remoteAuthority && uri.scheme === Schemas.vscodeRemote) {
            canonicalUri = await this.remoteAuthorityResolverService.getCanonicalURI(uri);
        }
        else if (uri.scheme === 'vscode-vfs') {
            const index = uri.authority.indexOf('+');
            if (index !== -1) {
                canonicalUri = uri.with({ authority: uri.authority.substr(0, index) });
            }
        }
        // ignore query and fragent section of uris always
        return canonicalUri.with({ query: null, fragment: null });
    }
    async resolveCanonicalUris() {
        // Open editors
        const filesToOpen = [];
        if (this.environmentService.filesToOpenOrCreate) {
            filesToOpen.push(...this.environmentService.filesToOpenOrCreate);
        }
        if (this.environmentService.filesToDiff) {
            filesToOpen.push(...this.environmentService.filesToDiff);
        }
        if (this.environmentService.filesToMerge) {
            filesToOpen.push(...this.environmentService.filesToMerge);
        }
        if (filesToOpen.length) {
            const filesToOpenOrCreateUris = filesToOpen.filter(f => !!f.fileUri).map(f => f.fileUri);
            const canonicalFilesToOpen = await Promise.all(filesToOpenOrCreateUris.map(uri => this.getCanonicalUri(uri)));
            this._canonicalStartupFiles.push(...canonicalFilesToOpen.filter(uri => this._canonicalStartupFiles.every(u => !this.uriIdentityService.extUri.isEqual(uri, u))));
        }
        // Workspace
        const workspaceUris = this.workspaceService.getWorkspace().folders.map(f => f.uri);
        const canonicalWorkspaceFolders = await Promise.all(workspaceUris.map(uri => this.getCanonicalUri(uri)));
        let canonicalWorkspaceConfiguration = this.workspaceService.getWorkspace().configuration;
        if (canonicalWorkspaceConfiguration && isSavedWorkspace(canonicalWorkspaceConfiguration, this.environmentService)) {
            canonicalWorkspaceConfiguration = await this.getCanonicalUri(canonicalWorkspaceConfiguration);
        }
        this._canonicalWorkspace = new CanonicalWorkspace(this.workspaceService.getWorkspace(), canonicalWorkspaceFolders, canonicalWorkspaceConfiguration);
    }
    loadTrustInfo() {
        const infoAsString = this.storageService.get(this.storageKey, -1 /* StorageScope.APPLICATION */);
        let result;
        try {
            if (infoAsString) {
                result = JSON.parse(infoAsString);
            }
        }
        catch { }
        if (!result) {
            result = {
                uriTrustInfo: []
            };
        }
        if (!result.uriTrustInfo) {
            result.uriTrustInfo = [];
        }
        result.uriTrustInfo = result.uriTrustInfo.map(info => { return { uri: URI.revive(info.uri), trusted: info.trusted }; });
        result.uriTrustInfo = result.uriTrustInfo.filter(info => info.trusted);
        return result;
    }
    async saveTrustInfo() {
        this.storageService.store(this.storageKey, JSON.stringify(this._trustStateInfo), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        this._onDidChangeTrustedFolders.fire();
        await this.updateWorkspaceTrust();
    }
    getWorkspaceUris() {
        const workspaceUris = this._canonicalWorkspace.folders.map(f => f.uri);
        const workspaceConfiguration = this._canonicalWorkspace.configuration;
        if (workspaceConfiguration && isSavedWorkspace(workspaceConfiguration, this.environmentService)) {
            workspaceUris.push(workspaceConfiguration);
        }
        return workspaceUris;
    }
    calculateWorkspaceTrust() {
        // Feature is disabled
        if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
            return true;
        }
        // Canonical Uris not yet resolved
        if (!this._canonicalUrisResolved) {
            return false;
        }
        // Remote - resolver explicitly sets workspace trust to TRUE
        if (this.environmentService.remoteAuthority && this._remoteAuthority?.options?.isTrusted) {
            return this._remoteAuthority.options.isTrusted;
        }
        // Empty workspace - use memento, open ediors, or user setting
        if (this.isEmptyWorkspace()) {
            // Use memento if present
            if (this._storedTrustState.isEmptyWorkspaceTrusted !== undefined) {
                return this._storedTrustState.isEmptyWorkspaceTrusted;
            }
            // Startup files
            if (this._canonicalStartupFiles.length) {
                return this.getUrisTrust(this._canonicalStartupFiles);
            }
            // User setting
            return !!this.configurationService.getValue(WORKSPACE_TRUST_EMPTY_WINDOW);
        }
        return this.getUrisTrust(this.getWorkspaceUris());
    }
    async updateWorkspaceTrust(trusted) {
        if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
            return;
        }
        if (trusted === undefined) {
            await this.resolveCanonicalUris();
            trusted = this.calculateWorkspaceTrust();
        }
        if (this.isWorkspaceTrusted() === trusted) {
            return;
        }
        // Update workspace trust
        this.isTrusted = trusted;
        // Run workspace trust transition participants
        await this._trustTransitionManager.participate(trusted);
        // Fire workspace trust change event
        this._onDidChangeTrust.fire(trusted);
    }
    getUrisTrust(uris) {
        let state = true;
        for (const uri of uris) {
            const { trusted } = this.doGetUriTrustInfo(uri);
            if (!trusted) {
                state = trusted;
                return state;
            }
        }
        return state;
    }
    doGetUriTrustInfo(uri) {
        // Return trusted when workspace trust is disabled
        if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
            return { trusted: true, uri };
        }
        if (this.isTrustedVirtualResource(uri)) {
            return { trusted: true, uri };
        }
        if (this.isTrustedByRemote(uri)) {
            return { trusted: true, uri };
        }
        let resultState = false;
        let maxLength = -1;
        let resultUri = uri;
        for (const trustInfo of this._trustStateInfo.uriTrustInfo) {
            if (this.uriIdentityService.extUri.isEqualOrParent(uri, trustInfo.uri)) {
                const fsPath = trustInfo.uri.fsPath;
                if (fsPath.length > maxLength) {
                    maxLength = fsPath.length;
                    resultState = trustInfo.trusted;
                    resultUri = trustInfo.uri;
                }
            }
        }
        return { trusted: resultState, uri: resultUri };
    }
    async doSetUrisTrust(uris, trusted) {
        let changed = false;
        for (const uri of uris) {
            if (trusted) {
                if (this.isTrustedVirtualResource(uri)) {
                    continue;
                }
                if (this.isTrustedByRemote(uri)) {
                    continue;
                }
                const foundItem = this._trustStateInfo.uriTrustInfo.find(trustInfo => this.uriIdentityService.extUri.isEqual(trustInfo.uri, uri));
                if (!foundItem) {
                    this._trustStateInfo.uriTrustInfo.push({ uri, trusted: true });
                    changed = true;
                }
            }
            else {
                const previousLength = this._trustStateInfo.uriTrustInfo.length;
                this._trustStateInfo.uriTrustInfo = this._trustStateInfo.uriTrustInfo.filter(trustInfo => !this.uriIdentityService.extUri.isEqual(trustInfo.uri, uri));
                if (previousLength !== this._trustStateInfo.uriTrustInfo.length) {
                    changed = true;
                }
            }
        }
        if (changed) {
            await this.saveTrustInfo();
        }
    }
    isEmptyWorkspace() {
        if (this.workspaceService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
            return true;
        }
        const workspace = this.workspaceService.getWorkspace();
        if (workspace) {
            return isTemporaryWorkspace(this.workspaceService.getWorkspace()) && workspace.folders.length === 0;
        }
        return false;
    }
    isTrustedVirtualResource(uri) {
        return isVirtualResource(uri) && uri.scheme !== 'vscode-vfs';
    }
    isTrustedByRemote(uri) {
        if (!this.environmentService.remoteAuthority) {
            return false;
        }
        if (!this._remoteAuthority) {
            return false;
        }
        return (isEqualAuthority(getRemoteAuthority(uri), this._remoteAuthority.authority.authority)) && !!this._remoteAuthority.options?.isTrusted;
    }
    set isTrusted(value) {
        this._isTrusted = value;
        // Reset acceptsOutOfWorkspaceFiles
        if (!value) {
            this._storedTrustState.acceptsOutOfWorkspaceFiles = false;
        }
        // Empty workspace - save memento
        if (this.isEmptyWorkspace()) {
            this._storedTrustState.isEmptyWorkspaceTrusted = value;
        }
    }
    //#endregion
    //#region public interface
    get workspaceResolved() {
        return this._workspaceResolvedPromise;
    }
    get workspaceTrustInitialized() {
        return this._workspaceTrustInitializedPromise;
    }
    get acceptsOutOfWorkspaceFiles() {
        return this._storedTrustState.acceptsOutOfWorkspaceFiles;
    }
    set acceptsOutOfWorkspaceFiles(value) {
        this._storedTrustState.acceptsOutOfWorkspaceFiles = value;
    }
    isWorkspaceTrusted() {
        return this._isTrusted;
    }
    isWorkspaceTrustForced() {
        // Remote - remote authority explicitly sets workspace trust
        if (this.environmentService.remoteAuthority && this._remoteAuthority && this._remoteAuthority.options?.isTrusted !== undefined) {
            return true;
        }
        // All workspace uris are trusted automatically
        const workspaceUris = this.getWorkspaceUris().filter(uri => !this.isTrustedVirtualResource(uri));
        if (workspaceUris.length === 0) {
            return true;
        }
        return false;
    }
    canSetParentFolderTrust() {
        const workspaceIdentifier = toWorkspaceIdentifier(this._canonicalWorkspace);
        if (!isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
            return false;
        }
        if (workspaceIdentifier.uri.scheme !== Schemas.file && workspaceIdentifier.uri.scheme !== Schemas.vscodeRemote) {
            return false;
        }
        const parentFolder = this.uriIdentityService.extUri.dirname(workspaceIdentifier.uri);
        if (this.uriIdentityService.extUri.isEqual(workspaceIdentifier.uri, parentFolder)) {
            return false;
        }
        return true;
    }
    async setParentFolderTrust(trusted) {
        if (this.canSetParentFolderTrust()) {
            const workspaceUri = toWorkspaceIdentifier(this._canonicalWorkspace).uri;
            const parentFolder = this.uriIdentityService.extUri.dirname(workspaceUri);
            await this.setUrisTrust([parentFolder], trusted);
        }
    }
    canSetWorkspaceTrust() {
        // Remote - remote authority not yet resolved, or remote authority explicitly sets workspace trust
        if (this.environmentService.remoteAuthority && (!this._remoteAuthority || this._remoteAuthority.options?.isTrusted !== undefined)) {
            return false;
        }
        // Empty workspace
        if (this.isEmptyWorkspace()) {
            return true;
        }
        // All workspace uris are trusted automatically
        const workspaceUris = this.getWorkspaceUris().filter(uri => !this.isTrustedVirtualResource(uri));
        if (workspaceUris.length === 0) {
            return false;
        }
        // Untrusted workspace
        if (!this.isWorkspaceTrusted()) {
            return true;
        }
        // Trusted workspaces
        // Can only untrusted in the single folder scenario
        const workspaceIdentifier = toWorkspaceIdentifier(this._canonicalWorkspace);
        if (!isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
            return false;
        }
        // Can only be untrusted in certain schemes
        if (workspaceIdentifier.uri.scheme !== Schemas.file && workspaceIdentifier.uri.scheme !== 'vscode-vfs') {
            return false;
        }
        // If the current folder isn't trusted directly, return false
        const trustInfo = this.doGetUriTrustInfo(workspaceIdentifier.uri);
        if (!trustInfo.trusted || !this.uriIdentityService.extUri.isEqual(workspaceIdentifier.uri, trustInfo.uri)) {
            return false;
        }
        // Check if the parent is also trusted
        if (this.canSetParentFolderTrust()) {
            const parentFolder = this.uriIdentityService.extUri.dirname(workspaceIdentifier.uri);
            const parentPathTrustInfo = this.doGetUriTrustInfo(parentFolder);
            if (parentPathTrustInfo.trusted) {
                return false;
            }
        }
        return true;
    }
    async setWorkspaceTrust(trusted) {
        // Empty workspace
        if (this.isEmptyWorkspace()) {
            await this.updateWorkspaceTrust(trusted);
            return;
        }
        const workspaceFolders = this.getWorkspaceUris();
        await this.setUrisTrust(workspaceFolders, trusted);
    }
    async getUriTrustInfo(uri) {
        // Return trusted when workspace trust is disabled
        if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
            return { trusted: true, uri };
        }
        // Uri is trusted automatically by the remote
        if (this.isTrustedByRemote(uri)) {
            return { trusted: true, uri };
        }
        return this.doGetUriTrustInfo(await this.getCanonicalUri(uri));
    }
    async setUrisTrust(uris, trusted) {
        this.doSetUrisTrust(await Promise.all(uris.map(uri => this.getCanonicalUri(uri))), trusted);
    }
    getTrustedUris() {
        return this._trustStateInfo.uriTrustInfo.map(info => info.uri);
    }
    async setTrustedUris(uris) {
        this._trustStateInfo.uriTrustInfo = [];
        for (const uri of uris) {
            const canonicalUri = await this.getCanonicalUri(uri);
            const cleanUri = this.uriIdentityService.extUri.removeTrailingPathSeparator(canonicalUri);
            let added = false;
            for (const addedUri of this._trustStateInfo.uriTrustInfo) {
                if (this.uriIdentityService.extUri.isEqual(addedUri.uri, cleanUri)) {
                    added = true;
                    break;
                }
            }
            if (added) {
                continue;
            }
            this._trustStateInfo.uriTrustInfo.push({
                trusted: true,
                uri: cleanUri
            });
        }
        await this.saveTrustInfo();
    }
    addWorkspaceTrustTransitionParticipant(participant) {
        return this._trustTransitionManager.addWorkspaceTrustTransitionParticipant(participant);
    }
};
WorkspaceTrustManagementService = __decorate([
    __param(0, IConfigurationService),
    __param(1, IRemoteAuthorityResolverService),
    __param(2, IStorageService),
    __param(3, IUriIdentityService),
    __param(4, IWorkbenchEnvironmentService),
    __param(5, IWorkspaceContextService),
    __param(6, IWorkspaceTrustEnablementService),
    __param(7, IFileService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], WorkspaceTrustManagementService);
export { WorkspaceTrustManagementService };
let WorkspaceTrustRequestService = class WorkspaceTrustRequestService extends Disposable {
    constructor(configurationService, workspaceTrustManagementService) {
        super();
        this.configurationService = configurationService;
        this.workspaceTrustManagementService = workspaceTrustManagementService;
        this._onDidInitiateOpenFilesTrustRequest = this._register(new Emitter());
        this.onDidInitiateOpenFilesTrustRequest = this._onDidInitiateOpenFilesTrustRequest.event;
        this._onDidInitiateWorkspaceTrustRequest = this._register(new Emitter());
        this.onDidInitiateWorkspaceTrustRequest = this._onDidInitiateWorkspaceTrustRequest.event;
        this._onDidInitiateWorkspaceTrustRequestOnStartup = this._register(new Emitter());
        this.onDidInitiateWorkspaceTrustRequestOnStartup = this._onDidInitiateWorkspaceTrustRequestOnStartup.event;
    }
    //#region Open file(s) trust request
    get untrustedFilesSetting() {
        return this.configurationService.getValue(WORKSPACE_TRUST_UNTRUSTED_FILES);
    }
    set untrustedFilesSetting(value) {
        this.configurationService.updateValue(WORKSPACE_TRUST_UNTRUSTED_FILES, value);
    }
    async completeOpenFilesTrustRequest(result, saveResponse) {
        if (!this._openFilesTrustRequestResolver) {
            return;
        }
        // Set acceptsOutOfWorkspaceFiles
        if (result === 1 /* WorkspaceTrustUriResponse.Open */) {
            this.workspaceTrustManagementService.acceptsOutOfWorkspaceFiles = true;
        }
        // Save response
        if (saveResponse) {
            if (result === 1 /* WorkspaceTrustUriResponse.Open */) {
                this.untrustedFilesSetting = 'open';
            }
            if (result === 2 /* WorkspaceTrustUriResponse.OpenInNewWindow */) {
                this.untrustedFilesSetting = 'newWindow';
            }
        }
        // Resolve promise
        this._openFilesTrustRequestResolver(result);
        this._openFilesTrustRequestResolver = undefined;
        this._openFilesTrustRequestPromise = undefined;
    }
    async requestOpenFilesTrust(uris) {
        // If workspace is untrusted, there is no conflict
        if (!this.workspaceTrustManagementService.isWorkspaceTrusted()) {
            return 1 /* WorkspaceTrustUriResponse.Open */;
        }
        const openFilesTrustInfo = await Promise.all(uris.map(uri => this.workspaceTrustManagementService.getUriTrustInfo(uri)));
        // If all uris are trusted, there is no conflict
        if (openFilesTrustInfo.map(info => info.trusted).every(trusted => trusted)) {
            return 1 /* WorkspaceTrustUriResponse.Open */;
        }
        // If user has setting, don't need to ask
        if (this.untrustedFilesSetting !== 'prompt') {
            if (this.untrustedFilesSetting === 'newWindow') {
                return 2 /* WorkspaceTrustUriResponse.OpenInNewWindow */;
            }
            if (this.untrustedFilesSetting === 'open') {
                return 1 /* WorkspaceTrustUriResponse.Open */;
            }
        }
        // If we already asked the user, don't need to ask again
        if (this.workspaceTrustManagementService.acceptsOutOfWorkspaceFiles) {
            return 1 /* WorkspaceTrustUriResponse.Open */;
        }
        // Create/return a promise
        if (!this._openFilesTrustRequestPromise) {
            this._openFilesTrustRequestPromise = new Promise(resolve => {
                this._openFilesTrustRequestResolver = resolve;
            });
        }
        else {
            return this._openFilesTrustRequestPromise;
        }
        this._onDidInitiateOpenFilesTrustRequest.fire();
        return this._openFilesTrustRequestPromise;
    }
    //#endregion
    //#region Workspace trust request
    resolveWorkspaceTrustRequest(trusted) {
        if (this._workspaceTrustRequestResolver) {
            this._workspaceTrustRequestResolver(trusted ?? this.workspaceTrustManagementService.isWorkspaceTrusted());
            this._workspaceTrustRequestResolver = undefined;
            this._workspaceTrustRequestPromise = undefined;
        }
    }
    cancelWorkspaceTrustRequest() {
        if (this._workspaceTrustRequestResolver) {
            this._workspaceTrustRequestResolver(undefined);
            this._workspaceTrustRequestResolver = undefined;
            this._workspaceTrustRequestPromise = undefined;
        }
    }
    async completeWorkspaceTrustRequest(trusted) {
        if (trusted === undefined || trusted === this.workspaceTrustManagementService.isWorkspaceTrusted()) {
            this.resolveWorkspaceTrustRequest(trusted);
            return;
        }
        // Register one-time event handler to resolve the promise when workspace trust changed
        Event.once(this.workspaceTrustManagementService.onDidChangeTrust)(trusted => this.resolveWorkspaceTrustRequest(trusted));
        // Update storage, transition workspace state
        await this.workspaceTrustManagementService.setWorkspaceTrust(trusted);
    }
    async requestWorkspaceTrust(options) {
        // Trusted workspace
        if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
            return this.workspaceTrustManagementService.isWorkspaceTrusted();
        }
        // Modal request
        if (!this._workspaceTrustRequestPromise) {
            // Create promise
            this._workspaceTrustRequestPromise = new Promise(resolve => {
                this._workspaceTrustRequestResolver = resolve;
            });
        }
        else {
            // Return existing promise
            return this._workspaceTrustRequestPromise;
        }
        this._onDidInitiateWorkspaceTrustRequest.fire(options);
        return this._workspaceTrustRequestPromise;
    }
    requestWorkspaceTrustOnStartup() {
        if (!this._workspaceTrustRequestPromise) {
            // Create promise
            this._workspaceTrustRequestPromise = new Promise(resolve => {
                this._workspaceTrustRequestResolver = resolve;
            });
        }
        this._onDidInitiateWorkspaceTrustRequestOnStartup.fire();
    }
};
WorkspaceTrustRequestService = __decorate([
    __param(0, IConfigurationService),
    __param(1, IWorkspaceTrustManagementService),
    __metadata("design:paramtypes", [Object, Object])
], WorkspaceTrustRequestService);
export { WorkspaceTrustRequestService };
class WorkspaceTrustTransitionManager extends Disposable {
    constructor() {
        super(...arguments);
        this.participants = new LinkedList();
    }
    addWorkspaceTrustTransitionParticipant(participant) {
        const remove = this.participants.push(participant);
        return toDisposable(() => remove());
    }
    async participate(trusted) {
        for (const participant of this.participants) {
            await participant.participate(trusted);
        }
    }
    dispose() {
        this.participants.clear();
        super.dispose();
    }
}
class WorkspaceTrustMemento {
    constructor(storageService) {
        this._acceptsOutOfWorkspaceFilesKey = 'acceptsOutOfWorkspaceFiles';
        this._isEmptyWorkspaceTrustedKey = 'isEmptyWorkspaceTrusted';
        if (storageService) {
            this._memento = new Memento('workspaceTrust', storageService);
            this._mementoObject = this._memento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        else {
            this._mementoObject = {};
        }
    }
    get acceptsOutOfWorkspaceFiles() {
        return this._mementoObject[this._acceptsOutOfWorkspaceFilesKey] ?? false;
    }
    set acceptsOutOfWorkspaceFiles(value) {
        this._mementoObject[this._acceptsOutOfWorkspaceFilesKey] = value;
        this._memento?.saveMemento();
    }
    get isEmptyWorkspaceTrusted() {
        return this._mementoObject[this._isEmptyWorkspaceTrustedKey];
    }
    set isEmptyWorkspaceTrusted(value) {
        this._mementoObject[this._isEmptyWorkspaceTrustedKey] = value;
        this._memento?.saveMemento();
    }
}
registerSingleton(IWorkspaceTrustRequestService, WorkspaceTrustRequestService, 1 /* InstantiationType.Delayed */);
