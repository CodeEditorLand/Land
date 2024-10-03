import { IUserDataProfile } from '../../../../platform/userDataProfile/common/userDataProfile.js';
export declare const IRemoteUserDataProfilesService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IRemoteUserDataProfilesService>;
export interface IRemoteUserDataProfilesService {
    readonly _serviceBrand: undefined;
    getRemoteProfiles(): Promise<readonly IUserDataProfile[]>;
    getRemoteProfile(localProfile: IUserDataProfile): Promise<IUserDataProfile>;
}
