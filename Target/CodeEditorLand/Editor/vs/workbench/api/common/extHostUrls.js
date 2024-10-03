import { MainContext } from './extHost.protocol.js';
import { URI } from '../../../base/common/uri.js';
import { toDisposable } from '../../../base/common/lifecycle.js';
import { onUnexpectedError } from '../../../base/common/errors.js';
import { ExtensionIdentifierSet } from '../../../platform/extensions/common/extensions.js';
export class ExtHostUrls {
    static { this.HandlePool = 0; }
    constructor(mainContext) {
        this.handles = new ExtensionIdentifierSet();
        this.handlers = new Map();
        this._proxy = mainContext.getProxy(MainContext.MainThreadUrls);
    }
    registerUriHandler(extension, handler) {
        const extensionId = extension.identifier;
        if (this.handles.has(extensionId)) {
            throw new Error(`Protocol handler already registered for extension ${extensionId}`);
        }
        const handle = ExtHostUrls.HandlePool++;
        this.handles.add(extensionId);
        this.handlers.set(handle, handler);
        this._proxy.$registerUriHandler(handle, extensionId, extension.displayName || extension.name);
        return toDisposable(() => {
            this.handles.delete(extensionId);
            this.handlers.delete(handle);
            this._proxy.$unregisterUriHandler(handle);
        });
    }
    $handleExternalUri(handle, uri) {
        const handler = this.handlers.get(handle);
        if (!handler) {
            return Promise.resolve(undefined);
        }
        try {
            handler.handleUri(URI.revive(uri));
        }
        catch (err) {
            onUnexpectedError(err);
        }
        return Promise.resolve(undefined);
    }
    async createAppUri(uri) {
        return URI.revive(await this._proxy.$createAppUri(uri));
    }
}
