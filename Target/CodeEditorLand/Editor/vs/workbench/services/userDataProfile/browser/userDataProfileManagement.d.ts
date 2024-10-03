import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IUserDataProfile, IUserDataProfileOptions, IUserDataProfilesService, IUserDataProfileUpdateOptions } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { IHostService } from '../../host/browser/host.js';
import { IProfileTemplateInfo, IUserDataProfileManagementService, IUserDataProfileService } from '../common/userDataProfile.js';
export type ProfileManagementActionExecutedClassification = {
    owner: 'sandy081';
    comment: 'Logged when profile management action is excuted';
    id: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The identifier of the action that was run.';
    };
};
export type ProfileManagementActionExecutedEvent = {
    id: string;
};
export declare class UserDataProfileManagementService extends Disposable implements IUserDataProfileManagementService {
    private readonly userDataProfilesService;
    private readonly userDataProfileService;
    private readonly hostService;
    private readonly dialogService;
    private readonly workspaceContextService;
    private readonly extensionService;
    private readonly environmentService;
    private readonly telemetryService;
    private readonly productService;
    private readonly requestService;
    private readonly configurationService;
    private readonly uriIdentityService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    constructor(userDataProfilesService: IUserDataProfilesService, userDataProfileService: IUserDataProfileService, hostService: IHostService, dialogService: IDialogService, workspaceContextService: IWorkspaceContextService, extensionService: IExtensionService, environmentService: IWorkbenchEnvironmentService, telemetryService: ITelemetryService, productService: IProductService, requestService: IRequestService, configurationService: IConfigurationService, uriIdentityService: IUriIdentityService, logService: ILogService);
    private onDidChangeCurrentProfile;
    private getWorkspaceUri;
    private getProfileToUseForCurrentWorkspace;
    getDefaultProfileToUse(): IUserDataProfile;
    createProfile(name: string, options?: IUserDataProfileOptions): Promise<IUserDataProfile>;
    createAndEnterProfile(name: string, options?: IUserDataProfileOptions): Promise<IUserDataProfile>;
    createAndEnterTransientProfile(): Promise<IUserDataProfile>;
    updateProfile(profile: IUserDataProfile, updateOptions: IUserDataProfileUpdateOptions): Promise<IUserDataProfile>;
    removeProfile(profile: IUserDataProfile): Promise<void>;
    switchProfile(profile: IUserDataProfile): Promise<void>;
    getBuiltinProfileTemplates(): Promise<IProfileTemplateInfo[]>;
    private changeCurrentProfile;
}
