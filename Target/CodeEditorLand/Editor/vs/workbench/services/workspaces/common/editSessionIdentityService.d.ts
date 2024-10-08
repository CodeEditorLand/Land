import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { EditSessionIdentityMatch, IEditSessionIdentityCreateParticipant, IEditSessionIdentityProvider, IEditSessionIdentityService } from '../../../../platform/workspace/common/editSessions.js';
import { IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
export declare class EditSessionIdentityService implements IEditSessionIdentityService {
    private readonly _extensionService;
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private _editSessionIdentifierProviders;
    constructor(_extensionService: IExtensionService, _logService: ILogService);
    registerEditSessionIdentityProvider(provider: IEditSessionIdentityProvider): IDisposable;
    getEditSessionIdentifier(workspaceFolder: IWorkspaceFolder, token: CancellationToken): Promise<string | undefined>;
    provideEditSessionIdentityMatch(workspaceFolder: IWorkspaceFolder, identity1: string, identity2: string, cancellationToken: CancellationToken): Promise<EditSessionIdentityMatch | undefined>;
    onWillCreateEditSessionIdentity(workspaceFolder: IWorkspaceFolder, cancellationToken: CancellationToken): Promise<void>;
    private _participants;
    addEditSessionIdentityCreateParticipant(participant: IEditSessionIdentityCreateParticipant): IDisposable;
    private activateProvider;
}
