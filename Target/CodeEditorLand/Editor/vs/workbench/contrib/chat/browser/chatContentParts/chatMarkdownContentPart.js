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
var ChatMarkdownContentPart_1;
import * as dom from '../../../../../base/browser/dom.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { equalsIgnoreCase } from '../../../../../base/common/strings.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { MarkdownRenderer } from '../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { getIconClasses } from '../../../../../editor/common/services/getIconClasses.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { MenuId } from '../../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { FileKind } from '../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { isRequestVM, isResponseVM } from '../../common/chatViewModel.js';
import { CodeBlockModelCollection } from '../../common/codeBlockModelCollection.js';
import { ChatMarkdownDecorationsRenderer } from '../chatMarkdownDecorationsRenderer.js';
import { ChatEditorOptions } from '../chatOptions.js';
import { CodeBlockPart, localFileLanguageId, parseLocalFileData } from '../codeBlockPart.js';
import '../media/chatCodeBlockPill.css';
import { ResourcePool } from './chatCollections.js';
const $ = dom.$;
let ChatMarkdownContentPart = class ChatMarkdownContentPart extends Disposable {
    static { ChatMarkdownContentPart_1 = this; }
    static { this.idPool = 0; }
    constructor(markdown, context, editorPool, fillInIncompleteTokens = false, codeBlockStartIndex = 0, renderer, currentWidth, codeBlockModelCollection, rendererOptions, contextKeyService, textModelService, instantiationService) {
        super();
        this.markdown = markdown;
        this.editorPool = editorPool;
        this.codeBlockModelCollection = codeBlockModelCollection;
        this.rendererOptions = rendererOptions;
        this.textModelService = textModelService;
        this.instantiationService = instantiationService;
        this.id = String(++ChatMarkdownContentPart_1.idPool);
        this.allRefs = [];
        this._onDidChangeHeight = this._register(new Emitter());
        this.onDidChangeHeight = this._onDidChangeHeight.event;
        this.codeblocks = [];
        const element = context.element;
        const markdownDecorationsRenderer = instantiationService.createInstance(ChatMarkdownDecorationsRenderer);
        // We release editors in order so that it's more likely that the same editor will be assigned if this element is re-rendered right away, like it often is during progressive rendering
        const orderedDisposablesList = [];
        let codeBlockIndex = codeBlockStartIndex;
        const result = this._register(renderer.render(markdown, {
            fillInIncompleteTokens,
            codeBlockRendererSync: (languageId, text, raw) => {
                const isCodeBlockComplete = !isResponseVM(context.element) || context.element.isComplete || !raw || raw?.endsWith('```');
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
                const codeBlockInfo = { languageId, textModel, codeBlockIndex: index, element, range, hideToolbar, parentContextKeyService: contextKeyService, vulns, codemapperUri };
                if (!rendererOptions.renderCodeBlockPills) {
                    const ref = this.renderCodeBlock(codeBlockInfo, text, currentWidth, rendererOptions.editableCodeBlock);
                    this.allRefs.push(ref);
                    // Attach this after updating text/layout of the editor, so it should only be fired when the size updates later (horizontal scrollbar, wrapping)
                    // not during a renderElement OR a progressive render (when we will be firing this event anyway at the end of the render)
                    this._register(ref.object.onDidChangeContentHeight(() => this._onDidChangeHeight.fire()));
                    const ownerMarkdownPartId = this.id;
                    const info = new class {
                        constructor() {
                            this.ownerMarkdownPartId = ownerMarkdownPartId;
                            this.codeBlockIndex = index;
                            this.element = element;
                            this.isStreaming = !rendererOptions.renderCodeBlockPills;
                            this.codemapperUri = undefined; // will be set async
                        }
                        get uri() {
                            // here we must do a getter because the ref.object is rendered
                            // async and the uri might be undefined when it's read immediately
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
                }
                else {
                    const ref = this.renderCodeBlockPill(codeBlockInfo.codemapperUri, isCodeBlockComplete);
                    if (isResponseVM(codeBlockInfo.element)) {
                        // TODO@joyceerhl: remove this code when we change the codeblockUri API to make the URI available synchronously
                        this.codeBlockModelCollection.update(codeBlockInfo.element.sessionId, codeBlockInfo.element, codeBlockInfo.codeBlockIndex, { text, languageId: codeBlockInfo.languageId }).then((e) => {
                            // Update the existing object's codemapperUri
                            this.codeblocks[codeBlockInfo.codeBlockIndex].codemapperUri = e.codemapperUri;
                            this._onDidChangeHeight.fire();
                        });
                    }
                    this.allRefs.push(ref);
                    const ownerMarkdownPartId = this.id;
                    const info = new class {
                        constructor() {
                            this.ownerMarkdownPartId = ownerMarkdownPartId;
                            this.codeBlockIndex = index;
                            this.element = element;
                            this.isStreaming = !isCodeBlockComplete;
                            this.codemapperUri = undefined; // will be set async
                        }
                        get uri() {
                            return undefined;
                        }
                        focus() {
                            return ref.object.element.focus();
                        }
                        getContent() {
                            return ''; // Not needed for collapsed code blocks
                        }
                    }();
                    this.codeblocks.push(info);
                    orderedDisposablesList.push(ref);
                    return ref.object.element;
                }
            },
            asyncRenderCallback: () => this._onDidChangeHeight.fire(),
        }));
        this._register(markdownDecorationsRenderer.walkTreeAndAnnotateReferenceLinks(result.element));
        orderedDisposablesList.reverse().forEach(d => this._register(d));
        this.domNode = result.element;
    }
    renderCodeBlockPill(codemapperUri, isCodeBlockComplete) {
        const codeBlock = this.instantiationService.createInstance(CollapsedCodeBlock);
        if (codemapperUri) {
            codeBlock.render(codemapperUri, !isCodeBlockComplete);
        }
        return {
            object: codeBlock,
            isStale: () => false,
            dispose: () => codeBlock.dispose()
        };
    }
    renderCodeBlock(data, text, currentWidth, editableCodeBlock) {
        const ref = this.editorPool.get();
        const editorInfo = ref.object;
        if (isResponseVM(data.element)) {
            this.codeBlockModelCollection.update(data.element.sessionId, data.element, data.codeBlockIndex, { text, languageId: data.languageId }).then((e) => {
                // Update the existing object's codemapperUri
                this.codeblocks[data.codeBlockIndex].codemapperUri = e.codemapperUri;
                this._onDidChangeHeight.fire();
            });
        }
        editorInfo.render(data, currentWidth, editableCodeBlock);
        return ref;
    }
    hasSameContent(other) {
        return other.kind === 'markdownContent' && !!(other.content.value === this.markdown.value
            || this.rendererOptions.renderCodeBlockPills && this.codeblocks.at(-1)?.isStreaming && this.codeblocks.at(-1)?.codemapperUri !== undefined && other.content.value.lastIndexOf('```') === this.markdown.value.lastIndexOf('```'));
    }
    layout(width) {
        this.allRefs.forEach((ref, index) => {
            if (ref.object instanceof CodeBlockPart) {
                ref.object.layout(width);
            }
            else if (ref.object instanceof CollapsedCodeBlock) {
                const codeblockModel = this.codeblocks[index];
                if (codeblockModel.codemapperUri && ref.object.uri?.toString() !== codeblockModel.codemapperUri.toString()) {
                    ref.object.render(codeblockModel.codemapperUri, codeblockModel.isStreaming);
                }
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
    __metadata("design:paramtypes", [Object, Object, EditorPool, Object, Object, MarkdownRenderer, Number, CodeBlockModelCollection, Object, Object, Object, Object])
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
let CollapsedCodeBlock = class CollapsedCodeBlock extends Disposable {
    get uri() {
        return this._uri;
    }
    constructor(labelService, editorService, modelService, languageService) {
        super();
        this.labelService = labelService;
        this.editorService = editorService;
        this.modelService = modelService;
        this.languageService = languageService;
        this.element = $('.chat-codeblock-pill-widget');
        this.element.classList.add('show-file-icons');
        this._register(dom.addDisposableListener(this.element, 'click', () => {
            if (this.uri) {
                this.editorService.openEditor({ resource: this.uri });
            }
        }));
    }
    render(uri, isStreaming) {
        if (this.uri?.toString() === uri.toString() && this.isStreaming === isStreaming) {
            return;
        }
        this._uri = uri;
        this.isStreaming = isStreaming;
        const iconText = this.labelService.getUriBasenameLabel(uri);
        let iconClasses = [];
        if (isStreaming) {
            const codicon = ThemeIcon.modify(Codicon.loading, 'spin');
            iconClasses = ThemeIcon.asClassNameArray(codicon);
        }
        else {
            const fileKind = uri.path.endsWith('/') ? FileKind.FOLDER : FileKind.FILE;
            iconClasses = getIconClasses(this.modelService, this.languageService, uri, fileKind);
        }
        const iconEl = dom.$('span.icon');
        iconEl.classList.add(...iconClasses);
        this.element.replaceChildren(iconEl, dom.$('span.icon-label', {}, iconText));
    }
};
CollapsedCodeBlock = __decorate([
    __param(0, ILabelService),
    __param(1, IEditorService),
    __param(2, IModelService),
    __param(3, ILanguageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], CollapsedCodeBlock);
