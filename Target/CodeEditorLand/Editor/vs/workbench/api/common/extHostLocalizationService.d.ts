import { URI } from '../../../base/common/uri.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { ExtHostLocalizationShape, IStringDetails } from './extHost.protocol.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { IExtHostRpcService } from './extHostRpcService.js';
export declare class ExtHostLocalizationService implements ExtHostLocalizationShape {
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _proxy;
    private readonly currentLanguage;
    private readonly isDefaultLanguage;
    private readonly bundleCache;
    constructor(initData: IExtHostInitDataService, rpc: IExtHostRpcService, logService: ILogService);
    getMessage(extensionId: string, details: IStringDetails): string;
    getBundle(extensionId: string): {
        [key: string]: string;
    } | undefined;
    getBundleUri(extensionId: string): URI | undefined;
    initializeLocalizedMessages(extension: IExtensionDescription): Promise<void>;
    private getBundleLocation;
}
export declare const IExtHostLocalizationService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostLocalizationService>;
export interface IExtHostLocalizationService extends ExtHostLocalizationService {
}
