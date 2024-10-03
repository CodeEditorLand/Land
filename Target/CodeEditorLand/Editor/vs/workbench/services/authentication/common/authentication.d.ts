import { Event } from '../../../../base/common/event.js';
export declare const INTERNAL_AUTH_PROVIDER_PREFIX = "__";
export interface AuthenticationSessionAccount {
    label: string;
    id: string;
}
export interface AuthenticationSession {
    id: string;
    accessToken: string;
    account: AuthenticationSessionAccount;
    scopes: ReadonlyArray<string>;
    idToken?: string;
}
export interface AuthenticationSessionsChangeEvent {
    added: ReadonlyArray<AuthenticationSession> | undefined;
    removed: ReadonlyArray<AuthenticationSession> | undefined;
    changed: ReadonlyArray<AuthenticationSession> | undefined;
}
export interface AuthenticationProviderInformation {
    id: string;
    label: string;
}
export interface IAuthenticationCreateSessionOptions {
    activateImmediate?: boolean;
    account?: AuthenticationSessionAccount;
}
export interface AllowedExtension {
    id: string;
    name: string;
    allowed?: boolean;
    lastUsed?: number;
    trusted?: boolean;
}
export declare const IAuthenticationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAuthenticationService>;
export interface IAuthenticationService {
    readonly _serviceBrand: undefined;
    readonly onDidRegisterAuthenticationProvider: Event<AuthenticationProviderInformation>;
    readonly onDidUnregisterAuthenticationProvider: Event<AuthenticationProviderInformation>;
    readonly onDidChangeSessions: Event<{
        providerId: string;
        label: string;
        event: AuthenticationSessionsChangeEvent;
    }>;
    readonly onDidChangeDeclaredProviders: Event<void>;
    readonly declaredProviders: AuthenticationProviderInformation[];
    registerDeclaredAuthenticationProvider(provider: AuthenticationProviderInformation): void;
    unregisterDeclaredAuthenticationProvider(id: string): void;
    isAuthenticationProviderRegistered(id: string): boolean;
    registerAuthenticationProvider(id: string, provider: IAuthenticationProvider): void;
    unregisterAuthenticationProvider(id: string): void;
    getProviderIds(): string[];
    getProvider(id: string): IAuthenticationProvider;
    getAccounts(id: string): Promise<ReadonlyArray<AuthenticationSessionAccount>>;
    getSessions(id: string, scopes?: string[], account?: AuthenticationSessionAccount, activateImmediate?: boolean): Promise<ReadonlyArray<AuthenticationSession>>;
    createSession(providerId: string, scopes: string[], options?: IAuthenticationCreateSessionOptions): Promise<AuthenticationSession>;
    removeSession(providerId: string, sessionId: string): Promise<void>;
}
export declare const IAuthenticationExtensionsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAuthenticationExtensionsService>;
export interface IAuthenticationExtensionsService {
    readonly _serviceBrand: undefined;
    onDidChangeAccountPreference: Event<{
        extensionIds: string[];
        providerId: string;
    }>;
    getAccountPreference(extensionId: string, providerId: string): string | undefined;
    updateAccountPreference(extensionId: string, providerId: string, account: AuthenticationSessionAccount): void;
    removeAccountPreference(extensionId: string, providerId: string): void;
    updateSessionPreference(providerId: string, extensionId: string, session: AuthenticationSession): void;
    getSessionPreference(providerId: string, extensionId: string, scopes: string[]): string | undefined;
    removeSessionPreference(providerId: string, extensionId: string, scopes: string[]): void;
    selectSession(providerId: string, extensionId: string, extensionName: string, scopes: string[], possibleSessions: readonly AuthenticationSession[]): Promise<AuthenticationSession>;
    requestSessionAccess(providerId: string, extensionId: string, extensionName: string, scopes: string[], possibleSessions: readonly AuthenticationSession[]): void;
    requestNewSession(providerId: string, scopes: string[], extensionId: string, extensionName: string): Promise<void>;
}
export interface IAuthenticationProviderSessionOptions {
    account?: AuthenticationSessionAccount;
}
export interface IAuthenticationProvider {
    readonly id: string;
    readonly label: string;
    readonly supportsMultipleAccounts: boolean;
    readonly onDidChangeSessions: Event<AuthenticationSessionsChangeEvent>;
    getSessions(scopes: string[] | undefined, options: IAuthenticationProviderSessionOptions): Promise<readonly AuthenticationSession[]>;
    createSession(scopes: string[], options: IAuthenticationProviderSessionOptions): Promise<AuthenticationSession>;
    removeSession(sessionId: string): Promise<void>;
}
