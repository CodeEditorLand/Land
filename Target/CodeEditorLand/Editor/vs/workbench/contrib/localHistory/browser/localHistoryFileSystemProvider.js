/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { FileType, hasReadWriteCapability } from '../../../../platform/files/common/files.js';
import { isEqual } from '../../../../base/common/resources.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
/**
 * A wrapper around a standard file system provider
 * that is entirely readonly.
 */
export class LocalHistoryFileSystemProvider {
    static { this.SCHEMA = 'vscode-local-history'; }
    static toLocalHistoryFileSystem(resource) {
        const serializedLocalHistoryResource = {
            location: resource.location.toString(true),
            associatedResource: resource.associatedResource.toString(true)
        };
        // Try to preserve the associated resource as much as possible
        // and only keep the `query` part dynamic. This enables other
        // components (e.g. other timeline providers) to continue
        // providing timeline entries even when our resource is active.
        return resource.associatedResource.with({
            scheme: LocalHistoryFileSystemProvider.SCHEMA,
            query: JSON.stringify(serializedLocalHistoryResource)
        });
    }
    static fromLocalHistoryFileSystem(resource) {
        const serializedLocalHistoryResource = JSON.parse(resource.query);
        return {
            location: URI.parse(serializedLocalHistoryResource.location),
            associatedResource: URI.parse(serializedLocalHistoryResource.associatedResource)
        };
    }
    static { this.EMPTY_RESOURCE = URI.from({ scheme: LocalHistoryFileSystemProvider.SCHEMA, path: '/empty' }); }
    static { this.EMPTY = {
        location: LocalHistoryFileSystemProvider.EMPTY_RESOURCE,
        associatedResource: LocalHistoryFileSystemProvider.EMPTY_RESOURCE
    }; }
    get capabilities() {
        return 2 /* FileSystemProviderCapabilities.FileReadWrite */ | 2048 /* FileSystemProviderCapabilities.Readonly */;
    }
    constructor(fileService) {
        this.fileService = fileService;
        this.mapSchemeToProvider = new Map();
        //#endregion
        //#region Unsupported File Operations
        this.onDidChangeCapabilities = Event.None;
        this.onDidChangeFile = Event.None;
    }
    async withProvider(resource) {
        const scheme = resource.scheme;
        let providerPromise = this.mapSchemeToProvider.get(scheme);
        if (!providerPromise) {
            // Resolve early when provider already exists
            const provider = this.fileService.getProvider(scheme);
            if (provider) {
                providerPromise = Promise.resolve(provider);
            }
            // Otherwise wait for registration
            else {
                providerPromise = new Promise(resolve => {
                    const disposable = this.fileService.onDidChangeFileSystemProviderRegistrations(e => {
                        if (e.added && e.provider && e.scheme === scheme) {
                            disposable.dispose();
                            resolve(e.provider);
                        }
                    });
                });
            }
            this.mapSchemeToProvider.set(scheme, providerPromise);
        }
        return providerPromise;
    }
    //#region Supported File Operations
    async stat(resource) {
        const location = LocalHistoryFileSystemProvider.fromLocalHistoryFileSystem(resource).location;
        // Special case: empty resource
        if (isEqual(LocalHistoryFileSystemProvider.EMPTY_RESOURCE, location)) {
            return { type: FileType.File, ctime: 0, mtime: 0, size: 0 };
        }
        // Otherwise delegate to provider
        return (await this.withProvider(location)).stat(location);
    }
    async readFile(resource) {
        const location = LocalHistoryFileSystemProvider.fromLocalHistoryFileSystem(resource).location;
        // Special case: empty resource
        if (isEqual(LocalHistoryFileSystemProvider.EMPTY_RESOURCE, location)) {
            return VSBuffer.fromString('').buffer;
        }
        // Otherwise delegate to provider
        const provider = await this.withProvider(location);
        if (hasReadWriteCapability(provider)) {
            return provider.readFile(location);
        }
        throw new Error('Unsupported');
    }
    async writeFile(resource, content, opts) { }
    async mkdir(resource) { }
    async readdir(resource) { return []; }
    async rename(from, to, opts) { }
    async delete(resource, opts) { }
    watch(resource, opts) { return Disposable.None; }
}
