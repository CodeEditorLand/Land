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
import { Disposable, DisposableMap } from '../../../base/common/lifecycle.js';
import * as nls from '../../../nls.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { IAuthenticationService, IAuthenticationExtensionsService, INTERNAL_AUTH_PROVIDER_PREFIX as INTERNAL_MODEL_AUTH_PROVIDER_PREFIX } from '../../services/authentication/common/authentication.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
import { IDialogService } from '../../../platform/dialogs/common/dialogs.js';
import Severity from '../../../base/common/severity.js';
import { INotificationService } from '../../../platform/notification/common/notification.js';
import { IExtensionService } from '../../services/extensions/common/extensions.js';
import { ITelemetryService } from '../../../platform/telemetry/common/telemetry.js';
import { Emitter } from '../../../base/common/event.js';
import { IAuthenticationAccessService } from '../../services/authentication/browser/authenticationAccessService.js';
import { IAuthenticationUsageService } from '../../services/authentication/browser/authenticationUsageService.js';
import { getAuthenticationProviderActivationEvent } from '../../services/authentication/browser/authenticationService.js';
import { URI } from '../../../base/common/uri.js';
import { IOpenerService } from '../../../platform/opener/common/opener.js';
import { CancellationError } from '../../../base/common/errors.js';
export class MainThreadAuthenticationProvider extends Disposable {
    constructor(_proxy, id, label, supportsMultipleAccounts, notificationService, onDidChangeSessionsEmitter) {
        super();
        this._proxy = _proxy;
        this.id = id;
        this.label = label;
        this.supportsMultipleAccounts = supportsMultipleAccounts;
        this.notificationService = notificationService;
        this.onDidChangeSessions = onDidChangeSessionsEmitter.event;
    }
    async getSessions(scopes, options) {
        return this._proxy.$getSessions(this.id, scopes, options);
    }
    createSession(scopes, options) {
        return this._proxy.$createSession(this.id, scopes, options);
    }
    async removeSession(sessionId) {
        await this._proxy.$removeSession(this.id, sessionId);
        this.notificationService.info(nls.localize('signedOut', "Successfully signed out."));
    }
}
let MainThreadAuthentication = class MainThreadAuthentication extends Disposable {
    constructor(extHostContext, authenticationService, authenticationExtensionsService, authenticationAccessService, authenticationUsageService, dialogService, notificationService, extensionService, telemetryService, openerService) {
        super();
        this.authenticationService = authenticationService;
        this.authenticationExtensionsService = authenticationExtensionsService;
        this.authenticationAccessService = authenticationAccessService;
        this.authenticationUsageService = authenticationUsageService;
        this.dialogService = dialogService;
        this.notificationService = notificationService;
        this.extensionService = extensionService;
        this.telemetryService = telemetryService;
        this.openerService = openerService;
        this._registrations = this._register(new DisposableMap());
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostAuthentication);
        this._register(this.authenticationService.onDidChangeSessions(e => {
            this._proxy.$onDidChangeAuthenticationSessions(e.providerId, e.label);
        }));
        this._register(this.authenticationExtensionsService.onDidChangeAccountPreference(e => {
            const providerInfo = this.authenticationService.getProvider(e.providerId);
            this._proxy.$onDidChangeAuthenticationSessions(providerInfo.id, providerInfo.label, e.extensionIds);
        }));
    }
    async $registerAuthenticationProvider(id, label, supportsMultipleAccounts) {
        const emitter = new Emitter();
        this._registrations.set(id, emitter);
        const provider = new MainThreadAuthenticationProvider(this._proxy, id, label, supportsMultipleAccounts, this.notificationService, emitter);
        this.authenticationService.registerAuthenticationProvider(id, provider);
    }
    $unregisterAuthenticationProvider(id) {
        this._registrations.deleteAndDispose(id);
        this.authenticationService.unregisterAuthenticationProvider(id);
    }
    async $ensureProvider(id) {
        if (!this.authenticationService.isAuthenticationProviderRegistered(id)) {
            return await this.extensionService.activateByEvent(getAuthenticationProviderActivationEvent(id), 1);
        }
    }
    $sendDidChangeSessions(providerId, event) {
        const obj = this._registrations.get(providerId);
        if (obj instanceof Emitter) {
            obj.fire(event);
        }
    }
    $removeSession(providerId, sessionId) {
        return this.authenticationService.removeSession(providerId, sessionId);
    }
    async loginPrompt(provider, extensionName, recreatingSession, options) {
        let message;
        if (provider.id.startsWith(INTERNAL_MODEL_AUTH_PROVIDER_PREFIX)) {
            message = nls.localize('confirmModelAccess', "The extension '{0}' wants to access the language models provided by {1}.", extensionName, provider.label);
        }
        else {
            message = recreatingSession
                ? nls.localize('confirmRelogin', "The extension '{0}' wants you to sign in again using {1}.", extensionName, provider.label)
                : nls.localize('confirmLogin', "The extension '{0}' wants to sign in using {1}.", extensionName, provider.label);
        }
        const buttons = [
            {
                label: nls.localize({ key: 'allow', comment: ['&& denotes a mnemonic'] }, "&&Allow"),
                run() {
                    return true;
                },
            }
        ];
        if (options?.learnMore) {
            buttons.push({
                label: nls.localize('learnMore', "Learn more"),
                run: async () => {
                    const result = this.loginPrompt(provider, extensionName, recreatingSession, options);
                    await this.openerService.open(URI.revive(options.learnMore), { allowCommands: true });
                    return await result;
                }
            });
        }
        const { result } = await this.dialogService.prompt({
            type: Severity.Info,
            message,
            buttons,
            detail: options?.detail,
            cancelButton: true,
        });
        return result ?? false;
    }
    async continueWithIncorrectAccountPrompt(chosenAccountLabel, requestedAccountLabel) {
        const result = await this.dialogService.prompt({
            message: nls.localize('incorrectAccount', "Incorrect account detected"),
            detail: nls.localize('incorrectAccountDetail', "The chosen account, {0}, does not match the requested account, {1}.", chosenAccountLabel, requestedAccountLabel),
            type: Severity.Warning,
            cancelButton: true,
            buttons: [
                {
                    label: nls.localize('keep', 'Keep {0}', chosenAccountLabel),
                    run: () => chosenAccountLabel
                },
                {
                    label: nls.localize('loginWith', 'Login with {0}', requestedAccountLabel),
                    run: () => requestedAccountLabel
                }
            ],
        });
        if (!result.result) {
            throw new CancellationError();
        }
        return result.result === chosenAccountLabel;
    }
    async doGetSession(providerId, scopes, extensionId, extensionName, options) {
        const sessions = await this.authenticationService.getSessions(providerId, scopes, options.account, true);
        const provider = this.authenticationService.getProvider(providerId);
        if (options.forceNewSession && options.createIfNone) {
            throw new Error('Invalid combination of options. Please remove one of the following: forceNewSession, createIfNone');
        }
        if (options.forceNewSession && options.silent) {
            throw new Error('Invalid combination of options. Please remove one of the following: forceNewSession, silent');
        }
        if (options.createIfNone && options.silent) {
            throw new Error('Invalid combination of options. Please remove one of the following: createIfNone, silent');
        }
        if (options.clearSessionPreference) {
            this._removeAccountPreference(extensionId, providerId, scopes);
        }
        const matchingAccountPreferenceSession = this._getAccountPreference(extensionId, providerId, scopes, sessions);
        if (!options.forceNewSession && sessions.length) {
            if (matchingAccountPreferenceSession && this.authenticationAccessService.isAccessAllowed(providerId, matchingAccountPreferenceSession.account.label, extensionId)) {
                return matchingAccountPreferenceSession;
            }
            if (!provider.supportsMultipleAccounts && this.authenticationAccessService.isAccessAllowed(providerId, sessions[0].account.label, extensionId)) {
                return sessions[0];
            }
        }
        if (options.createIfNone || options.forceNewSession) {
            let uiOptions;
            if (typeof options.forceNewSession === 'object') {
                uiOptions = options.forceNewSession;
            }
            const recreatingSession = !!(options.forceNewSession && sessions.length);
            const isAllowed = await this.loginPrompt(provider, extensionName, recreatingSession, uiOptions);
            if (!isAllowed) {
                throw new Error('User did not consent to login.');
            }
            let session;
            if (sessions?.length && !options.forceNewSession) {
                session = provider.supportsMultipleAccounts && !options.account
                    ? await this.authenticationExtensionsService.selectSession(providerId, extensionId, extensionName, scopes, sessions)
                    : sessions[0];
            }
            else {
                const accountToCreate = options.account ?? matchingAccountPreferenceSession?.account;
                do {
                    session = await this.authenticationService.createSession(providerId, scopes, { activateImmediate: true, account: accountToCreate });
                } while (accountToCreate
                    && accountToCreate.label !== session.account.label
                    && !await this.continueWithIncorrectAccountPrompt(session.account.label, accountToCreate.label));
            }
            this.authenticationAccessService.updateAllowedExtensions(providerId, session.account.label, [{ id: extensionId, name: extensionName, allowed: true }]);
            this._updateAccountPreference(extensionId, providerId, session);
            return session;
        }
        if (!matchingAccountPreferenceSession && !this.authenticationExtensionsService.getAccountPreference(extensionId, providerId)) {
            const validSession = sessions.find(session => this.authenticationAccessService.isAccessAllowed(providerId, session.account.label, extensionId));
            if (validSession) {
                return validSession;
            }
        }
        if (!options.silent) {
            sessions.length
                ? this.authenticationExtensionsService.requestSessionAccess(providerId, extensionId, extensionName, scopes, sessions)
                : await this.authenticationExtensionsService.requestNewSession(providerId, scopes, extensionId, extensionName);
        }
        return undefined;
    }
    async $getSession(providerId, scopes, extensionId, extensionName, options) {
        const session = await this.doGetSession(providerId, scopes, extensionId, extensionName, options);
        if (session) {
            this.sendProviderUsageTelemetry(extensionId, providerId);
            this.authenticationUsageService.addAccountUsage(providerId, session.account.label, extensionId, extensionName);
        }
        return session;
    }
    async $getAccounts(providerId) {
        const accounts = await this.authenticationService.getAccounts(providerId);
        return accounts;
    }
    sendProviderUsageTelemetry(extensionId, providerId) {
        this.telemetryService.publicLog2('authentication.providerUsage', { providerId, extensionId });
    }
    _getAccountPreference(extensionId, providerId, scopes, sessions) {
        if (sessions.length === 0) {
            return undefined;
        }
        const accountNamePreference = this.authenticationExtensionsService.getAccountPreference(extensionId, providerId);
        if (accountNamePreference) {
            const session = sessions.find(session => session.account.label === accountNamePreference);
            return session;
        }
        const sessionIdPreference = this.authenticationExtensionsService.getSessionPreference(providerId, extensionId, scopes);
        if (sessionIdPreference) {
            const session = sessions.find(session => session.id === sessionIdPreference);
            if (session) {
                this.authenticationExtensionsService.updateAccountPreference(extensionId, providerId, session.account);
                return session;
            }
        }
        return undefined;
    }
    _updateAccountPreference(extensionId, providerId, session) {
        this.authenticationExtensionsService.updateAccountPreference(extensionId, providerId, session.account);
        this.authenticationExtensionsService.updateSessionPreference(providerId, extensionId, session);
    }
    _removeAccountPreference(extensionId, providerId, scopes) {
        this.authenticationExtensionsService.removeAccountPreference(extensionId, providerId);
        this.authenticationExtensionsService.removeSessionPreference(providerId, extensionId, scopes);
    }
};
MainThreadAuthentication = __decorate([
    extHostNamedCustomer(MainContext.MainThreadAuthentication),
    __param(1, IAuthenticationService),
    __param(2, IAuthenticationExtensionsService),
    __param(3, IAuthenticationAccessService),
    __param(4, IAuthenticationUsageService),
    __param(5, IDialogService),
    __param(6, INotificationService),
    __param(7, IExtensionService),
    __param(8, ITelemetryService),
    __param(9, IOpenerService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], MainThreadAuthentication);
export { MainThreadAuthentication };
