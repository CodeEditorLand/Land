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
var ChatEditingMultiDiffSourceResolver_1, ChatEditingTextModelContentProvider_1, ModifiedFileEntry_1;
import { Sequencer } from '../../../../base/common/async.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { BugIndicatingError } from '../../../../base/common/errors.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { ResourceSet } from '../../../../base/common/map.js';
import { derived, observableValue, ValueWithChangeEventFromObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { isCodeEditor, isDiffEditor } from '../../../../editor/browser/editorBrowser.js';
import { IBulkEditService } from '../../../../editor/browser/services/bulkEditService.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { createTextBufferFactoryFromSnapshot } from '../../../../editor/common/model/textModel.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { localize, localize2 } from '../../../../nls.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { EditorActivation } from '../../../../platform/editor/common/editor.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { bindContextKey } from '../../../../platform/observable/common/platformObservableUtils.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { DiffEditorInput } from '../../../common/editor/diffEditorInput.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { MultiDiffEditorInput } from '../../multiDiffEditor/browser/multiDiffEditorInput.js';
import { IMultiDiffSourceResolverService, MultiDiffEditorItem } from '../../multiDiffEditor/browser/multiDiffSourceResolverService.js';
import { ICodeMapperService } from '../common/chatCodeMapperService.js';
import { applyingChatEditsContextKey, CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME, chatEditingResourceContextKey, decidedChatEditingResourceContextKey, inChatEditingSessionContextKey } from '../common/chatEditingService.js';
import { IChatService } from '../common/chatService.js';
import { IChatWidgetService } from './chat.js';
let ChatEditingService = class ChatEditingService extends Disposable {
    get currentAutoApplyOperation() {
        return this._currentAutoApplyOperationObs.get();
    }
    get currentEditingSession() {
        return this._currentSessionObs.get();
    }
    get onDidCreateEditingSession() {
        return this._onDidCreateEditingSession.event;
    }
    constructor(_editorGroupsService, _instantiationService, multiDiffSourceResolverService, textModelService, contextKeyService, _chatService, _progressService, _codeMapperService, _editorService) {
        super();
        this._editorGroupsService = _editorGroupsService;
        this._instantiationService = _instantiationService;
        this._chatService = _chatService;
        this._progressService = _progressService;
        this._codeMapperService = _codeMapperService;
        this._editorService = _editorService;
        this._currentSessionObs = observableValue(this, null);
        this._currentSessionDisposables = this._register(new DisposableStore());
        this._currentAutoApplyOperationObs = observableValue(this, null);
        this._onDidCreateEditingSession = this._register(new Emitter());
        this._onDidChangeEditingSession = this._register(new Emitter());
        this.onDidChangeEditingSession = this._onDidChangeEditingSession.event;
        this._register(multiDiffSourceResolverService.registerResolver(_instantiationService.createInstance(ChatEditingMultiDiffSourceResolver, this._currentSessionObs)));
        textModelService.registerTextModelContentProvider(ChatEditingTextModelContentProvider.scheme, _instantiationService.createInstance(ChatEditingTextModelContentProvider, this._currentSessionObs));
        this._register(bindContextKey(decidedChatEditingResourceContextKey, contextKeyService, (reader) => {
            const currentSession = this._currentSessionObs.read(reader);
            if (!currentSession) {
                return;
            }
            const entries = currentSession.entries.read(reader);
            const decidedEntries = entries.filter(entry => entry.state.read(reader) !== 0 /* WorkingSetEntryState.Modified */);
            return decidedEntries.map(entry => entry.entryId);
        }));
        this._register(bindContextKey(inChatEditingSessionContextKey, contextKeyService, (reader) => {
            return this._currentSessionObs.read(reader) !== null;
        }));
        this._register(bindContextKey(applyingChatEditsContextKey, contextKeyService, (reader) => {
            return this._currentAutoApplyOperationObs.read(reader) !== null;
        }));
        this._register(this._chatService.onDidDisposeSession((e) => {
            if (e.reason === 'cleared' && this._currentSessionObs.get()?.chatSessionId === e.sessionId) {
                void this._currentSessionObs.get()?.stop();
            }
        }));
    }
    getEditingSession(resource) {
        const session = this.currentEditingSession;
        if (!session) {
            return null;
        }
        const entries = session.entries.get();
        for (const entry of entries) {
            if (entry.modifiedURI.toString() === resource.toString()) {
                return session;
            }
        }
        return null;
    }
    async addFileToWorkingSet(resource) {
        const session = this._currentSessionObs.get();
        if (session) {
            session.addFileToWorkingSet(resource);
        }
    }
    dispose() {
        this._currentSessionObs.get()?.dispose();
        super.dispose();
    }
    async startOrContinueEditingSession(chatSessionId, options) {
        const session = this._currentSessionObs.get();
        if (session) {
            if (session.chatSessionId !== chatSessionId) {
                throw new BugIndicatingError('Cannot start new session while another session is active');
            }
        }
        return this._createEditingSession(chatSessionId, options);
    }
    async _createEditingSession(chatSessionId, options) {
        if (this._currentSessionObs.get()) {
            throw new BugIndicatingError('Cannot have more than one active editing session');
        }
        this._currentSessionDisposables.clear();
        // listen for completed responses, run the code mapper and apply the edits to this edit session
        this._currentSessionDisposables.add(this.installAutoApplyObserver(chatSessionId));
        const input = MultiDiffEditorInput.fromResourceMultiDiffEditorInput({
            multiDiffSource: ChatEditingMultiDiffSourceResolver.getMultiDiffSourceUri(),
            label: localize('multiDiffEditorInput.name', "Suggested Edits")
        }, this._instantiationService);
        const editorPane = options?.silent ? undefined : await this._editorGroupsService.activeGroup.openEditor(input, { pinned: true, activation: EditorActivation.ACTIVATE });
        const session = this._instantiationService.createInstance(ChatEditingSession, chatSessionId, editorPane);
        this._currentSessionDisposables.add(session.onDidDispose(() => {
            this._currentSessionDisposables.clear();
            this._currentSessionObs.set(null, undefined);
            this._onDidChangeEditingSession.fire();
        }));
        this._currentSessionDisposables.add(session.onDidChange(() => {
            this._onDidChangeEditingSession.fire();
        }));
        this._currentSessionObs.set(session, undefined);
        this._onDidCreateEditingSession.fire(session);
        this._onDidChangeEditingSession.fire();
        return session;
    }
    triggerEditComputation(responseModel) {
        return this._continueEditingSession(async (builder, token) => {
            const codeMapperResponse = {
                textEdit: (resource, edits) => builder.textEdits(resource, edits, responseModel),
            };
            await this._codeMapperService.mapCodeFromResponse(responseModel, codeMapperResponse, token);
        }, { silent: true });
    }
    installAutoApplyObserver(sessionId) {
        const chatModel = this._chatService.getSession(sessionId);
        if (!chatModel) {
            throw new Error(`Edit session was created for a non-existing chat session: ${sessionId}`);
        }
        const observerDisposables = new DisposableStore();
        const onResponseComplete = (responseModel) => {
            if (responseModel.result?.metadata?.autoApplyEdits) {
                this.triggerEditComputation(responseModel);
            }
        };
        const openCodeBlockUris = (responseModel) => {
            for (const part of responseModel.response.value) {
                if (part.kind === 'codeblockUri') {
                    this._editorService.openEditor({ resource: part.uri, options: { inactive: true, preserveFocus: true, pinned: true } });
                }
            }
        };
        observerDisposables.add(chatModel.onDidChange(e => {
            if (e.kind === 'addRequest') {
                const responseModel = e.request.response;
                if (responseModel) {
                    if (responseModel.isComplete) {
                        openCodeBlockUris(responseModel);
                        onResponseComplete(responseModel);
                    }
                    else {
                        const disposable = responseModel.onDidChange(() => {
                            openCodeBlockUris(responseModel);
                            if (responseModel.isComplete) {
                                onResponseComplete(responseModel);
                                disposable.dispose();
                            }
                            else if (responseModel.isCanceled || responseModel.isStale) {
                                disposable.dispose();
                            }
                        });
                    }
                }
            }
        }));
        observerDisposables.add(chatModel.onDidDispose(() => observerDisposables.dispose()));
        return observerDisposables;
    }
    async _continueEditingSession(builder, options) {
        const session = this._currentSessionObs.get();
        if (!session) {
            throw new BugIndicatingError('Cannot continue missing session');
        }
        if (session.state.get() === 1 /* ChatEditingSessionState.StreamingEdits */) {
            throw new BugIndicatingError('Cannot continue session that is still streaming');
        }
        let editorPane;
        if (!options?.silent && session.isVisible) {
            const groupedEditors = this._findGroupedEditors();
            if (groupedEditors.length !== 1) {
                throw new Error(`Unexpected number of editors: ${groupedEditors.length}`);
            }
            const [group, editor] = groupedEditors[0];
            editorPane = await group.openEditor(editor, { pinned: true, activation: EditorActivation.ACTIVATE });
        }
        const stream = {
            textEdits: (resource, textEdits, responseModel) => {
                session.acceptTextEdits(resource, textEdits, responseModel);
            }
        };
        session.acceptStreamingEditsStart();
        const cancellationTokenSource = new CancellationTokenSource();
        this._currentAutoApplyOperationObs.set(cancellationTokenSource, undefined);
        try {
            if (editorPane) {
                await editorPane?.showWhile(builder(stream, cancellationTokenSource.token));
            }
            else {
                await this._progressService.withProgress({
                    location: 10 /* ProgressLocation.Window */,
                    title: localize2('chatEditing.startingSession', 'Generating edits...').value,
                }, async () => {
                    await builder(stream, cancellationTokenSource.token);
                }, () => cancellationTokenSource.cancel());
            }
        }
        finally {
            cancellationTokenSource.dispose();
            this._currentAutoApplyOperationObs.set(null, undefined);
            session.resolve();
        }
    }
    _findGroupedEditors() {
        const editors = [];
        for (const group of this._editorGroupsService.groups) {
            for (const editor of group.editors) {
                if (editor.resource?.scheme === ChatEditingMultiDiffSourceResolver.scheme) {
                    editors.push([group, editor]);
                }
            }
        }
        return editors;
    }
};
ChatEditingService = __decorate([
    __param(0, IEditorGroupsService),
    __param(1, IInstantiationService),
    __param(2, IMultiDiffSourceResolverService),
    __param(3, ITextModelService),
    __param(4, IContextKeyService),
    __param(5, IChatService),
    __param(6, IProgressService),
    __param(7, ICodeMapperService),
    __param(8, IEditorService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ChatEditingService);
export { ChatEditingService };
let ChatEditingMultiDiffSourceResolver = class ChatEditingMultiDiffSourceResolver {
    static { ChatEditingMultiDiffSourceResolver_1 = this; }
    static { this.scheme = CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME; }
    static getMultiDiffSourceUri() {
        return URI.from({
            scheme: ChatEditingMultiDiffSourceResolver_1.scheme,
            path: '',
        });
    }
    constructor(_currentSession, _instantiationService) {
        this._currentSession = _currentSession;
        this._instantiationService = _instantiationService;
    }
    canHandleUri(uri) {
        return uri.scheme === ChatEditingMultiDiffSourceResolver_1.scheme;
    }
    async resolveDiffSource(uri) {
        return this._instantiationService.createInstance(ChatEditingMultiDiffSource, this._currentSession);
    }
};
ChatEditingMultiDiffSourceResolver = ChatEditingMultiDiffSourceResolver_1 = __decorate([
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object])
], ChatEditingMultiDiffSourceResolver);
class ChatEditingMultiDiffSource {
    constructor(_currentSession) {
        this._currentSession = _currentSession;
        this._resources = derived(this, (reader) => {
            const currentSession = this._currentSession.read(reader);
            if (!currentSession) {
                return [];
            }
            const entries = currentSession.entries.read(reader);
            return entries.map((entry) => {
                return new MultiDiffEditorItem(entry.originalURI, entry.modifiedURI, undefined, {
                    [chatEditingResourceContextKey.key]: entry.entryId,
                    // [inChatEditingSessionContextKey.key]: true
                });
            });
        });
        this.resources = new ValueWithChangeEventFromObservable(this._resources);
        this.contextKeys = {
            [inChatEditingSessionContextKey.key]: true
        };
    }
}
let ChatEditingTextModelContentProvider = class ChatEditingTextModelContentProvider {
    static { ChatEditingTextModelContentProvider_1 = this; }
    static { this.scheme = 'chat-editing-text-model'; }
    static getEmptyFileURI() {
        return URI.from({
            scheme: ChatEditingTextModelContentProvider_1.scheme,
            query: JSON.stringify({ kind: 'empty' }),
        });
    }
    static getFileURI(documentId, path) {
        return URI.from({
            scheme: ChatEditingTextModelContentProvider_1.scheme,
            path,
            query: JSON.stringify({ kind: 'doc', documentId }),
        });
    }
    constructor(_currentSessionObs, _modelService) {
        this._currentSessionObs = _currentSessionObs;
        this._modelService = _modelService;
    }
    async provideTextContent(resource) {
        const existing = this._modelService.getModel(resource);
        if (existing && !existing.isDisposed()) {
            return existing;
        }
        const data = JSON.parse(resource.query);
        if (data.kind === 'empty') {
            return this._modelService.createModel('', null, resource, false);
        }
        const session = this._currentSessionObs.get();
        if (!session) {
            return null;
        }
        return session.getVirtualModel(data.documentId);
    }
};
ChatEditingTextModelContentProvider = ChatEditingTextModelContentProvider_1 = __decorate([
    __param(1, IModelService),
    __metadata("design:paramtypes", [Object, Object])
], ChatEditingTextModelContentProvider);
let ChatEditingSession = class ChatEditingSession extends Disposable {
    get entries() {
        this._assertNotDisposed();
        return this._entriesObs;
    }
    get workingSet() {
        this._assertNotDisposed();
        return this._workingSetObs;
    }
    get state() {
        this._assertNotDisposed();
        return this._state;
    }
    get onDidChange() {
        this._assertNotDisposed();
        return this._onDidChange.event;
    }
    get onDidDispose() {
        this._assertNotDisposed();
        return this._onDidDispose.event;
    }
    get isVisible() {
        this._assertNotDisposed();
        return Boolean(this.editorPane && this.editorPane.isVisible());
    }
    constructor(chatSessionId, editorPane, _instantiationService, _textModelService, _bulkEditService, _editorGroupsService, _editorService, chatWidgetService) {
        super();
        this.chatSessionId = chatSessionId;
        this.editorPane = editorPane;
        this._instantiationService = _instantiationService;
        this._textModelService = _textModelService;
        this._bulkEditService = _bulkEditService;
        this._editorGroupsService = _editorGroupsService;
        this._editorService = _editorService;
        this._state = observableValue(this, 0 /* ChatEditingSessionState.Initial */);
        this._entriesObs = observableValue(this, []);
        this._sequencer = new Sequencer();
        this._entries = [];
        this._workingSetObs = observableValue(this, []);
        this._workingSet = new ResourceSet();
        this._onDidChange = new Emitter();
        this._onDidDispose = new Emitter();
        // Add the currently active editor to the working set
        const widget = chatWidgetService.getWidgetBySessionId(chatSessionId);
        let activeEditorControl = this._editorService.activeTextEditorControl;
        if (activeEditorControl) {
            if (isDiffEditor(activeEditorControl)) {
                activeEditorControl = activeEditorControl.getOriginalEditor().hasTextFocus() ? activeEditorControl.getOriginalEditor() : activeEditorControl.getModifiedEditor();
            }
            if (isCodeEditor(activeEditorControl) && activeEditorControl.hasModel()) {
                const uri = activeEditorControl.getModel().uri;
                this._workingSet.add(uri);
                widget?.attachmentModel.addFile(uri);
                this._workingSetObs.set([...this._workingSet.values()], undefined);
            }
        }
    }
    remove(...uris) {
        this._assertNotDisposed();
        let didRemoveUris = false;
        for (const uri of uris) {
            didRemoveUris = didRemoveUris || this._workingSet.delete(uri);
        }
        if (!didRemoveUris) {
            return; // noop
        }
        this._workingSetObs.set([...this._workingSet.values()], undefined);
        this._onDidChange.fire();
    }
    _assertNotDisposed() {
        if (this._state.get() === 3 /* ChatEditingSessionState.Disposed */) {
            throw new BugIndicatingError(`Cannot access a disposed editing session`);
        }
    }
    async accept(...uris) {
        this._assertNotDisposed();
        if (uris.length === 0) {
            await Promise.all(this._entries.map(entry => entry.accept(undefined)));
        }
        for (const uri of uris) {
            const entry = this._entries.find(e => e.modifiedURI.toString() === uri.toString());
            if (entry) {
                await entry.accept(undefined);
            }
        }
        this._onDidChange.fire();
    }
    async reject(...uris) {
        this._assertNotDisposed();
        if (uris.length === 0) {
            await Promise.all(this._entries.map(entry => entry.reject(undefined)));
        }
        for (const uri of uris) {
            const entry = this._entries.find(e => e.modifiedURI.toString() === uri.toString());
            if (entry) {
                await entry.reject(undefined);
            }
        }
        this._onDidChange.fire();
    }
    async show() {
        this._assertNotDisposed();
        if (this.editorPane?.isVisible()) {
            return;
        }
        else if (this.editorPane?.input) {
            await this._editorGroupsService.activeGroup.openEditor(this.editorPane.input, { pinned: true, activation: EditorActivation.ACTIVATE });
            return;
        }
        const input = MultiDiffEditorInput.fromResourceMultiDiffEditorInput({
            multiDiffSource: ChatEditingMultiDiffSourceResolver.getMultiDiffSourceUri(),
            label: localize('multiDiffEditorInput.name', "Suggested Edits")
        }, this._instantiationService);
        const editorPane = await this._editorGroupsService.activeGroup.openEditor(input, { pinned: true, activation: EditorActivation.ACTIVATE });
        this.editorPane = editorPane;
    }
    async stop() {
        this._assertNotDisposed();
        // Close out all open files
        await Promise.allSettled(this._editorGroupsService.groups.map(async (g) => {
            return Promise.allSettled(g.editors.map(async (e) => {
                if (e instanceof MultiDiffEditorInput || e instanceof DiffEditorInput && (e.original.resource?.scheme === ModifiedFileEntry.scheme || e.original.resource?.scheme === ChatEditingTextModelContentProvider.scheme)) {
                    await g.closeEditor(e);
                }
            }));
        }));
        if (this._state.get() !== 3 /* ChatEditingSessionState.Disposed */) {
            // session got disposed while we were closing editors
            this.dispose();
        }
    }
    dispose() {
        this._assertNotDisposed();
        super.dispose();
        this._state.set(3 /* ChatEditingSessionState.Disposed */, undefined);
        this._onDidDispose.fire();
    }
    getVirtualModel(documentId) {
        this._assertNotDisposed();
        const entry = this._entries.find(e => e.entryId === documentId);
        return entry?.docSnapshot ?? null;
    }
    acceptStreamingEditsStart() {
        if (this._state.get() === 3 /* ChatEditingSessionState.Disposed */) {
            // we don't throw in this case because there could be a builder still connected to a disposed session
            return;
        }
        // ensure that the edits are processed sequentially
        this._sequencer.queue(() => this._acceptStreamingEditsStart());
    }
    acceptTextEdits(resource, textEdits, responseModel) {
        if (this._state.get() === 3 /* ChatEditingSessionState.Disposed */) {
            // we don't throw in this case because there could be a builder still connected to a disposed session
            return;
        }
        // ensure that the edits are processed sequentially
        this._sequencer.queue(() => this._acceptTextEdits(resource, textEdits, responseModel));
    }
    resolve() {
        if (this._state.get() === 3 /* ChatEditingSessionState.Disposed */) {
            // we don't throw in this case because there could be a builder still connected to a disposed session
            return;
        }
        // ensure that the edits are processed sequentially
        this._sequencer.queue(() => this._resolve());
    }
    addFileToWorkingSet(resource) {
        if (!this._workingSet.has(resource)) {
            this._workingSet.add(resource);
            this._workingSetObs.set([...this._workingSet.values()], undefined);
            this._onDidChange.fire();
        }
    }
    async _acceptStreamingEditsStart() {
        this._state.set(1 /* ChatEditingSessionState.StreamingEdits */, undefined);
        this._onDidChange.fire();
    }
    async _acceptTextEdits(resource, textEdits, responseModel) {
        const entry = await this._getOrCreateModifiedFileEntry(resource, responseModel);
        entry.applyEdits(textEdits);
        await this._editorService.openEditor({ resource: entry.modifiedURI, options: { inactive: true } });
    }
    async _resolve() {
        this._state.set(2 /* ChatEditingSessionState.Idle */, undefined);
        this._onDidChange.fire();
    }
    async _getOrCreateModifiedFileEntry(resource, responseModel) {
        const existingEntry = this._entries.find(e => e.resource.toString() === resource.toString());
        if (existingEntry) {
            return existingEntry;
        }
        const entry = await this._createModifiedFileEntry(resource, responseModel);
        this._register(entry);
        this._entries = [...this._entries, entry];
        this._entriesObs.set(this._entries, undefined);
        this._onDidChange.fire();
        return entry;
    }
    async _createModifiedFileEntry(resource, responseModel, mustExist = false) {
        try {
            const ref = await this._textModelService.createModelReference(resource);
            return this._instantiationService.createInstance(ModifiedFileEntry, resource, ref, { collapse: (transaction) => this._collapse(resource, transaction) }, responseModel);
        }
        catch (err) {
            if (mustExist) {
                throw err;
            }
            // this file does not exist yet, create it and try again
            await this._bulkEditService.apply({ edits: [{ newResource: resource }] });
            return this._createModifiedFileEntry(resource, responseModel, true);
        }
    }
    _collapse(resource, transaction) {
        const multiDiffItem = this.editorPane?.findDocumentDiffItem(resource);
        if (multiDiffItem) {
            this.editorPane?.viewModel?.items.get().find((documentDiffItem) => String(documentDiffItem.originalUri) === String(multiDiffItem.originalUri) && String(documentDiffItem.modifiedUri) === String(multiDiffItem.modifiedUri))?.collapsed.set(true, transaction);
        }
    }
};
ChatEditingSession = __decorate([
    __param(2, IInstantiationService),
    __param(3, ITextModelService),
    __param(4, IBulkEditService),
    __param(5, IEditorGroupsService),
    __param(6, IEditorService),
    __param(7, IChatWidgetService),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, Object, Object, Object])
], ChatEditingSession);
let ModifiedFileEntry = class ModifiedFileEntry extends Disposable {
    static { ModifiedFileEntry_1 = this; }
    static { this.scheme = 'modified-file-entry'; }
    static { this.lastEntryId = 0; }
    get originalURI() {
        return this.docSnapshot.uri;
    }
    get originalModel() {
        return this.docSnapshot;
    }
    get modifiedURI() {
        return this.doc.uri;
    }
    get state() {
        return this._stateObs;
    }
    constructor(resource, resourceRef, _multiDiffEntryDelegate, _responseModel, modelService, textModelService, languageService, bulkEditService, _chatService) {
        super();
        this.resource = resource;
        this._multiDiffEntryDelegate = _multiDiffEntryDelegate;
        this._responseModel = _responseModel;
        this.bulkEditService = bulkEditService;
        this._chatService = _chatService;
        this.entryId = `${ModifiedFileEntry_1.scheme}::${++ModifiedFileEntry_1.lastEntryId}`;
        this._stateObs = observableValue(this, 0 /* WorkingSetEntryState.Modified */);
        this.doc = resourceRef.object.textEditorModel;
        const docSnapshot = this.docSnapshot = this._register(modelService.createModel(createTextBufferFactoryFromSnapshot(this.doc.createSnapshot()), languageService.createById(this.doc.getLanguageId()), ChatEditingTextModelContentProvider.getFileURI(this.entryId, resource.path), false));
        // Create a reference to this model to avoid it being disposed from under our nose
        (async () => {
            // TODO: dispose manually if the outer object was disposed in the meantime
            this._register(await textModelService.createModelReference(docSnapshot.uri));
        })();
        this._register(resourceRef);
    }
    applyEdits(textEdits) {
        this.doc.applyEdits(textEdits);
        this._stateObs.set(0 /* WorkingSetEntryState.Modified */, undefined);
    }
    async accept(transaction) {
        if (this._stateObs.get() !== 0 /* WorkingSetEntryState.Modified */) {
            // already accepted or rejected
            return;
        }
        this.docSnapshot.setValue(this.doc.createSnapshot());
        this._stateObs.set(1 /* WorkingSetEntryState.Accepted */, transaction);
        await this.collapse(transaction);
        this._notifyAction('accepted');
    }
    async reject(transaction) {
        if (this._stateObs.get() !== 0 /* WorkingSetEntryState.Modified */) {
            // already accepted or rejected
            return;
        }
        this.doc.setValue(this.docSnapshot.createSnapshot());
        this._stateObs.set(2 /* WorkingSetEntryState.Rejected */, transaction);
        await this.collapse(transaction);
        this._notifyAction('rejected');
    }
    async collapse(transaction) {
        this._multiDiffEntryDelegate.collapse(transaction);
    }
    _notifyAction(outcome) {
        this._chatService.notifyUserAction({
            action: { kind: 'chatEditingSessionAction', uri: this.resource, hasRemainingEdits: false, outcome },
            agentId: this._responseModel.agent?.id,
            command: this._responseModel.slashCommand?.name,
            sessionId: this._responseModel.session.sessionId,
            requestId: this._responseModel.requestId,
            result: this._responseModel.result
        });
    }
};
ModifiedFileEntry = ModifiedFileEntry_1 = __decorate([
    __param(4, IModelService),
    __param(5, ITextModelService),
    __param(6, ILanguageService),
    __param(7, IBulkEditService),
    __param(8, IChatService),
    __metadata("design:paramtypes", [URI, Object, Object, Object, Object, Object, Object, Object, Object])
], ModifiedFileEntry);
