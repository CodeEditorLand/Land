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
import * as dom from '../../../../../base/browser/dom.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { MarkdownRenderer } from '../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js';
import { localize } from '../../../../../nls.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ChatConfirmationWidget } from './chatConfirmationWidget.js';
import { ChatProgressContentPart } from './chatProgressContentPart.js';
let ChatToolInvocationPart = class ChatToolInvocationPart extends Disposable {
    constructor(toolInvocation, context, renderer, instantiationService) {
        super();
        this._onDidChangeHeight = this._register(new Emitter());
        this.onDidChangeHeight = this._onDidChangeHeight.event;
        this.domNode = dom.$('.chat-tool-invocation-part');
        // This part is a bit different, since IChatToolInvocation is not an immutable model object. So this part is able to rerender itself.
        // If this turns out to be a typical pattern, we could come up with a more reusable pattern, like telling the list to rerender an element
        // when the model changes, or trying to make the model immutable and swap out one content part for a new one based on user actions in the view.
        const partStore = this._register(new DisposableStore());
        const render = () => {
            dom.clearNode(this.domNode);
            const subPart = partStore.add(instantiationService.createInstance(ChatToolInvocationSubPart, toolInvocation, context, renderer));
            this.domNode.appendChild(subPart.domNode);
            partStore.add(subPart.onNeedsRerender(() => {
                render();
                this._onDidChangeHeight.fire();
            }));
        };
        render();
    }
    hasSameContent(other, followingContent, element) {
        return other.kind === 'toolInvocation' || other.kind === 'toolInvocationSerialized';
    }
    addDisposable(disposable) {
        this._register(disposable);
    }
};
ChatToolInvocationPart = __decorate([
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, MarkdownRenderer, Object])
], ChatToolInvocationPart);
export { ChatToolInvocationPart };
let ChatToolInvocationSubPart = class ChatToolInvocationSubPart extends Disposable {
    constructor(toolInvocation, context, renderer, instantiationService) {
        super();
        this._onNeedsRerender = this._register(new Emitter());
        this.onNeedsRerender = this._onNeedsRerender.event;
        if (toolInvocation.kind === 'toolInvocation' && toolInvocation.confirmationMessages) {
            const title = toolInvocation.confirmationMessages.title;
            const message = toolInvocation.confirmationMessages.message;
            const confirmWidget = this._register(instantiationService.createInstance(ChatConfirmationWidget, title, message, [{ label: localize('continue', "Continue"), data: true }, { label: localize('cancel', "Cancel"), data: false, isSecondary: true }]));
            this.domNode = confirmWidget.domNode;
            this._register(confirmWidget.onDidClick(button => {
                toolInvocation.confirmed.complete(button.data);
            }));
            toolInvocation.confirmed.p.then(() => this._onNeedsRerender.fire());
            toolInvocation.isCompleteDeferred.p.then(() => this._onNeedsRerender.fire());
        }
        else {
            const message = toolInvocation.invocationMessage + '…';
            const progressMessage = {
                kind: 'progressMessage',
                content: { value: message }
            };
            const iconOverride = toolInvocation.isConfirmed === false ?
                Codicon.error :
                toolInvocation.isComplete ?
                    Codicon.check : undefined;
            const progressPart = this._register(instantiationService.createInstance(ChatProgressContentPart, progressMessage, renderer, context, undefined, true, iconOverride));
            this.domNode = progressPart.domNode;
        }
    }
};
ChatToolInvocationSubPart = __decorate([
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, MarkdownRenderer, Object])
], ChatToolInvocationSubPart);
