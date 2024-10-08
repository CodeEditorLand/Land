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
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IActivityService, NumberBadge } from '../../../services/activity/common/activity.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { Extensions as ConfigurationExtensions, } from '../../../../platform/configuration/common/configurationRegistry.js';
import { applicationConfigurationNodeBase } from '../../../common/configuration.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { CHAT_VIEW_ID } from './chat.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
const showChatGettingStartedConfigKey = 'workbench.panel.chat.view.experimental.showGettingStarted';
let ChatGettingStartedContribution = class ChatGettingStartedContribution extends Disposable {
    static { this.ID = 'workbench.contrib.chatGettingStarted'; }
    constructor(contextService, productService, storageService, activityService, extensionService, commandService, configurationService, extensionManagementService) {
        super();
        this.contextService = contextService;
        this.productService = productService;
        this.storageService = storageService;
        this.activityService = activityService;
        this.extensionService = extensionService;
        this.commandService = commandService;
        this.configurationService = configurationService;
        this.extensionManagementService = extensionManagementService;
        this.showChatGettingStartedDisposable = this._register(new MutableDisposable());
        if (!this.productService.gitHubEntitlement) {
            return;
        }
        if (this.storageService.get(showChatGettingStartedConfigKey, -1 /* StorageScope.APPLICATION */) !== undefined) {
            return;
        }
        this.extensionManagementService.getInstalled().then(async (exts) => {
            const installed = exts.find(value => ExtensionIdentifier.equals(value.identifier.id, this.productService.gitHubEntitlement.extensionId));
            if (!installed) {
                this.registerListeners();
                return;
            }
            this.storageService.store(showChatGettingStartedConfigKey, 'installed', -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        });
    }
    registerListeners() {
        this._register(this.extensionService.onDidChangeExtensions(async (result) => {
            if (this.storageService.get(showChatGettingStartedConfigKey, -1 /* StorageScope.APPLICATION */) !== undefined) {
                return;
            }
            for (const ext of result.added) {
                if (ExtensionIdentifier.equals(this.productService.gitHubEntitlement.extensionId, ext.identifier)) {
                    this.displayBadge();
                    return;
                }
            }
        }));
        this.extensionService.onDidChangeExtensionsStatus(async (event) => {
            if (this.storageService.get(showChatGettingStartedConfigKey, -1 /* StorageScope.APPLICATION */) !== undefined) {
                return;
            }
            for (const ext of event) {
                if (ExtensionIdentifier.equals(this.productService.gitHubEntitlement.extensionId, ext.value)) {
                    const extensionStatus = this.extensionService.getExtensionsStatus();
                    if (extensionStatus[ext.value].activationTimes) {
                        this.displayChatPanel();
                        return;
                    }
                }
            }
        });
        this._register(this.contextService.onDidChangeContext(event => {
            if (this.storageService.get(showChatGettingStartedConfigKey, -1 /* StorageScope.APPLICATION */) === undefined) {
                return;
            }
            if (event.affectsSome(new Set([`view.${CHAT_VIEW_ID}.visible`]))) {
                if (this.contextService.contextMatchesRules(ContextKeyExpr.deserialize(`${CHAT_VIEW_ID}.visible`))) {
                    this.showChatGettingStartedDisposable.clear();
                }
            }
        }));
    }
    async displayBadge() {
        const showGettingStartedExp = this.configurationService.inspect(showChatGettingStartedConfigKey).value ?? '';
        if (!showGettingStartedExp || showGettingStartedExp !== 'showBadge') {
            return;
        }
        const badge = new NumberBadge(1, () => localize('chat.openPanel', 'Open Chat Panel'));
        this.showChatGettingStartedDisposable.value = this.activityService.showViewActivity(CHAT_VIEW_ID, { badge });
        this.storageService.store(showChatGettingStartedConfigKey, showGettingStartedExp, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
    }
    async displayChatPanel() {
        const showGettingStartedExp = this.configurationService.inspect(showChatGettingStartedConfigKey).value ?? '';
        if (!showGettingStartedExp || showGettingStartedExp !== 'showChatPanel') {
            return;
        }
        this.commandService.executeCommand(`${CHAT_VIEW_ID}.focus`);
        this.storageService.store(showChatGettingStartedConfigKey, showGettingStartedExp, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
    }
};
ChatGettingStartedContribution = __decorate([
    __param(0, IContextKeyService),
    __param(1, IProductService),
    __param(2, IStorageService),
    __param(3, IActivityService),
    __param(4, IExtensionService),
    __param(5, ICommandService),
    __param(6, IConfigurationService),
    __param(7, IExtensionManagementService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], ChatGettingStartedContribution);
export { ChatGettingStartedContribution };
const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
    ...applicationConfigurationNodeBase,
    properties: {
        'workbench.panel.chat.view.experimental.showGettingStarted': {
            scope: 2 /* ConfigurationScope.MACHINE */,
            type: 'string',
            default: '',
            tags: ['experimental'],
            description: localize('workbench.panel.chat.view.showGettingStarted', "When enabled, shows a getting started experiments in the chat panel.")
        }
    }
});
