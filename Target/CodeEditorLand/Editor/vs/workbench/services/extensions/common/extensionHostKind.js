import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
export function extensionHostKindToString(kind) {
    if (kind === null) {
        return 'None';
    }
    switch (kind) {
        case 1: return 'LocalProcess';
        case 2: return 'LocalWebWorker';
        case 3: return 'Remote';
    }
}
export function extensionRunningPreferenceToString(preference) {
    switch (preference) {
        case 0:
            return 'None';
        case 1:
            return 'Local';
        case 2:
            return 'Remote';
    }
}
export function determineExtensionHostKinds(_localExtensions, _remoteExtensions, getExtensionKind, pickExtensionHostKind) {
    const localExtensions = toExtensionWithKind(_localExtensions, getExtensionKind);
    const remoteExtensions = toExtensionWithKind(_remoteExtensions, getExtensionKind);
    const allExtensions = new Map();
    const collectExtension = (ext) => {
        if (allExtensions.has(ext.key)) {
            return;
        }
        const local = localExtensions.get(ext.key) || null;
        const remote = remoteExtensions.get(ext.key) || null;
        const info = new ExtensionInfo(local, remote);
        allExtensions.set(info.key, info);
    };
    localExtensions.forEach((ext) => collectExtension(ext));
    remoteExtensions.forEach((ext) => collectExtension(ext));
    const extensionHostKinds = new Map();
    allExtensions.forEach((ext) => {
        const isInstalledLocally = Boolean(ext.local);
        const isInstalledRemotely = Boolean(ext.remote);
        const isLocallyUnderDevelopment = Boolean(ext.local && ext.local.isUnderDevelopment);
        const isRemotelyUnderDevelopment = Boolean(ext.remote && ext.remote.isUnderDevelopment);
        let preference = 0;
        if (isLocallyUnderDevelopment && !isRemotelyUnderDevelopment) {
            preference = 1;
        }
        else if (isRemotelyUnderDevelopment && !isLocallyUnderDevelopment) {
            preference = 2;
        }
        extensionHostKinds.set(ext.key, pickExtensionHostKind(ext.identifier, ext.kind, isInstalledLocally, isInstalledRemotely, preference));
    });
    return extensionHostKinds;
}
function toExtensionWithKind(extensions, getExtensionKind) {
    const result = new Map();
    extensions.forEach((desc) => {
        const ext = new ExtensionWithKind(desc, getExtensionKind(desc));
        result.set(ext.key, ext);
    });
    return result;
}
class ExtensionWithKind {
    constructor(desc, kind) {
        this.desc = desc;
        this.kind = kind;
    }
    get key() {
        return ExtensionIdentifier.toKey(this.desc.identifier);
    }
    get isUnderDevelopment() {
        return this.desc.isUnderDevelopment;
    }
}
class ExtensionInfo {
    constructor(local, remote) {
        this.local = local;
        this.remote = remote;
    }
    get key() {
        if (this.local) {
            return this.local.key;
        }
        return this.remote.key;
    }
    get identifier() {
        if (this.local) {
            return this.local.desc.identifier;
        }
        return this.remote.desc.identifier;
    }
    get kind() {
        if (this.local) {
            return this.local.kind;
        }
        return this.remote.kind;
    }
}
