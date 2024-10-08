/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isStandalone } from '../../../base/browser/browser.js';
import { mainWindow } from '../../../base/browser/window.js';
import { VSBuffer, decodeBase64, encodeBase64 } from '../../../base/common/buffer.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { parse } from '../../../base/common/marshalling.js';
import { Schemas } from '../../../base/common/network.js';
import { posix } from '../../../base/common/path.js';
import { isEqual } from '../../../base/common/resources.js';
import { ltrim } from '../../../base/common/strings.js';
import { URI } from '../../../base/common/uri.js';
import product from '../../../platform/product/common/product.js';
import { isFolderToOpen, isWorkspaceToOpen } from '../../../platform/window/common/window.js';
import { create } from '../../../workbench/workbench.web.main.internal.js';
class TransparentCrypto {
    async seal(data) {
        return data;
    }
    async unseal(data) {
        return data;
    }
}
class NetworkError extends Error {
    constructor(inner) {
        super(inner.message);
        this.name = inner.name;
        this.stack = inner.stack;
    }
}
class ServerKeyedAESCrypto {
    /** Gets whether the algorithm is supported; requires a secure context */
    static supported() {
        return !!crypto.subtle;
    }
    constructor(authEndpoint) {
        this.authEndpoint = authEndpoint;
    }
    async seal(data) {
        // Get a new key and IV on every change, to avoid the risk of reusing the same key and IV pair with AES-GCM
        // (see also: https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams#properties)
        const iv = mainWindow.crypto.getRandomValues(new Uint8Array(12 /* AESConstants.IV_LENGTH */));
        // crypto.getRandomValues isn't a good-enough PRNG to generate crypto keys, so we need to use crypto.subtle.generateKey and export the key instead
        const clientKeyObj = await mainWindow.crypto.subtle.generateKey({ name: "AES-GCM" /* AESConstants.ALGORITHM */, length: 256 /* AESConstants.KEY_LENGTH */ }, true, ['encrypt', 'decrypt']);
        const clientKey = new Uint8Array(await mainWindow.crypto.subtle.exportKey('raw', clientKeyObj));
        const key = await this.getKey(clientKey);
        const dataUint8Array = new TextEncoder().encode(data);
        const cipherText = await mainWindow.crypto.subtle.encrypt({ name: "AES-GCM" /* AESConstants.ALGORITHM */, iv }, key, dataUint8Array);
        // Base64 encode the result and store the ciphertext, the key, and the IV in localStorage
        // Note that the clientKey and IV don't need to be secret
        const result = new Uint8Array([...clientKey, ...iv, ...new Uint8Array(cipherText)]);
        return encodeBase64(VSBuffer.wrap(result));
    }
    async unseal(data) {
        // encrypted should contain, in order: the key (32-byte), the IV for AES-GCM (12-byte) and the ciphertext (which has the GCM auth tag at the end)
        // Minimum length must be 44 (key+IV length) + 16 bytes (1 block encrypted with AES - regardless of key size)
        const dataUint8Array = decodeBase64(data);
        if (dataUint8Array.byteLength < 60) {
            throw Error('Invalid length for the value for credentials.crypto');
        }
        const keyLength = 256 /* AESConstants.KEY_LENGTH */ / 8;
        const clientKey = dataUint8Array.slice(0, keyLength);
        const iv = dataUint8Array.slice(keyLength, keyLength + 12 /* AESConstants.IV_LENGTH */);
        const cipherText = dataUint8Array.slice(keyLength + 12 /* AESConstants.IV_LENGTH */);
        // Do the decryption and parse the result as JSON
        const key = await this.getKey(clientKey.buffer);
        const decrypted = await mainWindow.crypto.subtle.decrypt({ name: "AES-GCM" /* AESConstants.ALGORITHM */, iv: iv.buffer }, key, cipherText.buffer);
        return new TextDecoder().decode(new Uint8Array(decrypted));
    }
    /**
     * Given a clientKey, returns the CryptoKey object that is used to encrypt/decrypt the data.
     * The actual key is (clientKey XOR serverKey)
     */
    async getKey(clientKey) {
        if (!clientKey || clientKey.byteLength !== 256 /* AESConstants.KEY_LENGTH */ / 8) {
            throw Error('Invalid length for clientKey');
        }
        const serverKey = await this.getServerKeyPart();
        const keyData = new Uint8Array(256 /* AESConstants.KEY_LENGTH */ / 8);
        for (let i = 0; i < keyData.byteLength; i++) {
            keyData[i] = clientKey[i] ^ serverKey[i];
        }
        return mainWindow.crypto.subtle.importKey('raw', keyData, {
            name: "AES-GCM" /* AESConstants.ALGORITHM */,
            length: 256 /* AESConstants.KEY_LENGTH */,
        }, true, ['encrypt', 'decrypt']);
    }
    async getServerKeyPart() {
        if (this._serverKey) {
            return this._serverKey;
        }
        let attempt = 0;
        let lastError;
        while (attempt <= 3) {
            try {
                const res = await fetch(this.authEndpoint, { credentials: 'include', method: 'POST' });
                if (!res.ok) {
                    throw new Error(res.statusText);
                }
                const serverKey = new Uint8Array(await res.arrayBuffer());
                if (serverKey.byteLength !== 256 /* AESConstants.KEY_LENGTH */ / 8) {
                    throw Error(`The key retrieved by the server is not ${256 /* AESConstants.KEY_LENGTH */} bit long.`);
                }
                this._serverKey = serverKey;
                return this._serverKey;
            }
            catch (e) {
                lastError = e instanceof Error ? e : new Error(String(e));
                attempt++;
                // exponential backoff
                await new Promise(resolve => setTimeout(resolve, attempt * attempt * 100));
            }
        }
        if (lastError) {
            throw new NetworkError(lastError);
        }
        throw new Error('Unknown error');
    }
}
export class LocalStorageSecretStorageProvider {
    constructor(crypto) {
        this.crypto = crypto;
        this._storageKey = 'secrets.provider';
        this._secretsPromise = this.load();
        this.type = 'persisted';
    }
    async load() {
        const record = this.loadAuthSessionFromElement();
        // Get the secrets from localStorage
        const encrypted = localStorage.getItem(this._storageKey);
        if (encrypted) {
            try {
                const decrypted = JSON.parse(await this.crypto.unseal(encrypted));
                return { ...record, ...decrypted };
            }
            catch (err) {
                // TODO: send telemetry
                console.error('Failed to decrypt secrets from localStorage', err);
                if (!(err instanceof NetworkError)) {
                    localStorage.removeItem(this._storageKey);
                }
            }
        }
        return record;
    }
    loadAuthSessionFromElement() {
        let authSessionInfo;
        const authSessionElement = mainWindow.document.getElementById('vscode-workbench-auth-session');
        const authSessionElementAttribute = authSessionElement ? authSessionElement.getAttribute('data-settings') : undefined;
        if (authSessionElementAttribute) {
            try {
                authSessionInfo = JSON.parse(authSessionElementAttribute);
            }
            catch (error) { /* Invalid session is passed. Ignore. */ }
        }
        if (!authSessionInfo) {
            return {};
        }
        const record = {};
        // Settings Sync Entry
        record[`${product.urlProtocol}.loginAccount`] = JSON.stringify(authSessionInfo);
        // Auth extension Entry
        if (authSessionInfo.providerId !== 'github') {
            console.error(`Unexpected auth provider: ${authSessionInfo.providerId}. Expected 'github'.`);
            return record;
        }
        const authAccount = JSON.stringify({ extensionId: 'vscode.github-authentication', key: 'github.auth' });
        record[authAccount] = JSON.stringify(authSessionInfo.scopes.map(scopes => ({
            id: authSessionInfo.id,
            scopes,
            accessToken: authSessionInfo.accessToken
        })));
        return record;
    }
    async get(key) {
        const secrets = await this._secretsPromise;
        return secrets[key];
    }
    async set(key, value) {
        const secrets = await this._secretsPromise;
        secrets[key] = value;
        this._secretsPromise = Promise.resolve(secrets);
        this.save();
    }
    async delete(key) {
        const secrets = await this._secretsPromise;
        delete secrets[key];
        this._secretsPromise = Promise.resolve(secrets);
        this.save();
    }
    async save() {
        try {
            const encrypted = await this.crypto.seal(JSON.stringify(await this._secretsPromise));
            localStorage.setItem(this._storageKey, encrypted);
        }
        catch (err) {
            console.error(err);
        }
    }
}
class LocalStorageURLCallbackProvider extends Disposable {
    static { this.REQUEST_ID = 0; }
    static { this.QUERY_KEYS = [
        'scheme',
        'authority',
        'path',
        'query',
        'fragment'
    ]; }
    constructor(_callbackRoute) {
        super();
        this._callbackRoute = _callbackRoute;
        this._onCallback = this._register(new Emitter());
        this.onCallback = this._onCallback.event;
        this.pendingCallbacks = new Set();
        this.lastTimeChecked = Date.now();
        this.checkCallbacksTimeout = undefined;
    }
    create(options = {}) {
        const id = ++LocalStorageURLCallbackProvider.REQUEST_ID;
        const queryParams = [`vscode-reqid=${id}`];
        for (const key of LocalStorageURLCallbackProvider.QUERY_KEYS) {
            const value = options[key];
            if (value) {
                queryParams.push(`vscode-${key}=${encodeURIComponent(value)}`);
            }
        }
        // TODO@joao remove eventually
        // https://github.com/microsoft/vscode-dev/issues/62
        // https://github.com/microsoft/vscode/blob/159479eb5ae451a66b5dac3c12d564f32f454796/extensions/github-authentication/src/githubServer.ts#L50-L50
        if (!(options.authority === 'vscode.github-authentication' && options.path === '/dummy')) {
            const key = `vscode-web.url-callbacks[${id}]`;
            localStorage.removeItem(key);
            this.pendingCallbacks.add(id);
            this.startListening();
        }
        return URI.parse(mainWindow.location.href).with({ path: this._callbackRoute, query: queryParams.join('&') });
    }
    startListening() {
        if (this.onDidChangeLocalStorageDisposable) {
            return;
        }
        const fn = () => this.onDidChangeLocalStorage();
        mainWindow.addEventListener('storage', fn);
        this.onDidChangeLocalStorageDisposable = { dispose: () => mainWindow.removeEventListener('storage', fn) };
    }
    stopListening() {
        this.onDidChangeLocalStorageDisposable?.dispose();
        this.onDidChangeLocalStorageDisposable = undefined;
    }
    // this fires every time local storage changes, but we
    // don't want to check more often than once a second
    async onDidChangeLocalStorage() {
        const ellapsed = Date.now() - this.lastTimeChecked;
        if (ellapsed > 1000) {
            this.checkCallbacks();
        }
        else if (this.checkCallbacksTimeout === undefined) {
            this.checkCallbacksTimeout = setTimeout(() => {
                this.checkCallbacksTimeout = undefined;
                this.checkCallbacks();
            }, 1000 - ellapsed);
        }
    }
    checkCallbacks() {
        let pendingCallbacks;
        for (const id of this.pendingCallbacks) {
            const key = `vscode-web.url-callbacks[${id}]`;
            const result = localStorage.getItem(key);
            if (result !== null) {
                try {
                    this._onCallback.fire(URI.revive(JSON.parse(result)));
                }
                catch (error) {
                    console.error(error);
                }
                pendingCallbacks = pendingCallbacks ?? new Set(this.pendingCallbacks);
                pendingCallbacks.delete(id);
                localStorage.removeItem(key);
            }
        }
        if (pendingCallbacks) {
            this.pendingCallbacks = pendingCallbacks;
            if (this.pendingCallbacks.size === 0) {
                this.stopListening();
            }
        }
        this.lastTimeChecked = Date.now();
    }
}
class WorkspaceProvider {
    static { this.QUERY_PARAM_EMPTY_WINDOW = 'ew'; }
    static { this.QUERY_PARAM_FOLDER = 'folder'; }
    static { this.QUERY_PARAM_WORKSPACE = 'workspace'; }
    static { this.QUERY_PARAM_PAYLOAD = 'payload'; }
    static create(config) {
        let foundWorkspace = false;
        let workspace;
        let payload = Object.create(null);
        const query = new URL(document.location.href).searchParams;
        query.forEach((value, key) => {
            switch (key) {
                // Folder
                case WorkspaceProvider.QUERY_PARAM_FOLDER:
                    if (config.remoteAuthority && value.startsWith(posix.sep)) {
                        // when connected to a remote and having a value
                        // that is a path (begins with a `/`), assume this
                        // is a vscode-remote resource as simplified URL.
                        workspace = { folderUri: URI.from({ scheme: Schemas.vscodeRemote, path: value, authority: config.remoteAuthority }) };
                    }
                    else {
                        workspace = { folderUri: URI.parse(value) };
                    }
                    foundWorkspace = true;
                    break;
                // Workspace
                case WorkspaceProvider.QUERY_PARAM_WORKSPACE:
                    if (config.remoteAuthority && value.startsWith(posix.sep)) {
                        // when connected to a remote and having a value
                        // that is a path (begins with a `/`), assume this
                        // is a vscode-remote resource as simplified URL.
                        workspace = { workspaceUri: URI.from({ scheme: Schemas.vscodeRemote, path: value, authority: config.remoteAuthority }) };
                    }
                    else {
                        workspace = { workspaceUri: URI.parse(value) };
                    }
                    foundWorkspace = true;
                    break;
                // Empty
                case WorkspaceProvider.QUERY_PARAM_EMPTY_WINDOW:
                    workspace = undefined;
                    foundWorkspace = true;
                    break;
                // Payload
                case WorkspaceProvider.QUERY_PARAM_PAYLOAD:
                    try {
                        payload = parse(value); // use marshalling#parse() to revive potential URIs
                    }
                    catch (error) {
                        console.error(error); // possible invalid JSON
                    }
                    break;
            }
        });
        // If no workspace is provided through the URL, check for config
        // attribute from server
        if (!foundWorkspace) {
            if (config.folderUri) {
                workspace = { folderUri: URI.revive(config.folderUri) };
            }
            else if (config.workspaceUri) {
                workspace = { workspaceUri: URI.revive(config.workspaceUri) };
            }
        }
        return new WorkspaceProvider(workspace, payload, config);
    }
    constructor(workspace, payload, config) {
        this.workspace = workspace;
        this.payload = payload;
        this.config = config;
        this.trusted = true;
    }
    async open(workspace, options) {
        if (options?.reuse && !options.payload && this.isSame(this.workspace, workspace)) {
            return true; // return early if workspace and environment is not changing and we are reusing window
        }
        const targetHref = this.createTargetUrl(workspace, options);
        if (targetHref) {
            if (options?.reuse) {
                mainWindow.location.href = targetHref;
                return true;
            }
            else {
                let result;
                if (isStandalone()) {
                    result = mainWindow.open(targetHref, '_blank', 'toolbar=no'); // ensures to open another 'standalone' window!
                }
                else {
                    result = mainWindow.open(targetHref);
                }
                return !!result;
            }
        }
        return false;
    }
    createTargetUrl(workspace, options) {
        // Empty
        let targetHref = undefined;
        if (!workspace) {
            targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_EMPTY_WINDOW}=true`;
        }
        // Folder
        else if (isFolderToOpen(workspace)) {
            const queryParamFolder = this.encodeWorkspacePath(workspace.folderUri);
            targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_FOLDER}=${queryParamFolder}`;
        }
        // Workspace
        else if (isWorkspaceToOpen(workspace)) {
            const queryParamWorkspace = this.encodeWorkspacePath(workspace.workspaceUri);
            targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_WORKSPACE}=${queryParamWorkspace}`;
        }
        // Append payload if any
        if (options?.payload) {
            targetHref += `&${WorkspaceProvider.QUERY_PARAM_PAYLOAD}=${encodeURIComponent(JSON.stringify(options.payload))}`;
        }
        return targetHref;
    }
    encodeWorkspacePath(uri) {
        if (this.config.remoteAuthority && uri.scheme === Schemas.vscodeRemote) {
            // when connected to a remote and having a folder
            // or workspace for that remote, only use the path
            // as query value to form shorter, nicer URLs.
            // however, we still need to `encodeURIComponent`
            // to ensure to preserve special characters, such
            // as `+` in the path.
            return encodeURIComponent(`${posix.sep}${ltrim(uri.path, posix.sep)}`).replaceAll('%2F', '/');
        }
        return encodeURIComponent(uri.toString(true));
    }
    isSame(workspaceA, workspaceB) {
        if (!workspaceA || !workspaceB) {
            return workspaceA === workspaceB; // both empty
        }
        if (isFolderToOpen(workspaceA) && isFolderToOpen(workspaceB)) {
            return isEqual(workspaceA.folderUri, workspaceB.folderUri); // same workspace
        }
        if (isWorkspaceToOpen(workspaceA) && isWorkspaceToOpen(workspaceB)) {
            return isEqual(workspaceA.workspaceUri, workspaceB.workspaceUri); // same workspace
        }
        return false;
    }
    hasRemote() {
        if (this.workspace) {
            if (isFolderToOpen(this.workspace)) {
                return this.workspace.folderUri.scheme === Schemas.vscodeRemote;
            }
            if (isWorkspaceToOpen(this.workspace)) {
                return this.workspace.workspaceUri.scheme === Schemas.vscodeRemote;
            }
        }
        return true;
    }
}
function readCookie(name) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return undefined;
}
(function () {
    // Find config by checking for DOM
    const configElement = mainWindow.document.getElementById('vscode-workbench-web-configuration');
    const configElementAttribute = configElement ? configElement.getAttribute('data-settings') : undefined;
    if (!configElement || !configElementAttribute) {
        throw new Error('Missing web configuration element');
    }
    const config = JSON.parse(configElementAttribute);
    const secretStorageKeyPath = readCookie('vscode-secret-key-path');
    const secretStorageCrypto = secretStorageKeyPath && ServerKeyedAESCrypto.supported()
        ? new ServerKeyedAESCrypto(secretStorageKeyPath) : new TransparentCrypto();
    // Create workbench
    create(mainWindow.document.body, {
        ...config,
        windowIndicator: config.windowIndicator ?? { label: '$(remote)', tooltip: `${product.nameShort} Web` },
        settingsSyncOptions: config.settingsSyncOptions ? { enabled: config.settingsSyncOptions.enabled, } : undefined,
        workspaceProvider: WorkspaceProvider.create(config),
        urlCallbackProvider: new LocalStorageURLCallbackProvider(config.callbackRoute),
        secretStorageProvider: config.remoteAuthority && !secretStorageKeyPath
            ? undefined /* with a remote without embedder-preferred storage, store on the remote */
            : new LocalStorageSecretStorageProvider(secretStorageCrypto),
    });
})();
