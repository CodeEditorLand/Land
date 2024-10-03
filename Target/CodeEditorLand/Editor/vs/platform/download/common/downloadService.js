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
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Schemas } from '../../../base/common/network.js';
import { IFileService } from '../../files/common/files.js';
import { asTextOrError, IRequestService } from '../../request/common/request.js';
let DownloadService = class DownloadService {
    constructor(requestService, fileService) {
        this.requestService = requestService;
        this.fileService = fileService;
    }
    async download(resource, target, cancellationToken = CancellationToken.None) {
        if (resource.scheme === Schemas.file || resource.scheme === Schemas.vscodeRemote) {
            await this.fileService.copy(resource, target);
            return;
        }
        const options = { type: 'GET', url: resource.toString(true) };
        const context = await this.requestService.request(options, cancellationToken);
        if (context.res.statusCode === 200) {
            await this.fileService.writeFile(target, context.stream);
        }
        else {
            const message = await asTextOrError(context);
            throw new Error(`Expected 200, got back ${context.res.statusCode} instead.\n\n${message}`);
        }
    }
};
DownloadService = __decorate([
    __param(0, IRequestService),
    __param(1, IFileService),
    __metadata("design:paramtypes", [Object, Object])
], DownloadService);
export { DownloadService };
