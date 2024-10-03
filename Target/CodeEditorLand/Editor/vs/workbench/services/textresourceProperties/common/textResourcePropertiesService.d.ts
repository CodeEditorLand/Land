import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ITextResourcePropertiesService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
export declare class TextResourcePropertiesService implements ITextResourcePropertiesService {
    private readonly configurationService;
    private readonly environmentService;
    private readonly storageService;
    readonly _serviceBrand: undefined;
    private remoteEnvironment;
    constructor(configurationService: IConfigurationService, remoteAgentService: IRemoteAgentService, environmentService: IWorkbenchEnvironmentService, storageService: IStorageService);
    getEOL(resource?: URI, language?: string): string;
    private getOS;
}
