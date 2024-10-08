import { CancellationToken } from '../../../base/common/cancellation.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { IWorkspaceFolder } from './workspace.js';
export interface IEditSessionIdentityProvider {
    readonly scheme: string;
    getEditSessionIdentifier(workspaceFolder: IWorkspaceFolder, token: CancellationToken): Promise<string | undefined>;
    provideEditSessionIdentityMatch(workspaceFolder: IWorkspaceFolder, identity1: string, identity2: string, token: CancellationToken): Promise<EditSessionIdentityMatch | undefined>;
}
export declare const IEditSessionIdentityService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IEditSessionIdentityService>;
export interface IEditSessionIdentityService {
    readonly _serviceBrand: undefined;
    registerEditSessionIdentityProvider(provider: IEditSessionIdentityProvider): IDisposable;
    getEditSessionIdentifier(workspaceFolder: IWorkspaceFolder, cancellationToken: CancellationToken): Promise<string | undefined>;
    provideEditSessionIdentityMatch(workspaceFolder: IWorkspaceFolder, identity1: string, identity2: string, cancellationToken: CancellationToken): Promise<EditSessionIdentityMatch | undefined>;
    addEditSessionIdentityCreateParticipant(participants: IEditSessionIdentityCreateParticipant): IDisposable;
    onWillCreateEditSessionIdentity(workspaceFolder: IWorkspaceFolder, cancellationToken: CancellationToken): Promise<void>;
}
export interface IEditSessionIdentityCreateParticipant {
    participate(workspaceFolder: IWorkspaceFolder, cancellationToken: CancellationToken): Promise<void>;
}
export declare enum EditSessionIdentityMatch {
    Complete = 100,
    Partial = 50,
    None = 0
}
