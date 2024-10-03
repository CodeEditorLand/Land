import { shell } from 'electron';
import { localize } from '../../../nls.js';
import { isWindows } from '../../../base/common/platform.js';
import { URI } from '../../../base/common/uri.js';
import { createFileSystemProviderError, FileSystemProviderErrorCode } from '../common/files.js';
import { basename, normalize } from '../../../base/common/path.js';
import { AbstractDiskFileSystemProviderChannel, AbstractSessionFileWatcher } from '../node/diskFileSystemProviderServer.js';
import { DefaultURITransformer } from '../../../base/common/uriIpc.js';
import { toErrorMessage } from '../../../base/common/errorMessage.js';
export class DiskFileSystemProviderChannel extends AbstractDiskFileSystemProviderChannel {
    constructor(provider, logService, environmentService) {
        super(provider, logService);
        this.environmentService = environmentService;
    }
    getUriTransformer(ctx) {
        return DefaultURITransformer;
    }
    transformIncoming(uriTransformer, _resource) {
        return URI.revive(_resource);
    }
    async delete(uriTransformer, _resource, opts) {
        if (!opts.useTrash) {
            return super.delete(uriTransformer, _resource, opts);
        }
        const resource = this.transformIncoming(uriTransformer, _resource);
        const filePath = normalize(resource.fsPath);
        try {
            await shell.trashItem(filePath);
        }
        catch (error) {
            throw createFileSystemProviderError(isWindows ? localize('binFailed', "Failed to move '{0}' to the recycle bin ({1})", basename(filePath), toErrorMessage(error)) : localize('trashFailed', "Failed to move '{0}' to the trash ({1})", basename(filePath), toErrorMessage(error)), FileSystemProviderErrorCode.Unknown);
        }
    }
    createSessionFileWatcher(uriTransformer, emitter) {
        return new SessionFileWatcher(uriTransformer, emitter, this.logService, this.environmentService);
    }
}
class SessionFileWatcher extends AbstractSessionFileWatcher {
    watch(req, resource, opts) {
        if (opts.recursive) {
            throw createFileSystemProviderError('Recursive file watching is not supported from main process for performance reasons.', FileSystemProviderErrorCode.Unavailable);
        }
        return super.watch(req, resource, opts);
    }
}
