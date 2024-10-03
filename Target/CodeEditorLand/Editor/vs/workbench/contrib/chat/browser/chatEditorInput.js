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
var ChatEditorInput_1;
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../base/common/network.js';
import { URI } from '../../../../base/common/uri.js';
import * as nls from '../../../../nls.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { ChatAgentLocation } from '../common/chatAgents.js';
import { IChatService } from '../common/chatService.js';
const ChatEditorIcon = registerIcon('chat-editor-label-icon', Codicon.commentDiscussion, nls.localize('chatEditorLabelIcon', 'Icon of the chat editor label.'));
let ChatEditorInput = class ChatEditorInput extends EditorInput {
    static { ChatEditorInput_1 = this; }
    static { this.countsInUse = new Set(); }
    static { this.TypeID = 'workbench.input.chatSession'; }
    static { this.EditorID = 'workbench.editor.chatSession'; }
    static getNewEditorUri() {
        const handle = Math.floor(Math.random() * 1e9);
        return ChatUri.generate(handle);
    }
    static getNextCount() {
        let count = 0;
        while (ChatEditorInput_1.countsInUse.has(count)) {
            count++;
        }
        return count;
    }
    constructor(resource, options, chatService) {
        super();
        this.resource = resource;
        this.options = options;
        this.chatService = chatService;
        const parsed = ChatUri.parse(resource);
        if (typeof parsed?.handle !== 'number') {
            throw new Error('Invalid chat URI');
        }
        this.sessionId = (options.target && 'sessionId' in options.target) ?
            options.target.sessionId :
            undefined;
        this.inputCount = ChatEditorInput_1.getNextCount();
        ChatEditorInput_1.countsInUse.add(this.inputCount);
        this._register(toDisposable(() => ChatEditorInput_1.countsInUse.delete(this.inputCount)));
    }
    get editorId() {
        return ChatEditorInput_1.EditorID;
    }
    get capabilities() {
        return super.capabilities | 8;
    }
    matches(otherInput) {
        return otherInput instanceof ChatEditorInput_1 && otherInput.resource.toString() === this.resource.toString();
    }
    get typeId() {
        return ChatEditorInput_1.TypeID;
    }
    getName() {
        return this.model?.title || nls.localize('chatEditorName', "Chat") + (this.inputCount > 0 ? ` ${this.inputCount + 1}` : '');
    }
    getIcon() {
        return ChatEditorIcon;
    }
    async resolve() {
        if (typeof this.sessionId === 'string') {
            this.model = this.chatService.getOrRestoreSession(this.sessionId);
        }
        else if (!this.options.target) {
            this.model = this.chatService.startSession(ChatAgentLocation.Panel, CancellationToken.None);
        }
        else if ('data' in this.options.target) {
            this.model = this.chatService.loadSessionFromContent(this.options.target.data);
        }
        if (!this.model) {
            return null;
        }
        this.sessionId = this.model.sessionId;
        this._register(this.model.onDidChange(() => this._onDidChangeLabel.fire()));
        return this._register(new ChatEditorModel(this.model));
    }
    dispose() {
        super.dispose();
        if (this.sessionId) {
            this.chatService.clearSession(this.sessionId);
        }
    }
};
ChatEditorInput = ChatEditorInput_1 = __decorate([
    __param(2, IChatService),
    __metadata("design:paramtypes", [URI, Object, Object])
], ChatEditorInput);
export { ChatEditorInput };
export class ChatEditorModel extends Disposable {
    constructor(model) {
        super();
        this.model = model;
        this._onWillDispose = this._register(new Emitter());
        this.onWillDispose = this._onWillDispose.event;
        this._isDisposed = false;
        this._isResolved = false;
    }
    async resolve() {
        this._isResolved = true;
    }
    isResolved() {
        return this._isResolved;
    }
    isDisposed() {
        return this._isDisposed;
    }
    dispose() {
        super.dispose();
        this._isDisposed = true;
    }
}
export var ChatUri;
(function (ChatUri) {
    ChatUri.scheme = Schemas.vscodeChatSesssion;
    function generate(handle) {
        return URI.from({ scheme: ChatUri.scheme, path: `chat-${handle}` });
    }
    ChatUri.generate = generate;
    function parse(resource) {
        if (resource.scheme !== ChatUri.scheme) {
            return undefined;
        }
        const match = resource.path.match(/chat-(\d+)/);
        const handleStr = match?.[1];
        if (typeof handleStr !== 'string') {
            return undefined;
        }
        const handle = parseInt(handleStr);
        if (isNaN(handle)) {
            return undefined;
        }
        return { handle };
    }
    ChatUri.parse = parse;
})(ChatUri || (ChatUri = {}));
export class ChatEditorInputSerializer {
    canSerialize(input) {
        return input instanceof ChatEditorInput && typeof input.sessionId === 'string';
    }
    serialize(input) {
        if (!this.canSerialize(input)) {
            return undefined;
        }
        const obj = {
            options: input.options,
            sessionId: input.sessionId,
            resource: input.resource
        };
        return JSON.stringify(obj);
    }
    deserialize(instantiationService, serializedEditor) {
        try {
            const parsed = JSON.parse(serializedEditor);
            const resource = URI.revive(parsed.resource);
            return instantiationService.createInstance(ChatEditorInput, resource, { ...parsed.options, target: { sessionId: parsed.sessionId } });
        }
        catch (err) {
            return undefined;
        }
    }
}
