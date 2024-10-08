import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IChannel, IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { URI, UriDto } from '../../../base/common/uri.js';
import { DidChangeProfilesEvent, IUserDataProfile, IUserDataProfileOptions, IUserDataProfilesService, IUserDataProfileUpdateOptions } from './userDataProfile.js';
import { IAnyWorkspaceIdentifier } from '../../workspace/common/workspace.js';
import { IURITransformer } from '../../../base/common/uriIpc.js';
export declare class RemoteUserDataProfilesServiceChannel implements IServerChannel {
    private readonly service;
    private readonly getUriTransformer;
    constructor(service: IUserDataProfilesService, getUriTransformer: (requestContext: any) => IURITransformer);
    listen(context: any, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
export declare class UserDataProfilesService extends Disposable implements IUserDataProfilesService {
    readonly profilesHome: URI;
    private readonly channel;
    readonly _serviceBrand: undefined;
    get defaultProfile(): IUserDataProfile;
    private _profiles;
    get profiles(): IUserDataProfile[];
    private readonly _onDidChangeProfiles;
    readonly onDidChangeProfiles: Event<DidChangeProfilesEvent>;
    readonly onDidResetWorkspaces: Event<void>;
    constructor(profiles: readonly UriDto<IUserDataProfile>[], profilesHome: URI, channel: IChannel);
    createNamedProfile(name: string, options?: IUserDataProfileOptions, workspaceIdentifier?: IAnyWorkspaceIdentifier): Promise<IUserDataProfile>;
    createProfile(id: string, name: string, options?: IUserDataProfileOptions, workspaceIdentifier?: IAnyWorkspaceIdentifier): Promise<IUserDataProfile>;
    createTransientProfile(workspaceIdentifier?: IAnyWorkspaceIdentifier): Promise<IUserDataProfile>;
    setProfileForWorkspace(workspaceIdentifier: IAnyWorkspaceIdentifier, profile: IUserDataProfile): Promise<void>;
    removeProfile(profile: IUserDataProfile): Promise<void>;
    updateProfile(profile: IUserDataProfile, updateOptions: IUserDataProfileUpdateOptions): Promise<IUserDataProfile>;
    resetWorkspaces(): Promise<void>;
    cleanUp(): Promise<void>;
    cleanUpTransientProfiles(): Promise<void>;
}
