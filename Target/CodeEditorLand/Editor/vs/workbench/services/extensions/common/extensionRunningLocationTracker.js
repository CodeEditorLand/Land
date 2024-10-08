/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { Schemas } from '../../../../base/common/network.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ExtensionIdentifierMap } from '../../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { determineExtensionHostKinds } from './extensionHostKind.js';
import { IExtensionManifestPropertiesService } from './extensionManifestPropertiesService.js';
import { LocalProcessRunningLocation, LocalWebWorkerRunningLocation, RemoteRunningLocation } from './extensionRunningLocation.js';
let ExtensionRunningLocationTracker = class ExtensionRunningLocationTracker {
    get maxLocalProcessAffinity() {
        return this._maxLocalProcessAffinity;
    }
    get maxLocalWebWorkerAffinity() {
        return this._maxLocalWebWorkerAffinity;
    }
    constructor(_registry, _extensionHostKindPicker, _environmentService, _configurationService, _logService, _extensionManifestPropertiesService) {
        this._registry = _registry;
        this._extensionHostKindPicker = _extensionHostKindPicker;
        this._environmentService = _environmentService;
        this._configurationService = _configurationService;
        this._logService = _logService;
        this._extensionManifestPropertiesService = _extensionManifestPropertiesService;
        this._runningLocation = new ExtensionIdentifierMap();
        this._maxLocalProcessAffinity = 0;
        this._maxLocalWebWorkerAffinity = 0;
    }
    set(extensionId, runningLocation) {
        this._runningLocation.set(extensionId, runningLocation);
    }
    readExtensionKinds(extensionDescription) {
        if (extensionDescription.isUnderDevelopment && this._environmentService.extensionDevelopmentKind) {
            return this._environmentService.extensionDevelopmentKind;
        }
        return this._extensionManifestPropertiesService.getExtensionKind(extensionDescription);
    }
    getRunningLocation(extensionId) {
        return this._runningLocation.get(extensionId) || null;
    }
    filterByRunningLocation(extensions, desiredRunningLocation) {
        return filterExtensionDescriptions(extensions, this._runningLocation, extRunningLocation => desiredRunningLocation.equals(extRunningLocation));
    }
    filterByExtensionHostKind(extensions, desiredExtensionHostKind) {
        return filterExtensionDescriptions(extensions, this._runningLocation, extRunningLocation => extRunningLocation.kind === desiredExtensionHostKind);
    }
    filterByExtensionHostManager(extensions, extensionHostManager) {
        return filterExtensionDescriptions(extensions, this._runningLocation, extRunningLocation => extensionHostManager.representsRunningLocation(extRunningLocation));
    }
    _computeAffinity(inputExtensions, extensionHostKind, isInitialAllocation) {
        // Only analyze extensions that can execute
        const extensions = new ExtensionIdentifierMap();
        for (const extension of inputExtensions) {
            if (extension.main || extension.browser) {
                extensions.set(extension.identifier, extension);
            }
        }
        // Also add existing extensions of the same kind that can execute
        for (const extension of this._registry.getAllExtensionDescriptions()) {
            if (extension.main || extension.browser) {
                const runningLocation = this._runningLocation.get(extension.identifier);
                if (runningLocation && runningLocation.kind === extensionHostKind) {
                    extensions.set(extension.identifier, extension);
                }
            }
        }
        // Initially, each extension belongs to its own group
        const groups = new ExtensionIdentifierMap();
        let groupNumber = 0;
        for (const [_, extension] of extensions) {
            groups.set(extension.identifier, ++groupNumber);
        }
        const changeGroup = (from, to) => {
            for (const [key, group] of groups) {
                if (group === from) {
                    groups.set(key, to);
                }
            }
        };
        // We will group things together when there are dependencies
        for (const [_, extension] of extensions) {
            if (!extension.extensionDependencies) {
                continue;
            }
            const myGroup = groups.get(extension.identifier);
            for (const depId of extension.extensionDependencies) {
                const depGroup = groups.get(depId);
                if (!depGroup) {
                    // probably can't execute, so it has no impact
                    continue;
                }
                if (depGroup === myGroup) {
                    // already in the same group
                    continue;
                }
                changeGroup(depGroup, myGroup);
            }
        }
        // Initialize with existing affinities
        const resultingAffinities = new Map();
        let lastAffinity = 0;
        for (const [_, extension] of extensions) {
            const runningLocation = this._runningLocation.get(extension.identifier);
            if (runningLocation) {
                const group = groups.get(extension.identifier);
                resultingAffinities.set(group, runningLocation.affinity);
                lastAffinity = Math.max(lastAffinity, runningLocation.affinity);
            }
        }
        // When doing extension host debugging, we will ignore the configured affinity
        // because we can currently debug a single extension host
        if (!this._environmentService.isExtensionDevelopment) {
            // Go through each configured affinity and try to accomodate it
            const configuredAffinities = this._configurationService.getValue('extensions.experimental.affinity') || {};
            const configuredExtensionIds = Object.keys(configuredAffinities);
            const configuredAffinityToResultingAffinity = new Map();
            for (const extensionId of configuredExtensionIds) {
                const configuredAffinity = configuredAffinities[extensionId];
                if (typeof configuredAffinity !== 'number' || configuredAffinity <= 0 || Math.floor(configuredAffinity) !== configuredAffinity) {
                    this._logService.info(`Ignoring configured affinity for '${extensionId}' because the value is not a positive integer.`);
                    continue;
                }
                const group = groups.get(extensionId);
                if (!group) {
                    // The extension is not known or cannot execute for this extension host kind
                    continue;
                }
                const affinity1 = resultingAffinities.get(group);
                if (affinity1) {
                    // Affinity for this group is already established
                    configuredAffinityToResultingAffinity.set(configuredAffinity, affinity1);
                    continue;
                }
                const affinity2 = configuredAffinityToResultingAffinity.get(configuredAffinity);
                if (affinity2) {
                    // Affinity for this configuration is already established
                    resultingAffinities.set(group, affinity2);
                    continue;
                }
                if (!isInitialAllocation) {
                    this._logService.info(`Ignoring configured affinity for '${extensionId}' because extension host(s) are already running. Reload window.`);
                    continue;
                }
                const affinity3 = ++lastAffinity;
                configuredAffinityToResultingAffinity.set(configuredAffinity, affinity3);
                resultingAffinities.set(group, affinity3);
            }
        }
        const result = new ExtensionIdentifierMap();
        for (const extension of inputExtensions) {
            const group = groups.get(extension.identifier) || 0;
            const affinity = resultingAffinities.get(group) || 0;
            result.set(extension.identifier, affinity);
        }
        if (lastAffinity > 0 && isInitialAllocation) {
            for (let affinity = 1; affinity <= lastAffinity; affinity++) {
                const extensionIds = [];
                for (const extension of inputExtensions) {
                    if (result.get(extension.identifier) === affinity) {
                        extensionIds.push(extension.identifier);
                    }
                }
                this._logService.info(`Placing extension(s) ${extensionIds.map(e => e.value).join(', ')} on a separate extension host.`);
            }
        }
        return { affinities: result, maxAffinity: lastAffinity };
    }
    computeRunningLocation(localExtensions, remoteExtensions, isInitialAllocation) {
        return this._doComputeRunningLocation(this._runningLocation, localExtensions, remoteExtensions, isInitialAllocation).runningLocation;
    }
    _doComputeRunningLocation(existingRunningLocation, localExtensions, remoteExtensions, isInitialAllocation) {
        // Skip extensions that have an existing running location
        localExtensions = localExtensions.filter(extension => !existingRunningLocation.has(extension.identifier));
        remoteExtensions = remoteExtensions.filter(extension => !existingRunningLocation.has(extension.identifier));
        const extensionHostKinds = determineExtensionHostKinds(localExtensions, remoteExtensions, (extension) => this.readExtensionKinds(extension), (extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference) => this._extensionHostKindPicker.pickExtensionHostKind(extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference));
        const extensions = new ExtensionIdentifierMap();
        for (const extension of localExtensions) {
            extensions.set(extension.identifier, extension);
        }
        for (const extension of remoteExtensions) {
            extensions.set(extension.identifier, extension);
        }
        const result = new ExtensionIdentifierMap();
        const localProcessExtensions = [];
        const localWebWorkerExtensions = [];
        for (const [extensionIdKey, extensionHostKind] of extensionHostKinds) {
            let runningLocation = null;
            if (extensionHostKind === 1 /* ExtensionHostKind.LocalProcess */) {
                const extensionDescription = extensions.get(extensionIdKey);
                if (extensionDescription) {
                    localProcessExtensions.push(extensionDescription);
                }
            }
            else if (extensionHostKind === 2 /* ExtensionHostKind.LocalWebWorker */) {
                const extensionDescription = extensions.get(extensionIdKey);
                if (extensionDescription) {
                    localWebWorkerExtensions.push(extensionDescription);
                }
            }
            else if (extensionHostKind === 3 /* ExtensionHostKind.Remote */) {
                runningLocation = new RemoteRunningLocation();
            }
            result.set(extensionIdKey, runningLocation);
        }
        const { affinities, maxAffinity } = this._computeAffinity(localProcessExtensions, 1 /* ExtensionHostKind.LocalProcess */, isInitialAllocation);
        for (const extension of localProcessExtensions) {
            const affinity = affinities.get(extension.identifier) || 0;
            result.set(extension.identifier, new LocalProcessRunningLocation(affinity));
        }
        const { affinities: localWebWorkerAffinities, maxAffinity: maxLocalWebWorkerAffinity } = this._computeAffinity(localWebWorkerExtensions, 2 /* ExtensionHostKind.LocalWebWorker */, isInitialAllocation);
        for (const extension of localWebWorkerExtensions) {
            const affinity = localWebWorkerAffinities.get(extension.identifier) || 0;
            result.set(extension.identifier, new LocalWebWorkerRunningLocation(affinity));
        }
        // Add extensions that already have an existing running location
        for (const [extensionIdKey, runningLocation] of existingRunningLocation) {
            if (runningLocation) {
                result.set(extensionIdKey, runningLocation);
            }
        }
        return { runningLocation: result, maxLocalProcessAffinity: maxAffinity, maxLocalWebWorkerAffinity: maxLocalWebWorkerAffinity };
    }
    initializeRunningLocation(localExtensions, remoteExtensions) {
        const { runningLocation, maxLocalProcessAffinity, maxLocalWebWorkerAffinity } = this._doComputeRunningLocation(this._runningLocation, localExtensions, remoteExtensions, true);
        this._runningLocation = runningLocation;
        this._maxLocalProcessAffinity = maxLocalProcessAffinity;
        this._maxLocalWebWorkerAffinity = maxLocalWebWorkerAffinity;
    }
    /**
     * Returns the running locations for the removed extensions.
     */
    deltaExtensions(toAdd, toRemove) {
        // Remove old running location
        const removedRunningLocation = new ExtensionIdentifierMap();
        for (const extensionId of toRemove) {
            const extensionKey = extensionId;
            removedRunningLocation.set(extensionKey, this._runningLocation.get(extensionKey) || null);
            this._runningLocation.delete(extensionKey);
        }
        // Determine new running location
        this._updateRunningLocationForAddedExtensions(toAdd);
        return removedRunningLocation;
    }
    /**
     * Update `this._runningLocation` with running locations for newly enabled/installed extensions.
     */
    _updateRunningLocationForAddedExtensions(toAdd) {
        // Determine new running location
        const localProcessExtensions = [];
        const localWebWorkerExtensions = [];
        for (const extension of toAdd) {
            const extensionKind = this.readExtensionKinds(extension);
            const isRemote = extension.extensionLocation.scheme === Schemas.vscodeRemote;
            const extensionHostKind = this._extensionHostKindPicker.pickExtensionHostKind(extension.identifier, extensionKind, !isRemote, isRemote, 0 /* ExtensionRunningPreference.None */);
            let runningLocation = null;
            if (extensionHostKind === 1 /* ExtensionHostKind.LocalProcess */) {
                localProcessExtensions.push(extension);
            }
            else if (extensionHostKind === 2 /* ExtensionHostKind.LocalWebWorker */) {
                localWebWorkerExtensions.push(extension);
            }
            else if (extensionHostKind === 3 /* ExtensionHostKind.Remote */) {
                runningLocation = new RemoteRunningLocation();
            }
            this._runningLocation.set(extension.identifier, runningLocation);
        }
        const { affinities } = this._computeAffinity(localProcessExtensions, 1 /* ExtensionHostKind.LocalProcess */, false);
        for (const extension of localProcessExtensions) {
            const affinity = affinities.get(extension.identifier) || 0;
            this._runningLocation.set(extension.identifier, new LocalProcessRunningLocation(affinity));
        }
        const { affinities: webWorkerExtensionsAffinities } = this._computeAffinity(localWebWorkerExtensions, 2 /* ExtensionHostKind.LocalWebWorker */, false);
        for (const extension of localWebWorkerExtensions) {
            const affinity = webWorkerExtensionsAffinities.get(extension.identifier) || 0;
            this._runningLocation.set(extension.identifier, new LocalWebWorkerRunningLocation(affinity));
        }
    }
};
ExtensionRunningLocationTracker = __decorate([
    __param(2, IWorkbenchEnvironmentService),
    __param(3, IConfigurationService),
    __param(4, ILogService),
    __param(5, IExtensionManifestPropertiesService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], ExtensionRunningLocationTracker);
export { ExtensionRunningLocationTracker };
export function filterExtensionDescriptions(extensions, runningLocation, predicate) {
    return extensions.filter((ext) => {
        const extRunningLocation = runningLocation.get(ext.identifier);
        return extRunningLocation && predicate(extRunningLocation);
    });
}
export function filterExtensionIdentifiers(extensions, runningLocation, predicate) {
    return extensions.filter((ext) => {
        const extRunningLocation = runningLocation.get(ext);
        return extRunningLocation && predicate(extRunningLocation);
    });
}
