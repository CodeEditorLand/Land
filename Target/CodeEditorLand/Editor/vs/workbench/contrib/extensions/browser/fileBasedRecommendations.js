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
import { ExtensionRecommendations } from './extensionRecommendations.js';
import { IExtensionIgnoredRecommendationsService } from '../../../services/extensionRecommendations/common/extensionRecommendations.js';
import { IExtensionsWorkbenchService } from '../common/extensions.js';
import { localize } from '../../../../nls.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Schemas } from '../../../../base/common/network.js';
import { basename, extname } from '../../../../base/common/resources.js';
import { match } from '../../../../base/common/glob.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IExtensionRecommendationNotificationService } from '../../../../platform/extensionRecommendations/common/extensionRecommendations.js';
import { distinct } from '../../../../base/common/arrays.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { CellUri } from '../../notebook/common/notebookCommon.js';
import { disposableTimeout } from '../../../../base/common/async.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { areSameExtensions } from '../../../../platform/extensionManagement/common/extensionManagementUtil.js';
import { isEmptyObject } from '../../../../base/common/types.js';
import { PLAINTEXT_LANGUAGE_ID } from '../../../../editor/common/languages/modesRegistry.js';
const promptedRecommendationsStorageKey = 'fileBasedRecommendations/promptedRecommendations';
const recommendationsStorageKey = 'extensionsAssistant/recommendations';
const milliSecondsInADay = 1000 * 60 * 60 * 24;
let FileBasedRecommendations = class FileBasedRecommendations extends ExtensionRecommendations {
    get recommendations() {
        const recommendations = [];
        [...this.fileBasedRecommendations.keys()]
            .sort((a, b) => {
            if (this.fileBasedRecommendations.get(a).recommendedTime === this.fileBasedRecommendations.get(b).recommendedTime) {
                if (this.fileBasedImportantRecommendations.has(a)) {
                    return -1;
                }
                if (this.fileBasedImportantRecommendations.has(b)) {
                    return 1;
                }
            }
            return this.fileBasedRecommendations.get(a).recommendedTime > this.fileBasedRecommendations.get(b).recommendedTime ? -1 : 1;
        })
            .forEach(extensionId => {
            recommendations.push({
                extension: extensionId,
                reason: {
                    reasonId: 1 /* ExtensionRecommendationReason.File */,
                    reasonText: localize('fileBasedRecommendation', "This extension is recommended based on the files you recently opened.")
                }
            });
        });
        return recommendations;
    }
    get importantRecommendations() {
        return this.recommendations.filter(e => this.fileBasedImportantRecommendations.has(e.extension));
    }
    get otherRecommendations() {
        return this.recommendations.filter(e => !this.fileBasedImportantRecommendations.has(e.extension));
    }
    constructor(extensionsWorkbenchService, modelService, languageService, productService, storageService, extensionRecommendationNotificationService, extensionIgnoredRecommendationsService, workspaceContextService) {
        super();
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.modelService = modelService;
        this.languageService = languageService;
        this.storageService = storageService;
        this.extensionRecommendationNotificationService = extensionRecommendationNotificationService;
        this.extensionIgnoredRecommendationsService = extensionIgnoredRecommendationsService;
        this.workspaceContextService = workspaceContextService;
        this.recommendationsByPattern = new Map();
        this.fileBasedRecommendations = new Map();
        this.fileBasedImportantRecommendations = new Set();
        this.fileOpenRecommendations = {};
        if (productService.extensionRecommendations) {
            for (const [extensionId, recommendation] of Object.entries(productService.extensionRecommendations)) {
                if (recommendation.onFileOpen) {
                    this.fileOpenRecommendations[extensionId.toLowerCase()] = recommendation.onFileOpen;
                }
            }
        }
    }
    async doActivate() {
        if (isEmptyObject(this.fileOpenRecommendations)) {
            return;
        }
        await this.extensionsWorkbenchService.whenInitialized;
        const cachedRecommendations = this.getCachedRecommendations();
        const now = Date.now();
        // Retire existing recommendations if they are older than a week or are not part of this.productService.extensionTips anymore
        Object.entries(cachedRecommendations).forEach(([key, value]) => {
            const diff = (now - value) / milliSecondsInADay;
            if (diff <= 7 && this.fileOpenRecommendations[key]) {
                this.fileBasedRecommendations.set(key.toLowerCase(), { recommendedTime: value });
            }
        });
        this._register(this.modelService.onModelAdded(model => this.onModelAdded(model)));
        this.modelService.getModels().forEach(model => this.onModelAdded(model));
    }
    onModelAdded(model) {
        const uri = model.uri.scheme === Schemas.vscodeNotebookCell ? CellUri.parse(model.uri)?.notebook : model.uri;
        if (!uri) {
            return;
        }
        const supportedSchemes = distinct([Schemas.untitled, Schemas.file, Schemas.vscodeRemote, ...this.workspaceContextService.getWorkspace().folders.map(folder => folder.uri.scheme)]);
        if (!uri || !supportedSchemes.includes(uri.scheme)) {
            return;
        }
        // re-schedule this bit of the operation to be off the critical path - in case glob-match is slow
        disposableTimeout(() => this.promptImportantRecommendations(uri, model), 0, this._store);
    }
    /**
     * Prompt the user to either install the recommended extension for the file type in the current editor model
     * or prompt to search the marketplace if it has extensions that can support the file type
     */
    promptImportantRecommendations(uri, model, extensionRecommendations) {
        if (model.isDisposed()) {
            return;
        }
        const pattern = extname(uri).toLowerCase();
        extensionRecommendations = extensionRecommendations ?? this.recommendationsByPattern.get(pattern) ?? this.fileOpenRecommendations;
        const extensionRecommendationEntries = Object.entries(extensionRecommendations);
        if (extensionRecommendationEntries.length === 0) {
            return;
        }
        const processedPathGlobs = new Map();
        const installed = this.extensionsWorkbenchService.local;
        const recommendationsByPattern = {};
        const matchedRecommendations = {};
        const unmatchedRecommendations = {};
        let listenOnLanguageChange = false;
        const languageId = model.getLanguageId();
        for (const [extensionId, conditions] of extensionRecommendationEntries) {
            const conditionsByPattern = [];
            const matchedConditions = [];
            const unmatchedConditions = [];
            for (const condition of conditions) {
                let languageMatched = false;
                let pathGlobMatched = false;
                const isLanguageCondition = !!condition.languages;
                const isFileContentCondition = !!condition.contentPattern;
                if (isLanguageCondition || isFileContentCondition) {
                    conditionsByPattern.push(condition);
                }
                if (isLanguageCondition) {
                    if (condition.languages.includes(languageId)) {
                        languageMatched = true;
                    }
                }
                if (condition.pathGlob) {
                    const pathGlob = condition.pathGlob;
                    if (processedPathGlobs.get(pathGlob) ?? match(condition.pathGlob, uri.with({ fragment: '' }).toString())) {
                        pathGlobMatched = true;
                    }
                    processedPathGlobs.set(pathGlob, pathGlobMatched);
                }
                let matched = languageMatched || pathGlobMatched;
                // If the resource has pattern (extension) and not matched, then we don't need to check the other conditions
                if (pattern && !matched) {
                    continue;
                }
                if (matched && condition.whenInstalled) {
                    if (!condition.whenInstalled.every(id => installed.some(local => areSameExtensions({ id }, local.identifier)))) {
                        matched = false;
                    }
                }
                if (matched && condition.whenNotInstalled) {
                    if (installed.some(local => condition.whenNotInstalled?.some(id => areSameExtensions({ id }, local.identifier)))) {
                        matched = false;
                    }
                }
                if (matched && isFileContentCondition) {
                    if (!model.findMatches(condition.contentPattern, false, true, false, null, false).length) {
                        matched = false;
                    }
                }
                if (matched) {
                    matchedConditions.push(condition);
                    conditionsByPattern.pop();
                }
                else {
                    if (isLanguageCondition || isFileContentCondition) {
                        unmatchedConditions.push(condition);
                        if (isLanguageCondition) {
                            listenOnLanguageChange = true;
                        }
                    }
                }
            }
            if (matchedConditions.length) {
                matchedRecommendations[extensionId] = matchedConditions;
            }
            if (unmatchedConditions.length) {
                unmatchedRecommendations[extensionId] = unmatchedConditions;
            }
            if (conditionsByPattern.length) {
                recommendationsByPattern[extensionId] = conditionsByPattern;
            }
        }
        if (pattern) {
            this.recommendationsByPattern.set(pattern, recommendationsByPattern);
        }
        if (Object.keys(unmatchedRecommendations).length) {
            if (listenOnLanguageChange) {
                const disposables = new DisposableStore();
                disposables.add(model.onDidChangeLanguage(() => {
                    // re-schedule this bit of the operation to be off the critical path - in case glob-match is slow
                    disposableTimeout(() => {
                        if (!disposables.isDisposed) {
                            this.promptImportantRecommendations(uri, model, unmatchedRecommendations);
                            disposables.dispose();
                        }
                    }, 0, disposables);
                }));
                disposables.add(model.onWillDispose(() => disposables.dispose()));
            }
        }
        if (Object.keys(matchedRecommendations).length) {
            this.promptFromRecommendations(uri, model, matchedRecommendations);
        }
    }
    promptFromRecommendations(uri, model, extensionRecommendations) {
        let isImportantRecommendationForLanguage = false;
        const importantRecommendations = new Set();
        const fileBasedRecommendations = new Set();
        for (const [extensionId, conditions] of Object.entries(extensionRecommendations)) {
            for (const condition of conditions) {
                fileBasedRecommendations.add(extensionId);
                if (condition.important) {
                    importantRecommendations.add(extensionId);
                    this.fileBasedImportantRecommendations.add(extensionId);
                }
                if (condition.languages) {
                    isImportantRecommendationForLanguage = true;
                }
            }
        }
        // Update file based recommendations
        for (const recommendation of fileBasedRecommendations) {
            const filedBasedRecommendation = this.fileBasedRecommendations.get(recommendation) || { recommendedTime: Date.now(), sources: [] };
            filedBasedRecommendation.recommendedTime = Date.now();
            this.fileBasedRecommendations.set(recommendation, filedBasedRecommendation);
        }
        this.storeCachedRecommendations();
        if (this.extensionRecommendationNotificationService.hasToIgnoreRecommendationNotifications()) {
            return;
        }
        const language = model.getLanguageId();
        const languageName = this.languageService.getLanguageName(language);
        if (importantRecommendations.size &&
            this.promptRecommendedExtensionForFileType(languageName && isImportantRecommendationForLanguage && language !== PLAINTEXT_LANGUAGE_ID ? localize('languageName', "the {0} language", languageName) : basename(uri), language, [...importantRecommendations])) {
            return;
        }
    }
    promptRecommendedExtensionForFileType(name, language, recommendations) {
        recommendations = this.filterIgnoredOrNotAllowed(recommendations);
        if (recommendations.length === 0) {
            return false;
        }
        recommendations = this.filterInstalled(recommendations, this.extensionsWorkbenchService.local)
            .filter(extensionId => this.fileBasedImportantRecommendations.has(extensionId));
        const promptedRecommendations = language !== PLAINTEXT_LANGUAGE_ID ? this.getPromptedRecommendations()[language] : undefined;
        if (promptedRecommendations) {
            recommendations = recommendations.filter(extensionId => promptedRecommendations.includes(extensionId));
        }
        if (recommendations.length === 0) {
            return false;
        }
        this.promptImportantExtensionsInstallNotification(recommendations, name, language);
        return true;
    }
    async promptImportantExtensionsInstallNotification(extensions, name, language) {
        try {
            const result = await this.extensionRecommendationNotificationService.promptImportantExtensionsInstallNotification({ extensions, name, source: 1 /* RecommendationSource.FILE */ });
            if (result === "reacted" /* RecommendationsNotificationResult.Accepted */) {
                this.addToPromptedRecommendations(language, extensions);
            }
        }
        catch (error) { /* Ignore */ }
    }
    getPromptedRecommendations() {
        return JSON.parse(this.storageService.get(promptedRecommendationsStorageKey, 0 /* StorageScope.PROFILE */, '{}'));
    }
    addToPromptedRecommendations(language, extensions) {
        const promptedRecommendations = this.getPromptedRecommendations();
        promptedRecommendations[language] = distinct([...(promptedRecommendations[language] ?? []), ...extensions]);
        this.storageService.store(promptedRecommendationsStorageKey, JSON.stringify(promptedRecommendations), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
    }
    filterIgnoredOrNotAllowed(recommendationsToSuggest) {
        const ignoredRecommendations = [...this.extensionIgnoredRecommendationsService.ignoredRecommendations, ...this.extensionRecommendationNotificationService.ignoredRecommendations];
        return recommendationsToSuggest.filter(id => !ignoredRecommendations.includes(id));
    }
    filterInstalled(recommendationsToSuggest, installed) {
        const installedExtensionsIds = installed.reduce((result, i) => {
            if (i.enablementState !== 1 /* EnablementState.DisabledByExtensionKind */) {
                result.add(i.identifier.id.toLowerCase());
            }
            return result;
        }, new Set());
        return recommendationsToSuggest.filter(id => !installedExtensionsIds.has(id.toLowerCase()));
    }
    getCachedRecommendations() {
        let storedRecommendations = JSON.parse(this.storageService.get(recommendationsStorageKey, 0 /* StorageScope.PROFILE */, '[]'));
        if (Array.isArray(storedRecommendations)) {
            storedRecommendations = storedRecommendations.reduce((result, id) => { result[id] = Date.now(); return result; }, {});
        }
        const result = {};
        Object.entries(storedRecommendations).forEach(([key, value]) => {
            if (typeof value === 'number') {
                result[key.toLowerCase()] = value;
            }
        });
        return result;
    }
    storeCachedRecommendations() {
        const storedRecommendations = {};
        this.fileBasedRecommendations.forEach((value, key) => storedRecommendations[key] = value.recommendedTime);
        this.storageService.store(recommendationsStorageKey, JSON.stringify(storedRecommendations), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
    }
};
FileBasedRecommendations = __decorate([
    __param(0, IExtensionsWorkbenchService),
    __param(1, IModelService),
    __param(2, ILanguageService),
    __param(3, IProductService),
    __param(4, IStorageService),
    __param(5, IExtensionRecommendationNotificationService),
    __param(6, IExtensionIgnoredRecommendationsService),
    __param(7, IWorkspaceContextService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], FileBasedRecommendations);
export { FileBasedRecommendations };
