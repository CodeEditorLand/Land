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
import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { MarkdownRenderer } from '../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ChatProgressContentPart } from './chatProgressContentPart.js';
import { ChatCollapsibleListContentPart, CollapsibleListPool } from './chatReferencesContentPart.js';
let ChatTaskContentPart = class ChatTaskContentPart extends Disposable {
    constructor(task, contentReferencesListPool, renderer, context, instantiationService) {
        super();
        this.task = task;
        if (task.progress.length) {
            const refsPart = this._register(instantiationService.createInstance(ChatCollapsibleListContentPart, task.progress, task.content.value, context.element, contentReferencesListPool));
            this.domNode = dom.$('.chat-progress-task');
            this.domNode.appendChild(refsPart.domNode);
            this.onDidChangeHeight = refsPart.onDidChangeHeight;
        }
        else {
            // #217645
            const isSettled = task.isSettled?.() ?? true;
            const progressPart = this._register(instantiationService.createInstance(ChatProgressContentPart, task, renderer, context, !isSettled, true));
            this.domNode = progressPart.domNode;
            this.onDidChangeHeight = Event.None;
        }
    }
    hasSameContent(other) {
        return other.kind === 'progressTask'
            && other.progress.length === this.task.progress.length
            && other.isSettled() === this.task.isSettled();
    }
    addDisposable(disposable) {
        this._register(disposable);
    }
};
ChatTaskContentPart = __decorate([
    __param(4, IInstantiationService),
    __metadata("design:paramtypes", [Object, CollapsibleListPool,
        MarkdownRenderer, Object, Object])
], ChatTaskContentPart);
export { ChatTaskContentPart };
