import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IFileService } from '../../files/common/files.js';
import { IMainProcessService } from '../../ipc/common/mainProcessService.js';
export declare class ElectronRemoteResourceLoader extends Disposable {
    private readonly windowId;
    private readonly fileService;
    constructor(windowId: number, mainProcessService: IMainProcessService, fileService: IFileService);
    private doRequest;
    getResourceUriProvider(): (uri: URI) => URI;
}
