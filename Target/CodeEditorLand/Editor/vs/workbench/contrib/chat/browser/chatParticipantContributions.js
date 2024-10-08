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
import { coalesce, isNonEmptyArray } from '../../../../base/common/arrays.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, DisposableMap, DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import * as strings from '../../../../base/common/strings.js';
import { localize, localize2 } from '../../../../nls.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { Extensions as ViewExtensions } from '../../../common/views.js';
import { isProposedApiEnabled } from '../../../services/extensions/common/extensions.js';
import * as extensionsRegistry from '../../../services/extensions/common/extensionsRegistry.js';
import { showExtensionsWithIdsCommandId } from '../../extensions/browser/extensionsActions.js';
import { IExtensionsWorkbenchService } from '../../extensions/common/extensions.js';
import { ChatAgentLocation, IChatAgentService } from '../common/chatAgents.js';
import { CONTEXT_CHAT_EDITING_PARTICIPANT_REGISTERED, CONTEXT_CHAT_EXTENSION_INVALID, CONTEXT_CHAT_PANEL_PARTICIPANT_REGISTERED } from '../common/chatContextKeys.js';
import { CHAT_VIEW_ID } from './chat.js';
import { CHAT_EDITING_SIDEBAR_PANEL_ID, CHAT_SIDEBAR_PANEL_ID, ChatViewPane } from './chatViewPane.js';
const chatParticipantExtensionPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: 'chatParticipants',
    jsonSchema: {
        description: localize('vscode.extension.contributes.chatParticipant', 'Contributes a chat participant'),
        type: 'array',
        items: {
            additionalProperties: false,
            type: 'object',
            defaultSnippets: [{ body: { name: '', description: '' } }],
            required: ['name', 'id'],
            properties: {
                id: {
                    description: localize('chatParticipantId', "A unique id for this chat participant."),
                    type: 'string'
                },
                name: {
                    description: localize('chatParticipantName', "User-facing name for this chat participant. The user will use '@' with this name to invoke the participant. Name must not contain whitespace."),
                    type: 'string',
                    pattern: '^[\\w-]+$'
                },
                fullName: {
                    markdownDescription: localize('chatParticipantFullName', "The full name of this chat participant, which is shown as the label for responses coming from this participant. If not provided, {0} is used.", '`name`'),
                    type: 'string'
                },
                description: {
                    description: localize('chatParticipantDescription', "A description of this chat participant, shown in the UI."),
                    type: 'string'
                },
                isSticky: {
                    description: localize('chatCommandSticky', "Whether invoking the command puts the chat into a persistent mode, where the command is automatically added to the chat input for the next message."),
                    type: 'boolean'
                },
                sampleRequest: {
                    description: localize('chatSampleRequest', "When the user clicks this participant in `/help`, this text will be submitted to the participant."),
                    type: 'string'
                },
                when: {
                    description: localize('chatParticipantWhen', "A condition which must be true to enable this participant."),
                    type: 'string'
                },
                disambiguation: {
                    description: localize('chatParticipantDisambiguation', "Metadata to help with automatically routing user questions to this chat participant."),
                    type: 'array',
                    items: {
                        additionalProperties: false,
                        type: 'object',
                        defaultSnippets: [{ body: { category: '', description: '', examples: [] } }],
                        required: ['category', 'description', 'examples'],
                        properties: {
                            category: {
                                markdownDescription: localize('chatParticipantDisambiguationCategory', "A detailed name for this category, e.g. `workspace_questions` or `web_questions`."),
                                type: 'string'
                            },
                            description: {
                                description: localize('chatParticipantDisambiguationDescription', "A detailed description of the kinds of questions that are suitable for this chat participant."),
                                type: 'string'
                            },
                            examples: {
                                description: localize('chatParticipantDisambiguationExamples', "A list of representative example questions that are suitable for this chat participant."),
                                type: 'array'
                            },
                        }
                    }
                },
                commands: {
                    markdownDescription: localize('chatCommandsDescription', "Commands available for this chat participant, which the user can invoke with a `/`."),
                    type: 'array',
                    items: {
                        additionalProperties: false,
                        type: 'object',
                        defaultSnippets: [{ body: { name: '', description: '' } }],
                        required: ['name'],
                        properties: {
                            name: {
                                description: localize('chatCommand', "A short name by which this command is referred to in the UI, e.g. `fix` or * `explain` for commands that fix an issue or explain code. The name should be unique among the commands provided by this participant."),
                                type: 'string'
                            },
                            description: {
                                description: localize('chatCommandDescription', "A description of this command."),
                                type: 'string'
                            },
                            when: {
                                description: localize('chatCommandWhen', "A condition which must be true to enable this command."),
                                type: 'string'
                            },
                            sampleRequest: {
                                description: localize('chatCommandSampleRequest', "When the user clicks this command in `/help`, this text will be submitted to the participant."),
                                type: 'string'
                            },
                            isSticky: {
                                description: localize('chatCommandSticky', "Whether invoking the command puts the chat into a persistent mode, where the command is automatically added to the chat input for the next message."),
                                type: 'boolean'
                            },
                            disambiguation: {
                                description: localize('chatCommandDisambiguation', "Metadata to help with automatically routing user questions to this chat command."),
                                type: 'array',
                                items: {
                                    additionalProperties: false,
                                    type: 'object',
                                    defaultSnippets: [{ body: { category: '', description: '', examples: [] } }],
                                    required: ['category', 'description', 'examples'],
                                    properties: {
                                        category: {
                                            markdownDescription: localize('chatCommandDisambiguationCategory', "A detailed name for this category, e.g. `workspace_questions` or `web_questions`."),
                                            type: 'string'
                                        },
                                        description: {
                                            description: localize('chatCommandDisambiguationDescription', "A detailed description of the kinds of questions that are suitable for this chat command."),
                                            type: 'string'
                                        },
                                        examples: {
                                            description: localize('chatCommandDisambiguationExamples', "A list of representative example questions that are suitable for this chat command."),
                                            type: 'array'
                                        },
                                    }
                                }
                            }
                        }
                    }
                },
                supportsToolReferences: {
                    description: localize('chatParticipantSupportsToolReferences', "Whether this participant supports {0}.", 'ChatRequest#toolReferences'),
                    type: 'boolean'
                }
            }
        }
    },
    activationEventsGenerator: (contributions, result) => {
        for (const contrib of contributions) {
            result.push(`onChatParticipant:${contrib.id}`);
        }
    },
});
let ChatExtensionPointHandler = class ChatExtensionPointHandler {
    static { this.ID = 'workbench.contrib.chatExtensionPointHandler'; }
    constructor(_chatAgentService, logService) {
        this._chatAgentService = _chatAgentService;
        this.logService = logService;
        this._participantRegistrationDisposables = new DisposableMap();
        this._viewContainer = this.registerViewContainer();
        this.registerDefaultParticipantView();
        this.registerChatEditingView();
        this.handleAndRegisterChatExtensions();
    }
    handleAndRegisterChatExtensions() {
        chatParticipantExtensionPoint.setHandler((extensions, delta) => {
            for (const extension of delta.added) {
                for (const providerDescriptor of extension.value) {
                    if (!providerDescriptor.name?.match(/^[\w-]+$/)) {
                        this.logService.error(`Extension '${extension.description.identifier.value}' CANNOT register participant with invalid name: ${providerDescriptor.name}. Name must match /^[\\w-]+$/.`);
                        continue;
                    }
                    if (providerDescriptor.fullName && strings.AmbiguousCharacters.getInstance(new Set()).containsAmbiguousCharacter(providerDescriptor.fullName)) {
                        this.logService.error(`Extension '${extension.description.identifier.value}' CANNOT register participant with fullName that contains ambiguous characters: ${providerDescriptor.fullName}.`);
                        continue;
                    }
                    // Spaces are allowed but considered "invisible"
                    if (providerDescriptor.fullName && strings.InvisibleCharacters.containsInvisibleCharacter(providerDescriptor.fullName.replace(/ /g, ''))) {
                        this.logService.error(`Extension '${extension.description.identifier.value}' CANNOT register participant with fullName that contains invisible characters: ${providerDescriptor.fullName}.`);
                        continue;
                    }
                    if (providerDescriptor.isDefault && !isProposedApiEnabled(extension.description, 'defaultChatParticipant')) {
                        this.logService.error(`Extension '${extension.description.identifier.value}' CANNOT use API proposal: defaultChatParticipant.`);
                        continue;
                    }
                    if ((providerDescriptor.defaultImplicitVariables || providerDescriptor.locations || providerDescriptor.supportsModelPicker) && !isProposedApiEnabled(extension.description, 'chatParticipantAdditions')) {
                        this.logService.error(`Extension '${extension.description.identifier.value}' CANNOT use API proposal: chatParticipantAdditions.`);
                        continue;
                    }
                    if (!providerDescriptor.id || !providerDescriptor.name) {
                        this.logService.error(`Extension '${extension.description.identifier.value}' CANNOT register participant without both id and name.`);
                        continue;
                    }
                    const participantsAndCommandsDisambiguation = [];
                    if (isProposedApiEnabled(extension.description, 'contribChatParticipantDetection')) {
                        if (providerDescriptor.disambiguation?.length) {
                            participantsAndCommandsDisambiguation.push(...providerDescriptor.disambiguation.map((d) => ({
                                ...d, category: d.category ?? d.categoryName
                            })));
                        }
                        if (providerDescriptor.commands) {
                            for (const command of providerDescriptor.commands) {
                                if (command.disambiguation?.length) {
                                    participantsAndCommandsDisambiguation.push(...command.disambiguation.map((d) => ({
                                        ...d, category: d.category ?? d.categoryName
                                    })));
                                }
                            }
                        }
                    }
                    const store = new DisposableStore();
                    store.add(this._chatAgentService.registerAgent(providerDescriptor.id, {
                        extensionId: extension.description.identifier,
                        publisherDisplayName: extension.description.publisherDisplayName ?? extension.description.publisher, // May not be present in OSS
                        extensionPublisherId: extension.description.publisher,
                        extensionDisplayName: extension.description.displayName ?? extension.description.name,
                        id: providerDescriptor.id,
                        description: providerDescriptor.description,
                        supportsModelPicker: providerDescriptor.supportsModelPicker,
                        when: providerDescriptor.when,
                        metadata: {
                            isSticky: providerDescriptor.isSticky,
                            sampleRequest: providerDescriptor.sampleRequest,
                        },
                        name: providerDescriptor.name,
                        fullName: providerDescriptor.fullName,
                        isDefault: providerDescriptor.isDefault,
                        locations: isNonEmptyArray(providerDescriptor.locations) ?
                            providerDescriptor.locations.map(ChatAgentLocation.fromRaw) :
                            [ChatAgentLocation.Panel],
                        slashCommands: providerDescriptor.commands ?? [],
                        disambiguation: coalesce(participantsAndCommandsDisambiguation.flat()),
                        supportsToolReferences: providerDescriptor.supportsToolReferences,
                    }));
                    this._participantRegistrationDisposables.set(getParticipantKey(extension.description.identifier, providerDescriptor.id), store);
                }
            }
            for (const extension of delta.removed) {
                for (const providerDescriptor of extension.value) {
                    this._participantRegistrationDisposables.deleteAndDispose(getParticipantKey(extension.description.identifier, providerDescriptor.id));
                }
            }
        });
    }
    registerViewContainer() {
        // Register View Container
        const title = localize2('chat.viewContainer.label', "Chat");
        const icon = Codicon.commentDiscussion;
        const viewContainerId = CHAT_SIDEBAR_PANEL_ID;
        const viewContainer = Registry.as(ViewExtensions.ViewContainersRegistry).registerViewContainer({
            id: viewContainerId,
            title,
            icon,
            ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [viewContainerId, { mergeViewWithContainerWhenSingleView: true }]),
            storageId: viewContainerId,
            hideIfEmpty: true,
            order: 100,
        }, 0 /* ViewContainerLocation.Sidebar */);
        return viewContainer;
    }
    registerDefaultParticipantView() {
        // Register View. Name must be hardcoded because we want to show it even when the extension fails to load due to an API version incompatibility.
        const name = 'GitHub Copilot';
        const viewDescriptor = [{
                id: CHAT_VIEW_ID,
                containerIcon: this._viewContainer.icon,
                containerTitle: this._viewContainer.title.value,
                singleViewPaneContainerTitle: this._viewContainer.title.value,
                name: { value: name, original: name },
                canToggleVisibility: false,
                canMoveView: true,
                ctorDescriptor: new SyncDescriptor(ChatViewPane),
                when: ContextKeyExpr.or(CONTEXT_CHAT_PANEL_PARTICIPANT_REGISTERED, CONTEXT_CHAT_EXTENSION_INVALID)
            }];
        Registry.as(ViewExtensions.ViewsRegistry).registerViews(viewDescriptor, this._viewContainer);
        return toDisposable(() => {
            Registry.as(ViewExtensions.ViewsRegistry).deregisterViews(viewDescriptor, this._viewContainer);
        });
    }
    registerChatEditingView() {
        const title = localize2('chatEditing.viewContainer.label', "Copilot Edits");
        const icon = Codicon.requestChanges;
        const viewContainerId = CHAT_EDITING_SIDEBAR_PANEL_ID;
        const viewContainer = Registry.as(ViewExtensions.ViewContainersRegistry).registerViewContainer({
            id: viewContainerId,
            title,
            icon,
            ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [viewContainerId, { mergeViewWithContainerWhenSingleView: true }]),
            storageId: viewContainerId,
            hideIfEmpty: true,
            order: 100,
        }, 2 /* ViewContainerLocation.AuxiliaryBar */);
        const id = 'workbench.panel.chat.view.edits';
        const viewDescriptor = [{
                id: id,
                containerIcon: viewContainer.icon,
                containerTitle: title.value,
                singleViewPaneContainerTitle: title.value,
                name: { value: title.value, original: title.value },
                canToggleVisibility: false,
                canMoveView: true,
                ctorDescriptor: new SyncDescriptor(ChatViewPane, [{ id, title: title.value }, { location: ChatAgentLocation.EditingSession }]),
                when: CONTEXT_CHAT_EDITING_PARTICIPANT_REGISTERED
            }];
        Registry.as(ViewExtensions.ViewsRegistry).registerViews(viewDescriptor, viewContainer);
        return toDisposable(() => {
            Registry.as(ViewExtensions.ViewContainersRegistry).deregisterViewContainer(viewContainer);
            Registry.as(ViewExtensions.ViewsRegistry).deregisterViews(viewDescriptor, viewContainer);
        });
    }
};
ChatExtensionPointHandler = __decorate([
    __param(0, IChatAgentService),
    __param(1, ILogService),
    __metadata("design:paramtypes", [Object, Object])
], ChatExtensionPointHandler);
export { ChatExtensionPointHandler };
function getParticipantKey(extensionId, participantName) {
    return `${extensionId.value}_${participantName}`;
}
let ChatCompatibilityNotifier = class ChatCompatibilityNotifier extends Disposable {
    static { this.ID = 'workbench.contrib.chatCompatNotifier'; }
    constructor(extensionsWorkbenchService, contextKeyService, productService) {
        super();
        this.productService = productService;
        this.registeredWelcomeView = false;
        // It may be better to have some generic UI for this, for any extension that is incompatible,
        // but this is only enabled for Copilot Chat now and it needs to be obvious.
        const isInvalid = CONTEXT_CHAT_EXTENSION_INVALID.bindTo(contextKeyService);
        this._register(Event.runAndSubscribe(extensionsWorkbenchService.onDidChangeExtensionsNotification, () => {
            const notification = extensionsWorkbenchService.getExtensionsNotification();
            const chatExtension = notification?.extensions.find(ext => ext.identifier.id === 'github.copilot-chat');
            if (chatExtension) {
                isInvalid.set(true);
                this.registerWelcomeView(chatExtension);
            }
            else {
                isInvalid.set(false);
            }
        }));
    }
    registerWelcomeView(chatExtension) {
        if (this.registeredWelcomeView) {
            return;
        }
        this.registeredWelcomeView = true;
        const showExtensionLabel = localize('showExtension', "Show Extension");
        const mainMessage = localize('chatFailErrorMessage', "Chat failed to load because the installed version of the {0} extension is not compatible with this version of {1}. Please ensure that the GitHub Copilot Chat extension is up to date.", 'GitHub Copilot Chat', this.productService.nameLong);
        const commandButton = `[${showExtensionLabel}](command:${showExtensionsWithIdsCommandId}?${encodeURIComponent(JSON.stringify([['GitHub.copilot-chat']]))})`;
        const versionMessage = `GitHub Copilot Chat version: ${chatExtension.version}`;
        const viewsRegistry = Registry.as(ViewExtensions.ViewsRegistry);
        this._register(viewsRegistry.registerViewWelcomeContent(CHAT_VIEW_ID, {
            content: [mainMessage, commandButton, versionMessage].join('\n\n'),
            when: CONTEXT_CHAT_EXTENSION_INVALID,
        }));
    }
};
ChatCompatibilityNotifier = __decorate([
    __param(0, IExtensionsWorkbenchService),
    __param(1, IContextKeyService),
    __param(2, IProductService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ChatCompatibilityNotifier);
export { ChatCompatibilityNotifier };
