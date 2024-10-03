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
var ChatMarkdownContentPart_1;
import * as dom from '../../../../../base/browser/dom.js';
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { equalsIgnoreCase } from '../../../../../base/common/strings.js';
import { MarkdownRenderer } from '../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { MenuId } from '../../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ResourcePool } from './chatCollections.js';
import { ChatMarkdownDecorationsRenderer } from '../chatMarkdownDecorationsRenderer.js';
import { ChatEditorOptions } from '../chatOptions.js';
import { CodeBlockPart, localFileLanguageId, parseLocalFileData } from '../codeBlockPart.js';
import { isRequestVM, isResponseVM } from '../../common/chatViewModel.js';
import { CodeBlockModelCollection } from '../../common/codeBlockModelCollection.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { InlineAnchorWidget } from '../chatInlineAnchorWidget.js';
const $ = dom.$;
let ChatMarkdownContentPart = class ChatMarkdownContentPart extends Disposable {
    static { ChatMarkdownContentPart_1 = this; }
    static { this.idPool = 0; }
    constructor(markdown, context, editorPool, fillInIncompleteTokens = false, codeBlockStartIndex = 0, renderer, currentWidth, codeBlockModelCollection, rendererOptions, contextKeyService, textModelService, instantiationService, editorService) {
        super();
        this.markdown = markdown;
        this.editorPool = editorPool;
        this.codeBlockModelCollection = codeBlockModelCollection;
        this.textModelService = textModelService;
        this.instantiationService = instantiationService;
        this.editorService = editorService;
        this.id = String(++ChatMarkdownContentPart_1.idPool);
        this.allRefs = [];
        this._onDidChangeHeight = this._register(new Emitter());
        this.onDidChangeHeight = this._onDidChangeHeight.event;
        this.codeblocks = [];
        const element = context.element;
        const markdownDecorationsRenderer = instantiationService.createInstance(ChatMarkdownDecorationsRenderer);
        const orderedDisposablesList = [];
        let codeBlockIndex = codeBlockStartIndex;
        const result = this._register(renderer.render(markdown, {
            fillInIncompleteTokens,
            codeBlockRendererSync: (languageId, text) => {
                const index = codeBlockIndex++;
                let textModel;
                let range;
                let vulns;
                let codemapperUri;
                if (equalsIgnoreCase(languageId, localFileLanguageId)) {
                    try {
                        const parsedBody = parseLocalFileData(text);
                        range = parsedBody.range && Range.lift(parsedBody.range);
                        textModel = this.textModelService.createModelReference(parsedBody.uri).then(ref => ref.object);
                    }
                    catch (e) {
                        return $('div');
                    }
                }
                else {
                    const sessionId = isResponseVM(element) || isRequestVM(element) ? element.sessionId : '';
                    const modelEntry = this.codeBlockModelCollection.getOrCreate(sessionId, element, index);
                    vulns = modelEntry.vulns;
                    codemapperUri = modelEntry.codemapperUri;
                    textModel = modelEntry.model;
                }
                const hideToolbar = isResponseVM(element) && element.errorDetails?.responseIsFiltered;
                const ref = this.renderCodeBlock({ languageId, textModel, codeBlockIndex: index, element, range, hideToolbar, parentContextKeyService: contextKeyService, vulns, codemapperUri }, text, currentWidth, rendererOptions.editableCodeBlock);
                this.allRefs.push(ref);
                this._register(ref.object.onDidChangeContentHeight(() => this._onDidChangeHeight.fire()));
                const ownerMarkdownPartId = this.id;
                const info = new class {
                    constructor() {
                        this.ownerMarkdownPartId = ownerMarkdownPartId;
                        this.codeBlockIndex = index;
                        this.element = element;
                        this.codemapperUri = undefined;
                    }
                    get uri() {
                        return ref.object.uri;
                    }
                    focus() {
                        ref.object.focus();
                    }
                    getContent() {
                        return ref.object.editor.getValue();
                    }
                }();
                this.codeblocks.push(info);
                orderedDisposablesList.push(ref);
                return ref.object.element;
            },
            asyncRenderCallback: () => this._onDidChangeHeight.fire(),
        }));
        this._register(markdownDecorationsRenderer.walkTreeAndAnnotateReferenceLinks(result.element));
        orderedDisposablesList.reverse().forEach(d => this._register(d));
        this.domNode = result.element;
    }
    renderCodeBlock(data, text, currentWidth, editableCodeBlock) {
        const ref = this.editorPool.get();
        const editorInfo = ref.object;
        if (isResponseVM(data.element)) {
            this.codeBlockModelCollection.update(data.element.sessionId, data.element, data.codeBlockIndex, { text, languageId: data.languageId }).then((e) => {
                this.codeblocks[data.codeBlockIndex].codemapperUri = e.codemapperUri;
                this._onDidChangeHeight.fire();
            });
        }
        editorInfo.render(data, currentWidth, editableCodeBlock);
        return ref;
    }
    hasSameContent(other) {
        return other.kind === 'markdownContent' && other.content.value === this.markdown.value;
    }
    layout(width) {
        this.allRefs.forEach((ref, index) => {
            const codeblockModel = this.codeblocks[index];
            if (codeblockModel.codemapperUri) {
                const fileWidgetAnchor = $('.chat-codeblock');
                this._register(this.instantiationService.createInstance(InlineAnchorWidget, fileWidgetAnchor, { uri: codeblockModel.codemapperUri }, { handleClick: (uri) => this.editorService.openEditor({ resource: uri }) }));
                const existingCodeblock = ref.object.element.parentElement?.querySelector('.chat-codeblock');
                if (!existingCodeblock) {
                    ref.object.element.parentElement?.appendChild(fileWidgetAnchor);
                    ref.object.element.style.display = 'none';
                }
            }
            else {
                ref.object.layout(width);
            }
        });
    }
    addDisposable(disposable) {
        this._register(disposable);
    }
};
ChatMarkdownContentPart = ChatMarkdownContentPart_1 = __decorate([
    __param(9, IContextKeyService),
    __param(10, ITextModelService),
    __param(11, IInstantiationService),
    __param(12, IEditorService),
    __metadata("design:paramtypes", [Object, Object, EditorPool, Object, Object, MarkdownRenderer, Number, CodeBlockModelCollection, Object, Object, Object, Object, Object])
], ChatMarkdownContentPart);
export { ChatMarkdownContentPart };
let EditorPool = class EditorPool extends Disposable {
    inUse() {
        return this._pool.inUse;
    }
    constructor(options, delegate, overflowWidgetsDomNode, instantiationService) {
        super();
        this._pool = this._register(new ResourcePool(() => {
            return instantiationService.createInstance(CodeBlockPart, options, MenuId.ChatCodeBlock, delegate, overflowWidgetsDomNode);
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
EditorPool = __decorate([
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [ChatEditorOptions, Object, Object, Object])
], EditorPool);
export { EditorPool };
