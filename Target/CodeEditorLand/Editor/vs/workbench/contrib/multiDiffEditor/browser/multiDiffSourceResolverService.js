import { BugIndicatingError } from '../../../../base/common/errors.js';
import { toDisposable } from '../../../../base/common/lifecycle.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export const IMultiDiffSourceResolverService = createDecorator('multiDiffSourceResolverService');
export class MultiDiffEditorItem {
    constructor(originalUri, modifiedUri, goToFileUri, contextKeys) {
        this.originalUri = originalUri;
        this.modifiedUri = modifiedUri;
        this.goToFileUri = goToFileUri;
        this.contextKeys = contextKeys;
        if (!originalUri && !modifiedUri) {
            throw new BugIndicatingError('Invalid arguments');
        }
    }
    getKey() {
        return JSON.stringify([this.modifiedUri?.toString(), this.originalUri?.toString()]);
    }
}
export class MultiDiffSourceResolverService {
    constructor() {
        this._resolvers = new Set();
    }
    registerResolver(resolver) {
        if (this._resolvers.has(resolver)) {
            throw new BugIndicatingError('Duplicate resolver');
        }
        this._resolvers.add(resolver);
        return toDisposable(() => this._resolvers.delete(resolver));
    }
    resolve(uri) {
        for (const resolver of this._resolvers) {
            if (resolver.canHandleUri(uri)) {
                return resolver.resolveDiffSource(uri);
            }
        }
        return Promise.resolve(undefined);
    }
}
