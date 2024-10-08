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
var LanguageModelStatsService_1;
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { Extensions, IExtensionFeaturesManagementService } from '../../../services/extensionManagement/common/extensionFeatures.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { localize } from '../../../../nls.js';
export const ILanguageModelStatsService = createDecorator('ILanguageModelStatsService');
let LanguageModelStatsService = class LanguageModelStatsService extends Disposable {
    static { LanguageModelStatsService_1 = this; }
    static { this.MODEL_STATS_STORAGE_KEY_PREFIX = 'languageModelStats.'; }
    static { this.MODEL_ACCESS_STORAGE_KEY_PREFIX = 'languageModelAccess.'; }
    constructor(extensionFeaturesManagementService, _storageService) {
        super();
        this.extensionFeaturesManagementService = extensionFeaturesManagementService;
        this._storageService = _storageService;
        this._onDidChangeStats = this._register(new Emitter());
        this.onDidChangeLanguageMoelStats = this._onDidChangeStats.event;
        this.sessionStats = new Map();
        this._register(_storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, undefined, this._store)(e => {
            const model = this.getModel(e.key);
            if (model) {
                this._onDidChangeStats.fire(model);
            }
        }));
    }
    hasAccessedModel(extensionId, model) {
        return this.getAccessExtensions(model).includes(extensionId.toLowerCase());
    }
    async update(model, extensionId, agent, tokenCount) {
        await this.extensionFeaturesManagementService.getAccess(extensionId, 'languageModels');
        // update model access
        this.addAccess(model, extensionId.value);
        // update session stats
        let sessionStats = this.sessionStats.get(model);
        if (!sessionStats) {
            sessionStats = { extensions: [] };
            this.sessionStats.set(model, sessionStats);
        }
        this.add(sessionStats, extensionId.value, agent, tokenCount);
        this.write(model, extensionId.value, agent, tokenCount);
        this._onDidChangeStats.fire(model);
    }
    addAccess(model, extensionId) {
        extensionId = extensionId.toLowerCase();
        const extensions = this.getAccessExtensions(model);
        if (!extensions.includes(extensionId)) {
            extensions.push(extensionId);
            this._storageService.store(this.getAccessKey(model), JSON.stringify(extensions), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        }
    }
    getAccessExtensions(model) {
        const key = this.getAccessKey(model);
        const data = this._storageService.get(key, -1 /* StorageScope.APPLICATION */);
        try {
            if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        }
        catch (e) {
            // ignore
        }
        return [];
    }
    async write(model, extensionId, participant, tokenCount) {
        const modelStats = await this.read(model);
        this.add(modelStats, extensionId, participant, tokenCount);
        this._storageService.store(this.getKey(model), JSON.stringify(modelStats), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
    }
    add(modelStats, extensionId, participant, tokenCount) {
        let extensionStats = modelStats.extensions.find(e => ExtensionIdentifier.equals(e.extensionId, extensionId));
        if (!extensionStats) {
            extensionStats = { extensionId, requestCount: 0, tokenCount: 0, participants: [] };
            modelStats.extensions.push(extensionStats);
        }
        if (participant) {
            let participantStats = extensionStats.participants.find(p => p.id === participant);
            if (!participantStats) {
                participantStats = { id: participant, requestCount: 0, tokenCount: 0 };
                extensionStats.participants.push(participantStats);
            }
            participantStats.requestCount++;
            participantStats.tokenCount += tokenCount ?? 0;
        }
        else {
            extensionStats.requestCount++;
            extensionStats.tokenCount += tokenCount ?? 0;
        }
    }
    async read(model) {
        try {
            const value = this._storageService.get(this.getKey(model), -1 /* StorageScope.APPLICATION */);
            if (value) {
                return JSON.parse(value);
            }
        }
        catch (error) {
            // ignore
        }
        return { extensions: [] };
    }
    getModel(key) {
        if (key.startsWith(LanguageModelStatsService_1.MODEL_STATS_STORAGE_KEY_PREFIX)) {
            return key.substring(LanguageModelStatsService_1.MODEL_STATS_STORAGE_KEY_PREFIX.length);
        }
        return undefined;
    }
    getKey(model) {
        return `${LanguageModelStatsService_1.MODEL_STATS_STORAGE_KEY_PREFIX}${model}`;
    }
    getAccessKey(model) {
        return `${LanguageModelStatsService_1.MODEL_ACCESS_STORAGE_KEY_PREFIX}${model}`;
    }
};
LanguageModelStatsService = LanguageModelStatsService_1 = __decorate([
    __param(0, IExtensionFeaturesManagementService),
    __param(1, IStorageService),
    __metadata("design:paramtypes", [Object, Object])
], LanguageModelStatsService);
export { LanguageModelStatsService };
Registry.as(Extensions.ExtensionFeaturesRegistry).registerExtensionFeature({
    id: 'languageModels',
    label: localize('Language Models', "Language Models"),
    description: localize('languageModels', "Language models usage statistics of this extension."),
    access: {
        canToggle: false
    },
});
