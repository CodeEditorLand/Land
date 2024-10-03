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
import { IExtHostConsumerFileSystem } from '../common/extHostFileSystemConsumer.js';
import { Schemas } from '../../../base/common/network.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { DiskFileSystemProvider } from '../../../platform/files/node/diskFileSystemProvider.js';
import { FilePermission } from '../../../platform/files/common/files.js';
import { isLinux } from '../../../base/common/platform.js';
let ExtHostDiskFileSystemProvider = class ExtHostDiskFileSystemProvider {
    constructor(extHostConsumerFileSystem, logService) {
        extHostConsumerFileSystem.addFileSystemProvider(Schemas.file, new DiskFileSystemProviderAdapter(logService), { isCaseSensitive: isLinux });
    }
};
ExtHostDiskFileSystemProvider = __decorate([
    __param(0, IExtHostConsumerFileSystem),
    __param(1, ILogService),
    __metadata("design:paramtypes", [Object, Object])
], ExtHostDiskFileSystemProvider);
export { ExtHostDiskFileSystemProvider };
class DiskFileSystemProviderAdapter {
    constructor(logService) {
        this.logService = logService;
        this.impl = new DiskFileSystemProvider(this.logService);
    }
    async stat(uri) {
        const stat = await this.impl.stat(uri);
        return {
            type: stat.type,
            ctime: stat.ctime,
            mtime: stat.mtime,
            size: stat.size,
            permissions: stat.permissions === FilePermission.Readonly ? 1 : undefined
        };
    }
    readDirectory(uri) {
        return this.impl.readdir(uri);
    }
    createDirectory(uri) {
        return this.impl.mkdir(uri);
    }
    readFile(uri) {
        return this.impl.readFile(uri);
    }
    writeFile(uri, content, options) {
        return this.impl.writeFile(uri, content, { ...options, unlock: false, atomic: false });
    }
    delete(uri, options) {
        return this.impl.delete(uri, { ...options, useTrash: false, atomic: false });
    }
    rename(oldUri, newUri, options) {
        return this.impl.rename(oldUri, newUri, options);
    }
    copy(source, destination, options) {
        return this.impl.copy(source, destination, options);
    }
    get onDidChangeFile() { throw new Error('Method not implemented.'); }
    watch(uri, options) { throw new Error('Method not implemented.'); }
}
