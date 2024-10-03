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
import { Codicon } from '../../../../base/common/codicons.js';
import { BugIndicatingError } from '../../../../base/common/errors.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { derived, observableValue, ValueWithChangeEventFromObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { IBulkEditService } from '../../../../editor/browser/services/bulkEditService.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { createTextBufferFactoryFromSnapshot } from '../../../../editor/common/model/textModel.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
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
import { IChatEditingService } from '../common/chatEditingService.js';
import { IChatService } from '../common/chatService.js';
import { IChatWidgetService } from './chat.js';
const decidedChatEditingResourceContextKey = new RawContextKey('decidedChatEditingResource', []);
const chatEditingResourceContextKey = new RawContextKey('chatEditingResource', undefined);
const inChatEditingSessionContextKey = new RawContextKey('inChatEditingSession', undefined);
let ChatEditingService = class ChatEditingService extends Disposable {
    get currentEditingSession() {
        return this._currentSessionObs.get();
    }
    get onDidCreateEditingSession() {
        return this._onDidCreateEditingSession.event;
    }
    constructor(_editorGroupsService, _instantiationService, multiDiffSourceResolverService, textModelService, contextKeyService, _chatService, _progressService, _codeMapperService) {
        super();
        this._editorGroupsService = _editorGroupsService;
        this._instantiationService = _instantiationService;
        this._chatService = _chatService;
        this._progressService = _progressService;
        this._codeMapperService = _codeMapperService;
        this._currentSessionObs = observableValue(this, null);
        this._currentSessionDisposeListener = this._register(new MutableDisposable());
        this._onDidCreateEditingSession = new Emitter();
        this._register(multiDiffSourceResolverService.registerResolver(_instantiationService.createInstance(ChatEditingMultiDiffSourceResolver, this._currentSessionObs)));
        textModelService.registerTextModelContentProvider(ChatEditingTextModelContentProvider.scheme, _instantiationService.createInstance(ChatEditingTextModelContentProvider, this._currentSessionObs));
        this._register(bindContextKey(decidedChatEditingResourceContextKey, contextKeyService, (reader) => {
            const currentSession = this._currentSessionObs.read(reader);
            if (!currentSession) {
                return;
            }
            const entries = currentSession.entries.read(reader);
            const decidedEntries = entries.filter(entry => entry.state.read(reader) !== 0);
            return decidedEntries.map(entry => entry.entryId);
        }));
        this._register(this._chatService.onDidDisposeSession((e) => {
            if (e.reason === 'cleared' && this._currentSessionObs.get()?.chatSessionId === e.sessionId) {
                void this._currentSessionObs.get()?.stop();
            }
        }));
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
        this._register(this.installAutoApplyObserver(chatSessionId));
        const input = MultiDiffEditorInput.fromResourceMultiDiffEditorInput({
            multiDiffSource: ChatEditingMultiDiffSourceResolver.getMultiDiffSourceUri(),
            label: localize('multiDiffEditorInput.name', "Suggested Edits")
        }, this._instantiationService);
        const editorPane = options?.silent ? undefined : await this._editorGroupsService.activeGroup.openEditor(input, { pinned: true, activation: EditorActivation.ACTIVATE });
        const session = this._instantiationService.createInstance(ChatEditingSession, chatSessionId, editorPane);
        this._currentSessionDisposeListener.value = session.onDidDispose(() => {
            this._currentSessionDisposeListener.clear();
            this._currentSessionObs.set(null, undefined);
        });
        this._currentSessionObs.set(session, undefined);
        this._onDidCreateEditingSession.fire(session);
        return session;
    }
    triggerEditComputation(responseModel) {
        return this._continueEditingSession(async (builder, token) => {
            const codeMapperResponse = {
                textEdit: (resource, edits) => builder.textEdits(resource, edits),
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
        observerDisposables.add(chatModel.onDidChange(e => {
            if (e.kind === 'addRequest') {
                const responseModel = e.request.response;
                if (responseModel) {
                    if (responseModel.isComplete) {
                        onResponseComplete(responseModel);
                    }
                    else {
                        const disposable = responseModel.onDidChange(() => {
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
        if (session.state.get() === 1) {
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
            textEdits: (resource, textEdits) => {
                session.acceptTextEdits(resource, textEdits);
            }
        };
        session.acceptStreamingEditsStart();
        const cancellationTokenSource = new CancellationTokenSource();
        try {
            if (editorPane) {
                await editorPane?.showWhile(builder(stream, cancellationTokenSource.token));
            }
            else {
                await this._progressService.withProgress({
                    location: 10,
                    title: localize2('chatEditing.startingSession', 'Generating edits...').value,
                }, async () => {
                    await builder(stream, cancellationTokenSource.token);
                }, () => cancellationTokenSource.cancel());
            }
        }
        finally {
            cancellationTokenSource.dispose();
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
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], ChatEditingService);
export { ChatEditingService };
let ChatEditingMultiDiffSourceResolver = class ChatEditingMultiDiffSourceResolver {
    static { ChatEditingMultiDiffSourceResolver_1 = this; }
    static { this.scheme = 'chat-editing-multi-diff-source'; }
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
                });
            });
        });
        this.resources = new ValueWithChangeEventFromObservable(this._resources);
        this.contextKeys = {
            [inChatEditingSessionContextKey.key]: true
        };
    }
}
registerAction2(class OpenFileAction extends Action2 {
    constructor() {
        super({
            id: 'chatEditing.openFile',
            title: localize2('open.file', 'Open File'),
            icon: Codicon.goToFile,
            menu: [{
                    id: MenuId.ChatEditingSessionWidgetToolbar,
                    order: 0,
                    group: 'navigation'
                }],
        });
    }
    async run(accessor, ...args) {
        const chatEditingService = accessor.get(IChatEditingService);
        const editorService = accessor.get(IEditorService);
        const currentEditingSession = chatEditingService.currentEditingSession;
        if (!currentEditingSession) {
            return;
        }
        const chatWidget = accessor.get(IChatWidgetService).lastFocusedWidget;
        const uris = [];
        if (URI.isUri(args[0])) {
            uris.push(args[0]);
        }
        else if (chatWidget) {
            uris.push(...chatWidget.input.selectedElements);
        }
        if (!uris.length) {
            return;
        }
        await Promise.all(uris.map((uri) => editorService.openEditor({ resource: uri, options: { pinned: true, activation: EditorActivation.ACTIVATE } })));
    }
});
registerAction2(class AcceptAction extends Action2 {
    constructor() {
        super({
            id: 'chatEditing.acceptFile',
            title: localize2('accept.file', 'Accept'),
            icon: Codicon.check,
            menu: [{
                    when: ContextKeyExpr.and(ContextKeyExpr.equals('resourceScheme', ChatEditingMultiDiffSourceResolver.scheme), ContextKeyExpr.notIn(chatEditingResourceContextKey.key, decidedChatEditingResourceContextKey.key)),
                    id: MenuId.MultiDiffEditorFileToolbar,
                    order: 0,
                    group: 'navigation',
                }, {
                    id: MenuId.ChatEditingSessionWidgetToolbar,
                    order: 2,
                    group: 'navigation'
                }],
        });
    }
    async run(accessor, ...args) {
        const chatEditingService = accessor.get(IChatEditingService);
        const currentEditingSession = chatEditingService.currentEditingSession;
        if (!currentEditingSession) {
            return;
        }
        const chatWidget = accessor.get(IChatWidgetService).lastFocusedWidget;
        const uris = [];
        if (URI.isUri(args[0])) {
            uris.push(args[0]);
        }
        else if (chatWidget) {
            uris.push(...chatWidget.input.selectedElements);
        }
        if (!uris.length) {
            return;
        }
        await currentEditingSession.accept(...uris);
    }
});
registerAction2(class DiscardAction extends Action2 {
    constructor() {
        super({
            id: 'chatEditing.discardFile',
            title: localize2('discard.file', 'Discard'),
            icon: Codicon.discard,
            menu: [{
                    when: ContextKeyExpr.and(ContextKeyExpr.equals('resourceScheme', ChatEditingMultiDiffSourceResolver.scheme), ContextKeyExpr.notIn(chatEditingResourceContextKey.key, decidedChatEditingResourceContextKey.key)),
                    id: MenuId.MultiDiffEditorFileToolbar,
                    order: 0,
                    group: 'navigation',
                }, {
                    id: MenuId.ChatEditingSessionWidgetToolbar,
                    order: 1,
                    group: 'navigation'
                }],
        });
    }
    async run(accessor, ...args) {
        const chatEditingService = accessor.get(IChatEditingService);
        const currentEditingSession = chatEditingService.currentEditingSession;
        if (!currentEditingSession) {
            return;
        }
        const chatWidget = accessor.get(IChatWidgetService).lastFocusedWidget;
        const uris = [];
        if (URI.isUri(args[0])) {
            uris.push(args[0]);
        }
        else if (chatWidget) {
            uris.push(...chatWidget.input.selectedElements);
        }
        if (!uris.length) {
            return;
        }
        await currentEditingSession.reject(...uris);
    }
});
export class ChatEditingAcceptAllAction extends Action2 {
    static { this.ID = 'chatEditing.acceptAllFiles'; }
    static { this.LABEL = localize('accept.allFiles', 'Accept All'); }
    constructor() {
        super({
            id: ChatEditingAcceptAllAction.ID,
            title: ChatEditingAcceptAllAction.LABEL,
            menu: {
                when: ContextKeyExpr.equals('resourceScheme', ChatEditingMultiDiffSourceResolver.scheme),
                id: MenuId.EditorTitle,
                order: 0,
                group: 'navigation',
            },
        });
    }
    async run(accessor, ...args) {
        const chatEditingService = accessor.get(IChatEditingService);
        const currentEditingSession = chatEditingService.currentEditingSession;
        if (!currentEditingSession) {
            return;
        }
        await currentEditingSession.accept();
    }
}
registerAction2(ChatEditingAcceptAllAction);
export class ChatEditingDiscardAllAction extends Action2 {
    static { this.ID = 'chatEditing.discardAllFiles'; }
    static { this.LABEL = localize('discard.allFiles', 'Discard All'); }
    constructor() {
        super({
            id: ChatEditingDiscardAllAction.ID,
            title: ChatEditingDiscardAllAction.LABEL,
            menu: {
                when: ContextKeyExpr.equals('resourceScheme', ChatEditingMultiDiffSourceResolver.scheme),
                id: MenuId.EditorTitle,
                order: 0,
                group: 'navigation',
            },
        });
    }
    async run(accessor, ...args) {
        const chatEditingService = accessor.get(IChatEditingService);
        const currentEditingSession = chatEditingService.currentEditingSession;
        if (!currentEditingSession) {
            return;
        }
        await currentEditingSession.reject();
    }
}
registerAction2(ChatEditingDiscardAllAction);
export class ChatEditingShowChangesAction extends Action2 {
    static { this.ID = 'chatEditing.openDiffs'; }
    static { this.LABEL = localize('chatEditing.openDiffs', 'Open Diffs'); }
    constructor() {
        super({
            id: ChatEditingShowChangesAction.ID,
            title: ChatEditingShowChangesAction.LABEL,
            f1: false
        });
    }
    async run(accessor, ...args) {
        const chatEditingService = accessor.get(IChatEditingService);
        const currentEditingSession = chatEditingService.currentEditingSession;
        if (!currentEditingSession) {
            return;
        }
        await currentEditingSession.show();
    }
}
registerAction2(ChatEditingShowChangesAction);
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
    constructor(chatSessionId, editorPane, _instantiationService, _textModelService, _bulkEditService, _editorGroupsService, editorService) {
        super();
        this.chatSessionId = chatSessionId;
        this.editorPane = editorPane;
        this._instantiationService = _instantiationService;
        this._textModelService = _textModelService;
        this._bulkEditService = _bulkEditService;
        this._editorGroupsService = _editorGroupsService;
        this.editorService = editorService;
        this._state = observableValue(this, 0);
        this._entriesObs = observableValue(this, []);
        this._sequencer = new Sequencer();
        this._entries = [];
        this._workingSetObs = observableValue(this, []);
        this._workingSet = [];
        this._onDidChange = new Emitter();
        this._onDidDispose = new Emitter();
    }
    _assertNotDisposed() {
        if (this._state.get() === 3) {
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
        await Promise.allSettled(this._editorGroupsService.groups.map(async (g) => {
            return Promise.allSettled(g.editors.map(async (e) => {
                if (e instanceof MultiDiffEditorInput || e instanceof DiffEditorInput && (e.original.resource?.scheme === ModifiedFileEntry.scheme || e.original.resource?.scheme === ChatEditingTextModelContentProvider.scheme)) {
                    await g.closeEditor(e);
                }
            }));
        }));
        if (this._state.get() !== 3) {
            this.dispose();
        }
    }
    dispose() {
        this._assertNotDisposed();
        super.dispose();
        this._state.set(3, undefined);
        this._onDidDispose.fire();
    }
    getVirtualModel(documentId) {
        this._assertNotDisposed();
        const entry = this._entries.find(e => e.entryId === documentId);
        return entry?.docSnapshot ?? null;
    }
    acceptStreamingEditsStart() {
        if (this._state.get() === 3) {
            return;
        }
        this._sequencer.queue(() => this._acceptStreamingEditsStart());
    }
    acceptTextEdits(resource, textEdits) {
        if (this._state.get() === 3) {
            return;
        }
        this._sequencer.queue(() => this._acceptTextEdits(resource, textEdits));
    }
    resolve() {
        if (this._state.get() === 3) {
            return;
        }
        this._sequencer.queue(() => this._resolve());
    }
    addFileToWorkingSet(resource) {
        this._workingSet = [...this._workingSet, resource];
        this._workingSetObs.set(this._workingSet, undefined);
        this._onDidChange.fire();
    }
    async _acceptStreamingEditsStart() {
        this._state.set(1, undefined);
        this._onDidChange.fire();
    }
    async _acceptTextEdits(resource, textEdits) {
        const entry = await this._getOrCreateModifiedFileEntry(resource);
        entry.applyEdits(textEdits);
        await this.editorService.openEditor({ original: { resource: entry.originalURI }, modified: { resource: entry.modifiedURI }, options: { inactive: true } });
    }
    async _resolve() {
        this._state.set(2, undefined);
        this._onDidChange.fire();
    }
    async _getOrCreateModifiedFileEntry(resource) {
        const existingEntry = this._entries.find(e => e.resource.toString() === resource.toString());
        if (existingEntry) {
            return existingEntry;
        }
        const entry = await this._createModifiedFileEntry(resource);
        this._register(entry);
        this._entries = [...this._entries, entry];
        this._entriesObs.set(this._entries, undefined);
        this._onDidChange.fire();
        return entry;
    }
    async _createModifiedFileEntry(resource, mustExist = false) {
        try {
            const ref = await this._textModelService.createModelReference(resource);
            return this._instantiationService.createInstance(ModifiedFileEntry, resource, ref, { collapse: (transaction) => this._collapse(resource, transaction) });
        }
        catch (err) {
            if (mustExist) {
                throw err;
            }
            await this._bulkEditService.apply({ edits: [{ newResource: resource }] });
            return this._createModifiedFileEntry(resource, true);
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
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, Object, Object])
], ChatEditingSession);
let ModifiedFileEntry = class ModifiedFileEntry extends Disposable {
    static { ModifiedFileEntry_1 = this; }
    static { this.scheme = 'modified-file-entry'; }
    static { this.lastEntryId = 0; }
    get originalURI() {
        return this.docSnapshot.uri;
    }
    get modifiedURI() {
        return this.doc.uri;
    }
    get state() {
        return this._stateObs;
    }
    constructor(resource, resourceRef, _multiDiffEntryDelegate, modelService, languageService, _bulkEditService) {
        super();
        this.resource = resource;
        this._multiDiffEntryDelegate = _multiDiffEntryDelegate;
        this._bulkEditService = _bulkEditService;
        this.entryId = `${ModifiedFileEntry_1.scheme}::${++ModifiedFileEntry_1.lastEntryId}`;
        this._stateObs = observableValue(this, 0);
        this.doc = resourceRef.object.textEditorModel;
        this.docSnapshot = this._register(modelService.createModel(createTextBufferFactoryFromSnapshot(this.doc.createSnapshot()), languageService.createById(this.doc.getLanguageId()), ChatEditingTextModelContentProvider.getFileURI(this.entryId, resource.path), false));
        this._register(resourceRef);
    }
    applyEdits(textEdits) {
        this.doc.applyEdits(textEdits);
        this._stateObs.set(0, undefined);
    }
    async accept(transaction) {
        if (this._stateObs.get() !== 0) {
            return;
        }
        this.docSnapshot.setValue(this.doc.createSnapshot());
        this._stateObs.set(1, transaction);
        await this.collapse(transaction);
    }
    async reject(transaction) {
        if (this._stateObs.get() !== 0) {
            return;
        }
        this.doc.setValue(this.docSnapshot.createSnapshot());
        this._stateObs.set(2, transaction);
        await this.collapse(transaction);
    }
    async collapse(transaction) {
        this._multiDiffEntryDelegate.collapse(transaction);
    }
};
ModifiedFileEntry = ModifiedFileEntry_1 = __decorate([
    __param(3, IModelService),
    __param(4, ILanguageService),
    __param(5, IBulkEditService),
    __metadata("design:paramtypes", [URI, Object, Object, Object, Object, Object])
], ModifiedFileEntry);
