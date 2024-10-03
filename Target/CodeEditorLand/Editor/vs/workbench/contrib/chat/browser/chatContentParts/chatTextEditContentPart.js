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
import * as dom from '../../../../../base/browser/dom.js';
import { CancellationTokenSource } from '../../../../../base/common/cancellation.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { Disposable, RefCountedDisposable, toDisposable } from '../../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../../base/common/network.js';
import { isEqual } from '../../../../../base/common/resources.js';
import { assertType } from '../../../../../base/common/types.js';
import { URI } from '../../../../../base/common/uri.js';
import { generateUuid } from '../../../../../base/common/uuid.js';
import { TextEdit } from '../../../../../editor/common/languages.js';
import { createTextBufferFactoryFromSnapshot } from '../../../../../editor/common/model/textModel.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { DefaultModelSHA1Computer } from '../../../../../editor/common/services/modelService.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { localize } from '../../../../../nls.js';
import { MenuId } from '../../../../../platform/actions/common/actions.js';
import { registerSingleton } from '../../../../../platform/instantiation/common/extensions.js';
import { createDecorator, IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ResourcePool } from './chatCollections.js';
import { ChatEditorOptions } from '../chatOptions.js';
import { CodeCompareBlockPart } from '../codeBlockPart.js';
import { IChatService } from '../../common/chatService.js';
import { isResponseVM } from '../../common/chatViewModel.js';
const $ = dom.$;
const ICodeCompareModelService = createDecorator('ICodeCompareModelService');
let ChatTextEditContentPart = class ChatTextEditContentPart extends Disposable {
    constructor(chatTextEdit, context, rendererOptions, diffEditorPool, currentWidth, codeCompareModelService) {
        super();
        this.codeCompareModelService = codeCompareModelService;
        this._onDidChangeHeight = this._register(new Emitter());
        this.onDidChangeHeight = this._onDidChangeHeight.event;
        const element = context.element;
        assertType(isResponseVM(element));
        if (rendererOptions.renderTextEditsAsSummary?.(chatTextEdit.uri)) {
            if (element.response.value.every(item => item.kind === 'textEditGroup')) {
                this.domNode = $('.interactive-edits-summary', undefined, !element.isComplete
                    ? ''
                    : element.isCanceled
                        ? localize('edits0', "Making changes was aborted.")
                        : localize('editsSummary', "Made changes."));
            }
            else {
                this.domNode = $('div');
            }
        }
        else {
            const cts = new CancellationTokenSource();
            let isDisposed = false;
            this._register(toDisposable(() => {
                isDisposed = true;
                cts.dispose(true);
            }));
            this.comparePart = this._register(diffEditorPool.get());
            this._register(this.comparePart.object.onDidChangeContentHeight(() => {
                this._onDidChangeHeight.fire();
            }));
            const data = {
                element,
                edit: chatTextEdit,
                diffData: (async () => {
                    const ref = await this.codeCompareModelService.createModel(element, chatTextEdit);
                    if (isDisposed) {
                        ref.dispose();
                        return;
                    }
                    this._register(ref);
                    return {
                        modified: ref.object.modified.textEditorModel,
                        original: ref.object.original.textEditorModel,
                        originalSha1: ref.object.originalSha1
                    };
                })()
            };
            this.comparePart.object.render(data, currentWidth, cts.token);
            this.domNode = this.comparePart.object.element;
        }
    }
    layout(width) {
        this.comparePart?.object.layout(width);
    }
    hasSameContent(other) {
        return other.kind === 'textEditGroup';
    }
    addDisposable(disposable) {
        this._register(disposable);
    }
};
ChatTextEditContentPart = __decorate([
    __param(5, ICodeCompareModelService),
    __metadata("design:paramtypes", [Object, Object, Object, DiffEditorPool, Number, Object])
], ChatTextEditContentPart);
export { ChatTextEditContentPart };
let DiffEditorPool = class DiffEditorPool extends Disposable {
    inUse() {
        return this._pool.inUse;
    }
    constructor(options, delegate, overflowWidgetsDomNode, instantiationService) {
        super();
        this._pool = this._register(new ResourcePool(() => {
            return instantiationService.createInstance(CodeCompareBlockPart, options, MenuId.ChatCompareBlock, delegate, overflowWidgetsDomNode);
        }));
    }
    get() {
        const codeBlock = this._pool.get();
        let stale = false;
        return {
            object: codeBlock,
            isStale: () => stale,
            dispose: () => {
                codeBlock.reset();
                stale = true;
                this._pool.release(codeBlock);
            }
        };
    }
};
DiffEditorPool = __decorate([
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [ChatEditorOptions, Object, Object, Object])
], DiffEditorPool);
export { DiffEditorPool };
let CodeCompareModelService = class CodeCompareModelService {
    constructor(textModelService, modelService, chatService) {
        this.textModelService = textModelService;
        this.modelService = modelService;
        this.chatService = chatService;
    }
    async createModel(element, chatTextEdit) {
        const original = await this.textModelService.createModelReference(chatTextEdit.uri);
        const modified = await this.textModelService.createModelReference((this.modelService.createModel(createTextBufferFactoryFromSnapshot(original.object.textEditorModel.createSnapshot()), { languageId: original.object.textEditorModel.getLanguageId(), onDidChange: Event.None }, URI.from({ scheme: Schemas.vscodeChatCodeBlock, path: chatTextEdit.uri.path, query: generateUuid() }), false)).uri);
        const d = new RefCountedDisposable(toDisposable(() => {
            original.dispose();
            modified.dispose();
        }));
        let originalSha1 = '';
        if (chatTextEdit.state) {
            originalSha1 = chatTextEdit.state.sha1;
        }
        else {
            const sha1 = new DefaultModelSHA1Computer();
            if (sha1.canComputeSHA1(original.object.textEditorModel)) {
                originalSha1 = sha1.computeSHA1(original.object.textEditorModel);
                chatTextEdit.state = { sha1: originalSha1, applied: 0 };
            }
        }
        const chatModel = this.chatService.getSession(element.sessionId);
        const editGroups = [];
        for (const request of chatModel.getRequests()) {
            if (!request.response) {
                continue;
            }
            for (const item of request.response.response.value) {
                if (item.kind !== 'textEditGroup' || item.state?.applied || !isEqual(item.uri, chatTextEdit.uri)) {
                    continue;
                }
                for (const group of item.edits) {
                    const edits = group.map(TextEdit.asEditOperation);
                    editGroups.push(edits);
                }
            }
            if (request.response === element.model) {
                break;
            }
        }
        for (const edits of editGroups) {
            modified.object.textEditorModel.pushEditOperations(null, edits, () => null);
        }
        d.acquire();
        setTimeout(() => d.release(), 5000);
        return {
            object: {
                originalSha1,
                original: original.object,
                modified: modified.object
            },
            dispose() {
                d.release();
            },
        };
    }
};
CodeCompareModelService = __decorate([
    __param(0, ITextModelService),
    __param(1, IModelService),
    __param(2, IChatService),
    __metadata("design:paramtypes", [Object, Object, Object])
], CodeCompareModelService);
registerSingleton(ICodeCompareModelService, CodeCompareModelService, 1);
