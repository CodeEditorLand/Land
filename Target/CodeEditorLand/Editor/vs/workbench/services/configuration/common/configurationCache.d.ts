import { IConfigurationCache, ConfigurationKey } from './configuration.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
export declare class ConfigurationCache implements IConfigurationCache {
    private readonly donotCacheResourcesWithSchemes;
    private readonly fileService;
    private readonly cacheHome;
    private readonly cachedConfigurations;
    constructor(donotCacheResourcesWithSchemes: string[], environmentService: IEnvironmentService, fileService: IFileService);
    needsCaching(resource: URI): boolean;
    read(key: ConfigurationKey): Promise<string>;
    write(key: ConfigurationKey, content: string): Promise<void>;
    remove(key: ConfigurationKey): Promise<void>;
    private getCachedConfiguration;
}
