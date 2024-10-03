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
var EditSessionsWorkbenchService_1;
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { Action2, MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { createSyncHeaders } from '../../../../platform/userDataSync/common/userDataSync.js';
import { IAuthenticationService } from '../../../services/authentication/common/authentication.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { EDIT_SESSIONS_SIGNED_IN, EDIT_SESSION_SYNC_CATEGORY, EDIT_SESSIONS_SIGNED_IN_KEY, IEditSessionsLogService, EDIT_SESSIONS_PENDING_KEY } from '../common/editSessions.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { getCurrentAuthenticationSessionInfo } from '../../../services/authentication/browser/authenticationService.js';
import { isWeb } from '../../../../base/common/platform.js';
import { UserDataSyncMachinesService } from '../../../../platform/userDataSync/common/userDataSyncMachines.js';
import { Emitter } from '../../../../base/common/event.js';
import { CancellationError } from '../../../../base/common/errors.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
let EditSessionsWorkbenchService = class EditSessionsWorkbenchService extends Disposable {
    static { EditSessionsWorkbenchService_1 = this; }
    static { this.CACHED_SESSION_STORAGE_KEY = 'editSessionAccountPreference'; }
    get isSignedIn() {
        return this.existingSessionId !== undefined;
    }
    get onDidSignIn() {
        return this._didSignIn.event;
    }
    get onDidSignOut() {
        return this._didSignOut.event;
    }
    get lastWrittenResources() {
        return this._lastWrittenResources;
    }
    get lastReadResources() {
        return this._lastReadResources;
    }
    constructor(fileService, storageService, quickInputService, authenticationService, extensionService, environmentService, logService, productService, contextKeyService, dialogService, secretStorageService) {
        super();
        this.fileService = fileService;
        this.storageService = storageService;
        this.quickInputService = quickInputService;
        this.authenticationService = authenticationService;
        this.extensionService = extensionService;
        this.environmentService = environmentService;
        this.logService = logService;
        this.productService = productService;
        this.contextKeyService = contextKeyService;
        this.dialogService = dialogService;
        this.secretStorageService = secretStorageService;
        this.SIZE_LIMIT = Math.floor(1024 * 1024 * 1.9);
        this.serverConfiguration = this.productService['editSessions.store'];
        this.initialized = false;
        this._didSignIn = new Emitter();
        this._didSignOut = new Emitter();
        this._lastWrittenResources = new Map();
        this._lastReadResources = new Map();
        this._register(this.authenticationService.onDidChangeSessions((e) => this.onDidChangeSessions(e.event)));
        this._register(this.storageService.onDidChangeValue(-1, EditSessionsWorkbenchService_1.CACHED_SESSION_STORAGE_KEY, this._register(new DisposableStore()))(() => this.onDidChangeStorage()));
        this.registerSignInAction();
        this.registerResetAuthenticationAction();
        this.signedInContext = EDIT_SESSIONS_SIGNED_IN.bindTo(this.contextKeyService);
        this.signedInContext.set(this.existingSessionId !== undefined);
    }
    async write(resource, content) {
        await this.initialize('write', false);
        if (!this.initialized) {
            throw new Error('Please sign in to store your edit session.');
        }
        if (typeof content !== 'string' && content.machine === undefined) {
            content.machine = await this.getOrCreateCurrentMachineId();
        }
        content = typeof content === 'string' ? content : JSON.stringify(content);
        const ref = await this.storeClient.writeResource(resource, content, null, undefined, createSyncHeaders(generateUuid()));
        this._lastWrittenResources.set(resource, { ref, content });
        return ref;
    }
    async read(resource, ref) {
        await this.initialize('read', false);
        if (!this.initialized) {
            throw new Error('Please sign in to apply your latest edit session.');
        }
        let content;
        const headers = createSyncHeaders(generateUuid());
        try {
            if (ref !== undefined) {
                content = await this.storeClient?.resolveResourceContent(resource, ref, undefined, headers);
            }
            else {
                const result = await this.storeClient?.readResource(resource, null, undefined, headers);
                content = result?.content;
                ref = result?.ref;
            }
        }
        catch (ex) {
            this.logService.error(ex);
        }
        if (content !== undefined && content !== null && ref !== undefined) {
            this._lastReadResources.set(resource, { ref, content });
            return { ref, content };
        }
        return undefined;
    }
    async delete(resource, ref) {
        await this.initialize('write', false);
        if (!this.initialized) {
            throw new Error(`Unable to delete edit session with ref ${ref}.`);
        }
        try {
            await this.storeClient?.deleteResource(resource, ref);
        }
        catch (ex) {
            this.logService.error(ex);
        }
    }
    async list(resource) {
        await this.initialize('read', false);
        if (!this.initialized) {
            throw new Error(`Unable to list edit sessions.`);
        }
        try {
            return this.storeClient?.getAllResourceRefs(resource) ?? [];
        }
        catch (ex) {
            this.logService.error(ex);
        }
        return [];
    }
    async initialize(reason, silent = false) {
        if (this.initialized) {
            return true;
        }
        this.initialized = await this.doInitialize(reason, silent);
        this.signedInContext.set(this.initialized);
        if (this.initialized) {
            this._didSignIn.fire();
        }
        return this.initialized;
    }
    async doInitialize(reason, silent) {
        await this.extensionService.whenInstalledExtensionsRegistered();
        if (!this.serverConfiguration?.url) {
            throw new Error('Unable to initialize sessions sync as session sync preference is not configured in product.json.');
        }
        if (this.storeClient === undefined) {
            return false;
        }
        this._register(this.storeClient.onTokenFailed(() => {
            this.logService.info('Clearing edit sessions authentication preference because of successive token failures.');
            this.clearAuthenticationPreference();
        }));
        if (this.machineClient === undefined) {
            this.machineClient = new UserDataSyncMachinesService(this.environmentService, this.fileService, this.storageService, this.storeClient, this.logService, this.productService);
        }
        if (this.authenticationInfo !== undefined) {
            return true;
        }
        const authenticationSession = await this.getAuthenticationSession(reason, silent);
        if (authenticationSession !== undefined) {
            this.authenticationInfo = authenticationSession;
            this.storeClient.setAuthToken(authenticationSession.token, authenticationSession.providerId);
        }
        return authenticationSession !== undefined;
    }
    async getMachineById(machineId) {
        await this.initialize('read', false);
        if (!this.cachedMachines) {
            const machines = await this.machineClient.getMachines();
            this.cachedMachines = machines.reduce((map, machine) => map.set(machine.id, machine.name), new Map());
        }
        return this.cachedMachines.get(machineId);
    }
    async getOrCreateCurrentMachineId() {
        const currentMachineId = await this.machineClient.getMachines().then((machines) => machines.find((m) => m.isCurrent)?.id);
        if (currentMachineId === undefined) {
            await this.machineClient.addCurrentMachine();
            return await this.machineClient.getMachines().then((machines) => machines.find((m) => m.isCurrent).id);
        }
        return currentMachineId;
    }
    async getAuthenticationSession(reason, silent) {
        if (this.existingSessionId) {
            this.logService.info(`Searching for existing authentication session with ID ${this.existingSessionId}`);
            const existingSession = await this.getExistingSession();
            if (existingSession) {
                this.logService.info(`Found existing authentication session with ID ${existingSession.session.id}`);
                return { sessionId: existingSession.session.id, token: existingSession.session.idToken ?? existingSession.session.accessToken, providerId: existingSession.session.providerId };
            }
            else {
                this._didSignOut.fire();
            }
        }
        if (this.shouldAttemptEditSessionInit()) {
            this.logService.info(`Reusing user data sync enablement`);
            const authenticationSessionInfo = await getCurrentAuthenticationSessionInfo(this.secretStorageService, this.productService);
            if (authenticationSessionInfo !== undefined) {
                this.logService.info(`Using current authentication session with ID ${authenticationSessionInfo.id}`);
                this.existingSessionId = authenticationSessionInfo.id;
                return { sessionId: authenticationSessionInfo.id, token: authenticationSessionInfo.accessToken, providerId: authenticationSessionInfo.providerId };
            }
        }
        if (silent) {
            return;
        }
        const authenticationSession = await this.getAccountPreference(reason);
        if (authenticationSession !== undefined) {
            this.existingSessionId = authenticationSession.id;
            return { sessionId: authenticationSession.id, token: authenticationSession.idToken ?? authenticationSession.accessToken, providerId: authenticationSession.providerId };
        }
        return undefined;
    }
    shouldAttemptEditSessionInit() {
        return isWeb && this.storageService.isNew(-1) && this.storageService.isNew(1);
    }
    async getAccountPreference(reason) {
        const disposables = new DisposableStore();
        const quickpick = disposables.add(this.quickInputService.createQuickPick({ useSeparators: true }));
        quickpick.ok = false;
        quickpick.placeholder = reason === 'read' ? localize('choose account read placeholder', "Select an account to restore your working changes from the cloud") : localize('choose account placeholder', "Select an account to store your working changes in the cloud");
        quickpick.ignoreFocusOut = true;
        quickpick.items = await this.createQuickpickItems();
        return new Promise((resolve, reject) => {
            disposables.add(quickpick.onDidHide((e) => {
                reject(new CancellationError());
                disposables.dispose();
            }));
            disposables.add(quickpick.onDidAccept(async (e) => {
                const selection = quickpick.selectedItems[0];
                const session = 'provider' in selection ? { ...await this.authenticationService.createSession(selection.provider.id, selection.provider.scopes), providerId: selection.provider.id } : ('session' in selection ? selection.session : undefined);
                resolve(session);
                quickpick.hide();
            }));
            quickpick.show();
        });
    }
    async createQuickpickItems() {
        const options = [];
        options.push({ type: 'separator', label: localize('signed in', "Signed In") });
        const sessions = await this.getAllSessions();
        options.push(...sessions);
        options.push({ type: 'separator', label: localize('others', "Others") });
        for (const authenticationProvider of (await this.getAuthenticationProviders())) {
            const signedInForProvider = sessions.some(account => account.session.providerId === authenticationProvider.id);
            if (!signedInForProvider || this.authenticationService.getProvider(authenticationProvider.id).supportsMultipleAccounts) {
                const providerName = this.authenticationService.getProvider(authenticationProvider.id).label;
                options.push({ label: localize('sign in using account', "Sign in with {0}", providerName), provider: authenticationProvider });
            }
        }
        return options;
    }
    async getAllSessions() {
        const authenticationProviders = await this.getAuthenticationProviders();
        const accounts = new Map();
        let currentSession;
        for (const provider of authenticationProviders) {
            const sessions = await this.authenticationService.getSessions(provider.id, provider.scopes);
            for (const session of sessions) {
                const item = {
                    label: session.account.label,
                    description: this.authenticationService.getProvider(provider.id).label,
                    session: { ...session, providerId: provider.id }
                };
                accounts.set(item.session.account.id, item);
                if (this.existingSessionId === session.id) {
                    currentSession = item;
                }
            }
        }
        if (currentSession !== undefined) {
            accounts.set(currentSession.session.account.id, currentSession);
        }
        return [...accounts.values()].sort((a, b) => a.label.localeCompare(b.label));
    }
    async getAuthenticationProviders() {
        if (!this.serverConfiguration) {
            throw new Error('Unable to get configured authentication providers as session sync preference is not configured in product.json.');
        }
        const authenticationProviders = this.serverConfiguration.authenticationProviders;
        const configuredAuthenticationProviders = Object.keys(authenticationProviders).reduce((result, id) => {
            result.push({ id, scopes: authenticationProviders[id].scopes });
            return result;
        }, []);
        const availableAuthenticationProviders = this.authenticationService.declaredProviders;
        return configuredAuthenticationProviders.filter(({ id }) => availableAuthenticationProviders.some(provider => provider.id === id));
    }
    get existingSessionId() {
        return this.storageService.get(EditSessionsWorkbenchService_1.CACHED_SESSION_STORAGE_KEY, -1);
    }
    set existingSessionId(sessionId) {
        this.logService.trace(`Saving authentication session preference for ID ${sessionId}.`);
        if (sessionId === undefined) {
            this.storageService.remove(EditSessionsWorkbenchService_1.CACHED_SESSION_STORAGE_KEY, -1);
        }
        else {
            this.storageService.store(EditSessionsWorkbenchService_1.CACHED_SESSION_STORAGE_KEY, sessionId, -1, 1);
        }
    }
    async getExistingSession() {
        const accounts = await this.getAllSessions();
        return accounts.find((account) => account.session.id === this.existingSessionId);
    }
    async onDidChangeStorage() {
        const newSessionId = this.existingSessionId;
        const previousSessionId = this.authenticationInfo?.sessionId;
        if (previousSessionId !== newSessionId) {
            this.logService.trace(`Resetting authentication state because authentication session ID preference changed from ${previousSessionId} to ${newSessionId}.`);
            this.authenticationInfo = undefined;
            this.initialized = false;
        }
    }
    clearAuthenticationPreference() {
        this.authenticationInfo = undefined;
        this.initialized = false;
        this.existingSessionId = undefined;
        this.signedInContext.set(false);
    }
    onDidChangeSessions(e) {
        if (this.authenticationInfo?.sessionId && e.removed?.find(session => session.id === this.authenticationInfo?.sessionId)) {
            this.clearAuthenticationPreference();
        }
    }
    registerSignInAction() {
        const that = this;
        const id = 'workbench.editSessions.actions.signIn';
        const when = ContextKeyExpr.and(ContextKeyExpr.equals(EDIT_SESSIONS_PENDING_KEY, false), ContextKeyExpr.equals(EDIT_SESSIONS_SIGNED_IN_KEY, false));
        this._register(registerAction2(class ResetEditSessionAuthenticationAction extends Action2 {
            constructor() {
                super({
                    id,
                    title: localize('sign in', 'Turn on Cloud Changes...'),
                    category: EDIT_SESSION_SYNC_CATEGORY,
                    precondition: when,
                    menu: [{
                            id: MenuId.CommandPalette,
                        },
                        {
                            id: MenuId.AccountsContext,
                            group: '2_editSessions',
                            when,
                        }]
                });
            }
            async run() {
                return await that.initialize('write', false);
            }
        }));
        this._register(MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
            group: '2_editSessions',
            command: {
                id,
                title: localize('sign in badge', 'Turn on Cloud Changes... (1)'),
            },
            when: ContextKeyExpr.and(ContextKeyExpr.equals(EDIT_SESSIONS_PENDING_KEY, true), ContextKeyExpr.equals(EDIT_SESSIONS_SIGNED_IN_KEY, false))
        }));
    }
    registerResetAuthenticationAction() {
        const that = this;
        this._register(registerAction2(class ResetEditSessionAuthenticationAction extends Action2 {
            constructor() {
                super({
                    id: 'workbench.editSessions.actions.resetAuth',
                    title: localize('reset auth.v3', 'Turn off Cloud Changes...'),
                    category: EDIT_SESSION_SYNC_CATEGORY,
                    precondition: ContextKeyExpr.equals(EDIT_SESSIONS_SIGNED_IN_KEY, true),
                    menu: [{
                            id: MenuId.CommandPalette,
                        },
                        {
                            id: MenuId.AccountsContext,
                            group: '2_editSessions',
                            when: ContextKeyExpr.equals(EDIT_SESSIONS_SIGNED_IN_KEY, true),
                        }]
                });
            }
            async run() {
                const result = await that.dialogService.confirm({
                    message: localize('sign out of cloud changes clear data prompt', 'Do you want to disable storing working changes in the cloud?'),
                    checkbox: { label: localize('delete all cloud changes', 'Delete all stored data from the cloud.') }
                });
                if (result.confirmed) {
                    if (result.checkboxChecked) {
                        that.storeClient?.deleteResource('editSessions', null);
                    }
                    that.clearAuthenticationPreference();
                }
            }
        }));
    }
};
EditSessionsWorkbenchService = EditSessionsWorkbenchService_1 = __decorate([
    __param(0, IFileService),
    __param(1, IStorageService),
    __param(2, IQuickInputService),
    __param(3, IAuthenticationService),
    __param(4, IExtensionService),
    __param(5, IEnvironmentService),
    __param(6, IEditSessionsLogService),
    __param(7, IProductService),
    __param(8, IContextKeyService),
    __param(9, IDialogService),
    __param(10, ISecretStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], EditSessionsWorkbenchService);
export { EditSessionsWorkbenchService };
