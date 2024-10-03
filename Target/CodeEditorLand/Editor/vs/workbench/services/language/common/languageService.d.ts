import { LanguageService } from '../../../../editor/common/services/languageService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { IExtensionPoint } from '../../extensions/common/extensionsRegistry.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export interface IRawLanguageExtensionPoint {
    id: string;
    extensions: string[];
    filenames: string[];
    filenamePatterns: string[];
    firstLine: string;
    aliases: string[];
    mimetypes: string[];
    configuration: string;
    icon: {
        light: string;
        dark: string;
    };
}
export declare const languagesExtPoint: IExtensionPoint<IRawLanguageExtensionPoint[]>;
export declare class WorkbenchLanguageService extends LanguageService {
    private readonly logService;
    private _configurationService;
    private _extensionService;
    constructor(extensionService: IExtensionService, configurationService: IConfigurationService, environmentService: IEnvironmentService, logService: ILogService);
    private updateMime;
}
