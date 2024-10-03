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
import { randomPath } from '../../../../base/common/extpath.js';
import { Schemas } from '../../../../base/common/network.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { IElevatedFileService } from '../common/elevatedFileService.js';
let NativeElevatedFileService = class NativeElevatedFileService {
    constructor(nativeHostService, fileService, environmentService) {
        this.nativeHostService = nativeHostService;
        this.fileService = fileService;
        this.environmentService = environmentService;
    }
    isSupported(resource) {
        return resource.scheme === Schemas.file;
    }
    async writeFileElevated(resource, value, options) {
        const source = URI.file(randomPath(this.environmentService.userDataPath, 'code-elevated'));
        try {
            await this.fileService.writeFile(source, value, options);
            await this.nativeHostService.writeElevated(source, resource, options);
        }
        finally {
            await this.fileService.del(source);
        }
        return this.fileService.resolve(resource, { resolveMetadata: true });
    }
};
NativeElevatedFileService = __decorate([
    __param(0, INativeHostService),
    __param(1, IFileService),
    __param(2, INativeWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object, Object])
], NativeElevatedFileService);
export { NativeElevatedFileService };
registerSingleton(IElevatedFileService, NativeElevatedFileService, 1);
