import { CancellationToken } from '../../../base/common/cancellation.js';
import { hash } from '../../../base/common/hash.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { Schemas } from '../../../base/common/network.js';
import { joinPath } from '../../../base/common/resources.js';
import { URI } from '../../../base/common/uri.js';
import * as typeConverters from './extHostTypeConverters.js';
import { shouldSerializeBuffersForPostMessage, toExtensionData } from './extHostWebview.js';
import { Cache } from './cache.js';
import * as extHostProtocol from './extHost.protocol.js';
import * as extHostTypes from './extHostTypes.js';
class CustomDocumentStoreEntry {
    constructor(document, _storagePath) {
        this.document = document;
        this._storagePath = _storagePath;
        this._backupCounter = 1;
        this._edits = new Cache('custom documents');
    }
    addEdit(item) {
        return this._edits.add([item]);
    }
    async undo(editId, isDirty) {
        await this.getEdit(editId).undo();
        if (!isDirty) {
            this.disposeBackup();
        }
    }
    async redo(editId, isDirty) {
        await this.getEdit(editId).redo();
        if (!isDirty) {
            this.disposeBackup();
        }
    }
    disposeEdits(editIds) {
        for (const id of editIds) {
            this._edits.delete(id);
        }
    }
    getNewBackupUri() {
        if (!this._storagePath) {
            throw new Error('Backup requires a valid storage path');
        }
        const fileName = hashPath(this.document.uri) + (this._backupCounter++);
        return joinPath(this._storagePath, fileName);
    }
    updateBackup(backup) {
        this._backup?.delete();
        this._backup = backup;
    }
    disposeBackup() {
        this._backup?.delete();
        this._backup = undefined;
    }
    getEdit(editId) {
        const edit = this._edits.get(editId, 0);
        if (!edit) {
            throw new Error('No edit found');
        }
        return edit;
    }
}
class CustomDocumentStore {
    constructor() {
        this._documents = new Map();
    }
    get(viewType, resource) {
        return this._documents.get(this.key(viewType, resource));
    }
    add(viewType, document, storagePath) {
        const key = this.key(viewType, document.uri);
        if (this._documents.has(key)) {
            throw new Error(`Document already exists for viewType:${viewType} resource:${document.uri}`);
        }
        const entry = new CustomDocumentStoreEntry(document, storagePath);
        this._documents.set(key, entry);
        return entry;
    }
    delete(viewType, document) {
        const key = this.key(viewType, document.uri);
        this._documents.delete(key);
    }
    key(viewType, resource) {
        return `${viewType}@@@${resource}`;
    }
}
class EditorProviderStore {
    constructor() {
        this._providers = new Map();
    }
    addTextProvider(viewType, extension, provider) {
        return this.add(viewType, { type: 0, extension, provider });
    }
    addCustomProvider(viewType, extension, provider) {
        return this.add(viewType, { type: 1, extension, provider });
    }
    get(viewType) {
        return this._providers.get(viewType);
    }
    add(viewType, entry) {
        if (this._providers.has(viewType)) {
            throw new Error(`Provider for viewType:${viewType} already registered`);
        }
        this._providers.set(viewType, entry);
        return new extHostTypes.Disposable(() => this._providers.delete(viewType));
    }
}
export class ExtHostCustomEditors {
    constructor(mainContext, _extHostDocuments, _extensionStoragePaths, _extHostWebview, _extHostWebviewPanels) {
        this._extHostDocuments = _extHostDocuments;
        this._extensionStoragePaths = _extensionStoragePaths;
        this._extHostWebview = _extHostWebview;
        this._extHostWebviewPanels = _extHostWebviewPanels;
        this._editorProviders = new EditorProviderStore();
        this._documents = new CustomDocumentStore();
        this._proxy = mainContext.getProxy(extHostProtocol.MainContext.MainThreadCustomEditors);
    }
    registerCustomEditorProvider(extension, viewType, provider, options) {
        const disposables = new DisposableStore();
        if (isCustomTextEditorProvider(provider)) {
            disposables.add(this._editorProviders.addTextProvider(viewType, extension, provider));
            this._proxy.$registerTextEditorProvider(toExtensionData(extension), viewType, options.webviewOptions || {}, {
                supportsMove: !!provider.moveCustomTextEditor,
            }, shouldSerializeBuffersForPostMessage(extension));
        }
        else {
            disposables.add(this._editorProviders.addCustomProvider(viewType, extension, provider));
            if (isCustomEditorProviderWithEditingCapability(provider)) {
                disposables.add(provider.onDidChangeCustomDocument(e => {
                    const entry = this.getCustomDocumentEntry(viewType, e.document.uri);
                    if (isEditEvent(e)) {
                        const editId = entry.addEdit(e);
                        this._proxy.$onDidEdit(e.document.uri, viewType, editId, e.label);
                    }
                    else {
                        this._proxy.$onContentChange(e.document.uri, viewType);
                    }
                }));
            }
            this._proxy.$registerCustomEditorProvider(toExtensionData(extension), viewType, options.webviewOptions || {}, !!options.supportsMultipleEditorsPerDocument, shouldSerializeBuffersForPostMessage(extension));
        }
        return extHostTypes.Disposable.from(disposables, new extHostTypes.Disposable(() => {
            this._proxy.$unregisterEditorProvider(viewType);
        }));
    }
    async $createCustomDocument(resource, viewType, backupId, untitledDocumentData, cancellation) {
        const entry = this._editorProviders.get(viewType);
        if (!entry) {
            throw new Error(`No provider found for '${viewType}'`);
        }
        if (entry.type !== 1) {
            throw new Error(`Invalid provide type for '${viewType}'`);
        }
        const revivedResource = URI.revive(resource);
        const document = await entry.provider.openCustomDocument(revivedResource, { backupId, untitledDocumentData: untitledDocumentData?.buffer }, cancellation);
        let storageRoot;
        if (isCustomEditorProviderWithEditingCapability(entry.provider) && this._extensionStoragePaths) {
            storageRoot = this._extensionStoragePaths.workspaceValue(entry.extension) ?? this._extensionStoragePaths.globalValue(entry.extension);
        }
        this._documents.add(viewType, document, storageRoot);
        return { editable: isCustomEditorProviderWithEditingCapability(entry.provider) };
    }
    async $disposeCustomDocument(resource, viewType) {
        const entry = this._editorProviders.get(viewType);
        if (!entry) {
            throw new Error(`No provider found for '${viewType}'`);
        }
        if (entry.type !== 1) {
            throw new Error(`Invalid provider type for '${viewType}'`);
        }
        const revivedResource = URI.revive(resource);
        const { document } = this.getCustomDocumentEntry(viewType, revivedResource);
        this._documents.delete(viewType, document);
        document.dispose();
    }
    async $resolveCustomEditor(resource, handle, viewType, initData, position, cancellation) {
        const entry = this._editorProviders.get(viewType);
        if (!entry) {
            throw new Error(`No provider found for '${viewType}'`);
        }
        const viewColumn = typeConverters.ViewColumn.to(position);
        const webview = this._extHostWebview.createNewWebview(handle, initData.contentOptions, entry.extension);
        const panel = this._extHostWebviewPanels.createNewWebviewPanel(handle, viewType, initData.title, viewColumn, initData.options, webview, initData.active);
        const revivedResource = URI.revive(resource);
        switch (entry.type) {
            case 1: {
                const { document } = this.getCustomDocumentEntry(viewType, revivedResource);
                return entry.provider.resolveCustomEditor(document, panel, cancellation);
            }
            case 0: {
                const document = this._extHostDocuments.getDocument(revivedResource);
                return entry.provider.resolveCustomTextEditor(document, panel, cancellation);
            }
            default: {
                throw new Error('Unknown webview provider type');
            }
        }
    }
    $disposeEdits(resourceComponents, viewType, editIds) {
        const document = this.getCustomDocumentEntry(viewType, resourceComponents);
        document.disposeEdits(editIds);
    }
    async $onMoveCustomEditor(handle, newResourceComponents, viewType) {
        const entry = this._editorProviders.get(viewType);
        if (!entry) {
            throw new Error(`No provider found for '${viewType}'`);
        }
        if (!entry.provider.moveCustomTextEditor) {
            throw new Error(`Provider does not implement move '${viewType}'`);
        }
        const webview = this._extHostWebviewPanels.getWebviewPanel(handle);
        if (!webview) {
            throw new Error(`No webview found`);
        }
        const resource = URI.revive(newResourceComponents);
        const document = this._extHostDocuments.getDocument(resource);
        await entry.provider.moveCustomTextEditor(document, webview, CancellationToken.None);
    }
    async $undo(resourceComponents, viewType, editId, isDirty) {
        const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
        return entry.undo(editId, isDirty);
    }
    async $redo(resourceComponents, viewType, editId, isDirty) {
        const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
        return entry.redo(editId, isDirty);
    }
    async $revert(resourceComponents, viewType, cancellation) {
        const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
        const provider = this.getCustomEditorProvider(viewType);
        await provider.revertCustomDocument(entry.document, cancellation);
        entry.disposeBackup();
    }
    async $onSave(resourceComponents, viewType, cancellation) {
        const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
        const provider = this.getCustomEditorProvider(viewType);
        await provider.saveCustomDocument(entry.document, cancellation);
        entry.disposeBackup();
    }
    async $onSaveAs(resourceComponents, viewType, targetResource, cancellation) {
        const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
        const provider = this.getCustomEditorProvider(viewType);
        return provider.saveCustomDocumentAs(entry.document, URI.revive(targetResource), cancellation);
    }
    async $backup(resourceComponents, viewType, cancellation) {
        const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
        const provider = this.getCustomEditorProvider(viewType);
        const backup = await provider.backupCustomDocument(entry.document, {
            destination: entry.getNewBackupUri(),
        }, cancellation);
        entry.updateBackup(backup);
        return backup.id;
    }
    getCustomDocumentEntry(viewType, resource) {
        const entry = this._documents.get(viewType, URI.revive(resource));
        if (!entry) {
            throw new Error('No custom document found');
        }
        return entry;
    }
    getCustomEditorProvider(viewType) {
        const entry = this._editorProviders.get(viewType);
        const provider = entry?.provider;
        if (!provider || !isCustomEditorProviderWithEditingCapability(provider)) {
            throw new Error('Custom document is not editable');
        }
        return provider;
    }
}
function isCustomEditorProviderWithEditingCapability(provider) {
    return !!provider.onDidChangeCustomDocument;
}
function isCustomTextEditorProvider(provider) {
    return typeof provider.resolveCustomTextEditor === 'function';
}
function isEditEvent(e) {
    return typeof e.undo === 'function'
        && typeof e.redo === 'function';
}
function hashPath(resource) {
    const str = resource.scheme === Schemas.file || resource.scheme === Schemas.untitled ? resource.fsPath : resource.toString();
    return hash(str) + '';
}
