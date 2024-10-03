import type * as vscode from 'vscode';
import { Event } from '../../../base/common/event.js';
import { ExtHostAuthenticationShape } from './extHost.protocol.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { IExtHostRpcService } from './extHostRpcService.js';
export interface IExtHostAuthentication extends ExtHostAuthentication {
}
export declare const IExtHostAuthentication: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostAuthentication>;
export declare class ExtHostAuthentication implements ExtHostAuthenticationShape {
    _serviceBrand: undefined;
    private _proxy;
    private _authenticationProviders;
    private _onDidChangeSessions;
    private _getSessionTaskSingler;
    constructor(extHostRpc: IExtHostRpcService);
    getExtensionScopedSessionsEvent(extensionId: string): Event<vscode.AuthenticationSessionsChangeEvent>;
    getSession(requestingExtension: IExtensionDescription, providerId: string, scopes: readonly string[], options: vscode.AuthenticationGetSessionOptions & ({
        createIfNone: true;
    } | {
        forceNewSession: true;
    } | {
        forceNewSession: vscode.AuthenticationForceNewSessionOptions;
    })): Promise<vscode.AuthenticationSession>;
    getSession(requestingExtension: IExtensionDescription, providerId: string, scopes: readonly string[], options: vscode.AuthenticationGetSessionOptions & {
        forceNewSession: true;
    }): Promise<vscode.AuthenticationSession>;
    getSession(requestingExtension: IExtensionDescription, providerId: string, scopes: readonly string[], options: vscode.AuthenticationGetSessionOptions & {
        forceNewSession: vscode.AuthenticationForceNewSessionOptions;
    }): Promise<vscode.AuthenticationSession>;
    getSession(requestingExtension: IExtensionDescription, providerId: string, scopes: readonly string[], options: vscode.AuthenticationGetSessionOptions): Promise<vscode.AuthenticationSession | undefined>;
    getAccounts(providerId: string): Promise<readonly import("../../services/authentication/common/authentication.js").AuthenticationSessionAccount[]>;
    removeSession(providerId: string, sessionId: string): Promise<void>;
    registerAuthenticationProvider(id: string, label: string, provider: vscode.AuthenticationProvider, options?: vscode.AuthenticationProviderOptions): vscode.Disposable;
    $createSession(providerId: string, scopes: string[], options: vscode.AuthenticationProviderSessionOptions): Promise<vscode.AuthenticationSession>;
    $removeSession(providerId: string, sessionId: string): Promise<void>;
    $getSessions(providerId: string, scopes: ReadonlyArray<string> | undefined, options: vscode.AuthenticationProviderSessionOptions): Promise<ReadonlyArray<vscode.AuthenticationSession>>;
    $onDidChangeAuthenticationSessions(id: string, label: string, extensionIdFilter?: string[]): Promise<void>;
}
