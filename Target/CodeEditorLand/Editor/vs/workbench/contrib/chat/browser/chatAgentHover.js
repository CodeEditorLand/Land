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
import * as dom from '../../../../base/browser/dom.js';
import { renderIcon } from '../../../../base/browser/ui/iconLabel/iconLabels.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { FileAccess } from '../../../../base/common/network.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { getFullyQualifiedId, IChatAgentNameService, IChatAgentService } from '../common/chatAgents.js';
import { showExtensionsWithIdsCommandId } from '../../extensions/browser/extensionsActions.js';
import { verifiedPublisherIcon } from '../../extensions/browser/extensionsIcons.js';
import { IExtensionsWorkbenchService } from '../../extensions/common/extensions.js';
let ChatAgentHover = class ChatAgentHover extends Disposable {
    constructor(chatAgentService, extensionService, chatAgentNameService) {
        super();
        this.chatAgentService = chatAgentService;
        this.extensionService = extensionService;
        this.chatAgentNameService = chatAgentNameService;
        this._onDidChangeContents = this._register(new Emitter());
        this.onDidChangeContents = this._onDidChangeContents.event;
        const hoverElement = dom.h('.chat-agent-hover@root', [
            dom.h('.chat-agent-hover-header', [
                dom.h('.chat-agent-hover-icon@icon'),
                dom.h('.chat-agent-hover-details', [
                    dom.h('.chat-agent-hover-name@name'),
                    dom.h('.chat-agent-hover-extension', [
                        dom.h('.chat-agent-hover-extension-name@extensionName'),
                        dom.h('.chat-agent-hover-separator@separator'),
                        dom.h('.chat-agent-hover-publisher@publisher'),
                    ]),
                ]),
            ]),
            dom.h('.chat-agent-hover-warning@warning'),
            dom.h('span.chat-agent-hover-description@description'),
        ]);
        this.domNode = hoverElement.root;
        this.icon = hoverElement.icon;
        this.name = hoverElement.name;
        this.extensionName = hoverElement.extensionName;
        this.description = hoverElement.description;
        hoverElement.separator.textContent = '|';
        const verifiedBadge = dom.$('span.extension-verified-publisher', undefined, renderIcon(verifiedPublisherIcon));
        this.publisherName = dom.$('span.chat-agent-hover-publisher-name');
        dom.append(hoverElement.publisher, verifiedBadge, this.publisherName);
        hoverElement.warning.appendChild(renderIcon(Codicon.warning));
        hoverElement.warning.appendChild(dom.$('span', undefined, localize('reservedName', "This chat extension is using a reserved name.")));
    }
    setAgent(id) {
        const agent = this.chatAgentService.getAgent(id);
        if (agent.metadata.icon instanceof URI) {
            const avatarIcon = dom.$('img.icon');
            avatarIcon.src = FileAccess.uriToBrowserUri(agent.metadata.icon).toString(true);
            this.icon.replaceChildren(dom.$('.avatar', undefined, avatarIcon));
        }
        else if (agent.metadata.themeIcon) {
            const avatarIcon = dom.$(ThemeIcon.asCSSSelector(agent.metadata.themeIcon));
            this.icon.replaceChildren(dom.$('.avatar.codicon-avatar', undefined, avatarIcon));
        }
        this.domNode.classList.toggle('noExtensionName', !!agent.isDynamic);
        const isAllowed = this.chatAgentNameService.getAgentNameRestriction(agent);
        this.name.textContent = isAllowed ? `@${agent.name}` : getFullyQualifiedId(agent);
        this.extensionName.textContent = agent.extensionDisplayName;
        this.publisherName.textContent = agent.publisherDisplayName ?? agent.extensionPublisherId;
        let description = agent.description ?? '';
        if (description) {
            if (!description.match(/[\.\?\!] *$/)) {
                description += '.';
            }
        }
        this.description.textContent = description;
        this.domNode.classList.toggle('allowedName', isAllowed);
        this.domNode.classList.toggle('verifiedPublisher', false);
        if (!agent.isDynamic) {
            const cancel = this._register(new CancellationTokenSource());
            this.extensionService.getExtensions([{ id: agent.extensionId.value }], cancel.token).then(extensions => {
                cancel.dispose();
                const extension = extensions[0];
                if (extension?.publisherDomain?.verified) {
                    this.domNode.classList.toggle('verifiedPublisher', true);
                    this._onDidChangeContents.fire();
                }
            });
        }
    }
};
ChatAgentHover = __decorate([
    __param(0, IChatAgentService),
    __param(1, IExtensionsWorkbenchService),
    __param(2, IChatAgentNameService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ChatAgentHover);
export { ChatAgentHover };
export function getChatAgentHoverOptions(getAgent, commandService) {
    return {
        actions: [
            {
                commandId: showExtensionsWithIdsCommandId,
                label: localize('viewExtensionLabel', "View Extension"),
                run: () => {
                    const agent = getAgent();
                    if (agent) {
                        commandService.executeCommand(showExtensionsWithIdsCommandId, [agent.extensionId.value]);
                    }
                },
            }
        ]
    };
}
