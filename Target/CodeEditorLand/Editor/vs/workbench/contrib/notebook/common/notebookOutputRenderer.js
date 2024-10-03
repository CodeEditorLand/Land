import * as glob from '../../../../base/common/glob.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { joinPath } from '../../../../base/common/resources.js';
class DependencyList {
    constructor(value) {
        this.value = new Set(value);
        this.defined = this.value.size > 0;
    }
    matches(available) {
        return available.some(v => this.value.has(v));
    }
}
export class NotebookOutputRendererInfo {
    constructor(descriptor) {
        this.id = descriptor.id;
        this.extensionId = descriptor.extension.identifier;
        this.extensionLocation = descriptor.extension.extensionLocation;
        this.isBuiltin = descriptor.extension.isBuiltin;
        if (typeof descriptor.entrypoint === 'string') {
            this.entrypoint = {
                extends: undefined,
                path: joinPath(this.extensionLocation, descriptor.entrypoint)
            };
        }
        else {
            this.entrypoint = {
                extends: descriptor.entrypoint.extends,
                path: joinPath(this.extensionLocation, descriptor.entrypoint.path)
            };
        }
        this.displayName = descriptor.displayName;
        this.mimeTypes = descriptor.mimeTypes;
        this.mimeTypeGlobs = this.mimeTypes.map(pattern => glob.parse(pattern));
        this.hardDependencies = new DependencyList(descriptor.dependencies ?? Iterable.empty());
        this.optionalDependencies = new DependencyList(descriptor.optionalDependencies ?? Iterable.empty());
        this.messaging = descriptor.requiresMessaging ?? "never";
    }
    matchesWithoutKernel(mimeType) {
        if (!this.matchesMimeTypeOnly(mimeType)) {
            return 3;
        }
        if (this.hardDependencies.defined) {
            return 0;
        }
        if (this.optionalDependencies.defined) {
            return 1;
        }
        return 2;
    }
    matches(mimeType, kernelProvides) {
        if (!this.matchesMimeTypeOnly(mimeType)) {
            return 3;
        }
        if (this.hardDependencies.defined) {
            return this.hardDependencies.matches(kernelProvides)
                ? 0
                : 3;
        }
        return this.optionalDependencies.matches(kernelProvides)
            ? 1
            : 2;
    }
    matchesMimeTypeOnly(mimeType) {
        if (this.entrypoint.extends) {
            return false;
        }
        return this.mimeTypeGlobs.some(pattern => pattern(mimeType)) || this.mimeTypes.some(pattern => pattern === mimeType);
    }
}
export class NotebookStaticPreloadInfo {
    constructor(descriptor) {
        this.type = descriptor.type;
        this.entrypoint = joinPath(descriptor.extension.extensionLocation, descriptor.entrypoint);
        this.extensionLocation = descriptor.extension.extensionLocation;
        this.localResourceRoots = descriptor.localResourceRoots.map(root => joinPath(descriptor.extension.extensionLocation, root));
    }
}
