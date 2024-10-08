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
import './media/chatConfirmationWidget.css';
import { Button } from '../../../../../base/browser/ui/button/button.js';
import { Emitter } from '../../../../../base/common/event.js';
import { MarkdownString } from '../../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { MarkdownRenderer } from '../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { defaultButtonStyles } from '../../../../../platform/theme/browser/defaultStyles.js';
let ChatConfirmationWidget = class ChatConfirmationWidget extends Disposable {
    get onDidClick() { return this._onDidClick.event; }
    get domNode() {
        return this._domNode;
    }
    setShowButtons(showButton) {
        this.domNode.classList.toggle('hideButtons', !showButton);
    }
    constructor(title, message, buttons, instantiationService) {
        super();
        this.instantiationService = instantiationService;
        this._onDidClick = this._register(new Emitter());
        const elements = dom.h('.chat-confirmation-widget@root', [
            dom.h('.chat-confirmation-widget-title@title'),
            dom.h('.chat-confirmation-widget-message@message'),
            dom.h('.chat-confirmation-buttons-container@buttonsContainer'),
        ]);
        this._domNode = elements.root;
        const renderer = this._register(this.instantiationService.createInstance(MarkdownRenderer, {}));
        const renderedTitle = this._register(renderer.render(new MarkdownString(title)));
        elements.title.appendChild(renderedTitle.element);
        const renderedMessage = this._register(renderer.render(typeof message === 'string' ? new MarkdownString(message) : message));
        elements.message.appendChild(renderedMessage.element);
        buttons.forEach(buttonData => {
            const button = new Button(elements.buttonsContainer, { ...defaultButtonStyles, secondary: buttonData.isSecondary });
            button.label = buttonData.label;
            this._register(button.onDidClick(() => this._onDidClick.fire(buttonData)));
        });
    }
};
ChatConfirmationWidget = __decorate([
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [String, Object, Array, Object])
], ChatConfirmationWidget);
export { ChatConfirmationWidget };
