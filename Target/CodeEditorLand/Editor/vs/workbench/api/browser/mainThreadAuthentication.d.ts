import { Disposable } from '../../../base/common/lifecycle.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IAuthenticationCreateSessionOptions, AuthenticationSession, AuthenticationSessionsChangeEvent, IAuthenticationProvider, IAuthenticationService, IAuthenticationExtensionsService, AuthenticationSessionAccount, IAuthenticationProviderSessionOptions } from '../../services/authentication/common/authentication.js';
import { ExtHostAuthenticationShape, MainThreadAuthenticationShape } from '../common/extHost.protocol.js';
import { IDialogService } from '../../../platform/dialogs/common/dialogs.js';
import { INotificationService } from '../../../platform/notification/common/notification.js';
import { IExtensionService } from '../../services/extensions/common/extensions.js';
import { ITelemetryService } from '../../../platform/telemetry/common/telemetry.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { IAuthenticationAccessService } from '../../services/authentication/browser/authenticationAccessService.js';
import { IAuthenticationUsageService } from '../../services/authentication/browser/authenticationUsageService.js';
import { UriComponents } from '../../../base/common/uri.js';
import { IOpenerService } from '../../../platform/opener/common/opener.js';
interface AuthenticationForceNewSessionOptions {
    detail?: string;
    learnMore?: UriComponents;
    sessionToRecreate?: AuthenticationSession;
}
interface AuthenticationGetSessionOptions {
    clearSessionPreference?: boolean;
    createIfNone?: boolean;
    forceNewSession?: boolean | AuthenticationForceNewSessionOptions;
    silent?: boolean;
    account?: AuthenticationSessionAccount;
}
export declare class MainThreadAuthenticationProvider extends Disposable implements IAuthenticationProvider {
    private readonly _proxy;
    readonly id: string;
    readonly label: string;
    readonly supportsMultipleAccounts: boolean;
    private readonly notificationService;
    readonly onDidChangeSessions: Event<AuthenticationSessionsChangeEvent>;
    constructor(_proxy: ExtHostAuthenticationShape, id: string, label: string, supportsMultipleAccounts: boolean, notificationService: INotificationService, onDidChangeSessionsEmitter: Emitter<AuthenticationSessionsChangeEvent>);
    getSessions(scopes: string[] | undefined, options: IAuthenticationProviderSessionOptions): Promise<readonly AuthenticationSession[]>;
    createSession(scopes: string[], options: IAuthenticationCreateSessionOptions): Promise<AuthenticationSession>;
    removeSession(sessionId: string): Promise<void>;
}
export declare class MainThreadAuthentication extends Disposable implements MainThreadAuthenticationShape {
    private readonly authenticationService;
    private readonly authenticationExtensionsService;
    private readonly authenticationAccessService;
    private readonly authenticationUsageService;
    private readonly dialogService;
    private readonly notificationService;
    private readonly extensionService;
    private readonly telemetryService;
    private readonly openerService;
    private readonly _proxy;
    private readonly _registrations;
    constructor(extHostContext: IExtHostContext, authenticationService: IAuthenticationService, authenticationExtensionsService: IAuthenticationExtensionsService, authenticationAccessService: IAuthenticationAccessService, authenticationUsageService: IAuthenticationUsageService, dialogService: IDialogService, notificationService: INotificationService, extensionService: IExtensionService, telemetryService: ITelemetryService, openerService: IOpenerService);
    $registerAuthenticationProvider(id: string, label: string, supportsMultipleAccounts: boolean): Promise<void>;
    $unregisterAuthenticationProvider(id: string): void;
    $ensureProvider(id: string): Promise<void>;
    $sendDidChangeSessions(providerId: string, event: AuthenticationSessionsChangeEvent): void;
    $removeSession(providerId: string, sessionId: string): Promise<void>;
    private loginPrompt;
    private continueWithIncorrectAccountPrompt;
    private doGetSession;
    $getSession(providerId: string, scopes: string[], extensionId: string, extensionName: string, options: AuthenticationGetSessionOptions): Promise<AuthenticationSession | undefined>;
    $getAccounts(providerId: string): Promise<ReadonlyArray<AuthenticationSessionAccount>>;
    private sendProviderUsageTelemetry;
    private _getAccountPreference;
    private _updateAccountPreference;
    private _removeAccountPreference;
}
export {};
