import { toDisposable } from '../../../base/common/lifecycle.js';
import { isString } from '../../../base/common/types.js';
import { URI } from '../../../base/common/uri.js';
import { checkProposedApiEnabled } from '../../services/extensions/common/extensions.js';
import { MainContext } from './extHost.protocol.js';
export class ExtHostProfileContentHandlers {
    constructor(mainContext) {
        this.handlers = new Map();
        this.proxy = mainContext.getProxy(MainContext.MainThreadProfileContentHandlers);
    }
    registerProfileContentHandler(extension, id, handler) {
        checkProposedApiEnabled(extension, 'profileContentHandlers');
        if (this.handlers.has(id)) {
            throw new Error(`Handler with id '${id}' already registered`);
        }
        this.handlers.set(id, handler);
        this.proxy.$registerProfileContentHandler(id, handler.name, handler.description, extension.identifier.value);
        return toDisposable(() => {
            this.handlers.delete(id);
            this.proxy.$unregisterProfileContentHandler(id);
        });
    }
    async $saveProfile(id, name, content, token) {
        const handler = this.handlers.get(id);
        if (!handler) {
            throw new Error(`Unknown handler with id: ${id}`);
        }
        return handler.saveProfile(name, content, token);
    }
    async $readProfile(id, idOrUri, token) {
        const handler = this.handlers.get(id);
        if (!handler) {
            throw new Error(`Unknown handler with id: ${id}`);
        }
        return handler.readProfile(isString(idOrUri) ? idOrUri : URI.revive(idOrUri), token);
    }
}
