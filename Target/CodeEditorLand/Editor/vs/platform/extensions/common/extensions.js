import * as strings from '../../../base/common/strings.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { getRemoteName } from '../../remote/common/remoteHosts.js';
export const USER_MANIFEST_CACHE_FILE = 'extensions.user.cache';
export const BUILTIN_MANIFEST_CACHE_FILE = 'extensions.builtin.cache';
export const UNDEFINED_PUBLISHER = 'undefined_publisher';
export const ALL_EXTENSION_KINDS = ['ui', 'workspace', 'web'];
export function getWorkspaceSupportTypeMessage(supportType) {
    if (typeof supportType === 'object' && supportType !== null) {
        if (supportType.supported !== true) {
            return supportType.description;
        }
    }
    return undefined;
}
export const EXTENSION_CATEGORIES = [
    'AI',
    'Azure',
    'Chat',
    'Data Science',
    'Debuggers',
    'Extension Packs',
    'Education',
    'Formatters',
    'Keymaps',
    'Language Packs',
    'Linters',
    'Machine Learning',
    'Notebooks',
    'Programming Languages',
    'SCM Providers',
    'Snippets',
    'Testing',
    'Themes',
    'Visualization',
    'Other',
];
export class ExtensionIdentifier {
    constructor(value) {
        this.value = value;
        this._lower = value.toLowerCase();
    }
    static equals(a, b) {
        if (typeof a === 'undefined' || a === null) {
            return (typeof b === 'undefined' || b === null);
        }
        if (typeof b === 'undefined' || b === null) {
            return false;
        }
        if (typeof a === 'string' || typeof b === 'string') {
            const aValue = (typeof a === 'string' ? a : a.value);
            const bValue = (typeof b === 'string' ? b : b.value);
            return strings.equalsIgnoreCase(aValue, bValue);
        }
        return (a._lower === b._lower);
    }
    static toKey(id) {
        if (typeof id === 'string') {
            return id.toLowerCase();
        }
        return id._lower;
    }
}
export class ExtensionIdentifierSet {
    get size() {
        return this._set.size;
    }
    constructor(iterable) {
        this._set = new Set();
        if (iterable) {
            for (const value of iterable) {
                this.add(value);
            }
        }
    }
    add(id) {
        this._set.add(ExtensionIdentifier.toKey(id));
    }
    delete(extensionId) {
        return this._set.delete(ExtensionIdentifier.toKey(extensionId));
    }
    has(id) {
        return this._set.has(ExtensionIdentifier.toKey(id));
    }
}
export class ExtensionIdentifierMap {
    constructor() {
        this._map = new Map();
    }
    clear() {
        this._map.clear();
    }
    delete(id) {
        this._map.delete(ExtensionIdentifier.toKey(id));
    }
    get(id) {
        return this._map.get(ExtensionIdentifier.toKey(id));
    }
    has(id) {
        return this._map.has(ExtensionIdentifier.toKey(id));
    }
    set(id, value) {
        this._map.set(ExtensionIdentifier.toKey(id), value);
    }
    values() {
        return this._map.values();
    }
    forEach(callbackfn) {
        this._map.forEach(callbackfn);
    }
    [Symbol.iterator]() {
        return this._map[Symbol.iterator]();
    }
}
export function isApplicationScopedExtension(manifest) {
    return isLanguagePackExtension(manifest);
}
export function isLanguagePackExtension(manifest) {
    return manifest.contributes && manifest.contributes.localizations ? manifest.contributes.localizations.length > 0 : false;
}
export function isAuthenticationProviderExtension(manifest) {
    return manifest.contributes && manifest.contributes.authentication ? manifest.contributes.authentication.length > 0 : false;
}
export function isResolverExtension(manifest, remoteAuthority) {
    if (remoteAuthority) {
        const activationEvent = `onResolveRemoteAuthority:${getRemoteName(remoteAuthority)}`;
        return !!manifest.activationEvents?.includes(activationEvent);
    }
    return false;
}
export function parseApiProposals(enabledApiProposals) {
    return enabledApiProposals.map(proposal => {
        const [proposalName, version] = proposal.split('@');
        return { proposalName, version: version ? parseInt(version) : undefined };
    });
}
export function parseEnabledApiProposalNames(enabledApiProposals) {
    return enabledApiProposals.map(proposal => proposal.split('@')[0]);
}
export const IBuiltinExtensionsScannerService = createDecorator('IBuiltinExtensionsScannerService');
