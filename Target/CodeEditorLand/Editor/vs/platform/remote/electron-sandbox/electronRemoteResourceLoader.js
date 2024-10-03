var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { VSBuffer, encodeBase64 } from '../../../base/common/buffer.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { getMediaOrTextMime } from '../../../base/common/mime.js';
import { Schemas } from '../../../base/common/network.js';
import { URI } from '../../../base/common/uri.js';
import { FileOperationError, IFileService } from '../../files/common/files.js';
import { IMainProcessService } from '../../ipc/common/mainProcessService.js';
import { NODE_REMOTE_RESOURCE_CHANNEL_NAME, NODE_REMOTE_RESOURCE_IPC_METHOD_NAME } from '../common/electronRemoteResources.js';
let ElectronRemoteResourceLoader = class ElectronRemoteResourceLoader extends Disposable {
    constructor(windowId, mainProcessService, fileService) {
        super();
        this.windowId = windowId;
        this.fileService = fileService;
        const channel = {
            listen(_, event) {
                throw new Error(`Event not found: ${event}`);
            },
            call: (_, command, arg) => {
                switch (command) {
                    case NODE_REMOTE_RESOURCE_IPC_METHOD_NAME: return this.doRequest(URI.revive(arg[0]));
                }
                throw new Error(`Call not found: ${command}`);
            }
        };
        mainProcessService.registerChannel(NODE_REMOTE_RESOURCE_CHANNEL_NAME, channel);
    }
    async doRequest(uri) {
        let content;
        try {
            const params = new URLSearchParams(uri.query);
            const actual = uri.with({
                scheme: params.get('scheme'),
                authority: params.get('authority'),
                query: '',
            });
            content = await this.fileService.readFile(actual);
        }
        catch (e) {
            const str = encodeBase64(VSBuffer.fromString(e.message));
            if (e instanceof FileOperationError && e.fileOperationResult === 1) {
                return { statusCode: 404, body: str };
            }
            else {
                return { statusCode: 500, body: str };
            }
        }
        const mimeType = uri.path && getMediaOrTextMime(uri.path);
        return { statusCode: 200, body: encodeBase64(content.value), mimeType };
    }
    getResourceUriProvider() {
        return (uri) => uri.with({
            scheme: Schemas.vscodeManagedRemoteResource,
            authority: `window:${this.windowId}`,
            query: new URLSearchParams({ authority: uri.authority, scheme: uri.scheme }).toString(),
        });
    }
};
ElectronRemoteResourceLoader = __decorate([
    __param(1, IMainProcessService),
    __param(2, IFileService),
    __metadata("design:paramtypes", [Number, Object, Object])
], ElectronRemoteResourceLoader);
export { ElectronRemoteResourceLoader };
