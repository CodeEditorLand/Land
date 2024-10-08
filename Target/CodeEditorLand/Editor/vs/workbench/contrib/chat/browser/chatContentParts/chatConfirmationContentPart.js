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
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { localize } from '../../../../../nls.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ChatConfirmationWidget } from './chatConfirmationWidget.js';
import { IChatService } from '../../common/chatService.js';
import { isResponseVM } from '../../common/chatViewModel.js';
let ChatConfirmationContentPart = class ChatConfirmationContentPart extends Disposable {
    constructor(confirmation, context, instantiationService, chatService) {
        super();
        this.instantiationService = instantiationService;
        this.chatService = chatService;
        this._onDidChangeHeight = this._register(new Emitter());
        this.onDidChangeHeight = this._onDidChangeHeight.event;
        const element = context.element;
        const buttons = confirmation.buttons
            ? confirmation.buttons.map(button => ({
                label: button,
                data: confirmation.data
            }))
            : [
                { label: localize('accept', "Accept"), data: confirmation.data },
                { label: localize('dismiss', "Dismiss"), data: confirmation.data, isSecondary: true },
            ];
        const confirmationWidget = this._register(this.instantiationService.createInstance(ChatConfirmationWidget, confirmation.title, confirmation.message, buttons));
        confirmationWidget.setShowButtons(!confirmation.isUsed);
        this._register(confirmationWidget.onDidClick(async (e) => {
            if (isResponseVM(element)) {
                const prompt = `${e.label}: "${confirmation.title}"`;
                const data = e.isSecondary ?
                    { rejectedConfirmationData: [e.data] } :
                    { acceptedConfirmationData: [e.data] };
                data.agentId = element.agent?.id;
                data.slashCommand = element.slashCommand?.name;
                data.confirmation = e.label;
                if (await this.chatService.sendRequest(element.sessionId, prompt, data)) {
                    confirmation.isUsed = true;
                    confirmationWidget.setShowButtons(false);
                    this._onDidChangeHeight.fire();
                }
            }
        }));
        this.domNode = confirmationWidget.domNode;
    }
    hasSameContent(other) {
        // No other change allowed for this content type
        return other.kind === 'confirmation';
    }
    addDisposable(disposable) {
        this._register(disposable);
    }
};
ChatConfirmationContentPart = __decorate([
    __param(2, IInstantiationService),
    __param(3, IChatService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ChatConfirmationContentPart);
export { ChatConfirmationContentPart };
