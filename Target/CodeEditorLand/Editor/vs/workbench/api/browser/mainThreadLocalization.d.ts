import { MainThreadLocalizationShape } from '../common/extHost.protocol.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
import { IFileService } from '../../../platform/files/common/files.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ILanguagePackService } from '../../../platform/languagePacks/common/languagePacks.js';
export declare class MainThreadLocalization extends Disposable implements MainThreadLocalizationShape {
    private readonly fileService;
    private readonly languagePackService;
    constructor(extHostContext: IExtHostContext, fileService: IFileService, languagePackService: ILanguagePackService);
    $fetchBuiltInBundleUri(id: string, language: string): Promise<URI | undefined>;
    $fetchBundleContents(uriComponents: UriComponents): Promise<string>;
}
