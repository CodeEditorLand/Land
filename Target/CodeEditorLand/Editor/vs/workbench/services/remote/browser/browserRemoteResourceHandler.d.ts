import { Disposable } from '../../../../base/common/lifecycle.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IRemoteResourceProvider, IResourceUriProvider } from '../../../browser/web.api.js';
export declare class BrowserRemoteResourceLoader extends Disposable {
    private readonly provider;
    constructor(fileService: IFileService, provider: IRemoteResourceProvider);
    getResourceUriProvider(): IResourceUriProvider;
}
