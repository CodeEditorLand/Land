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
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { IExtensionManagementService, IExtensionGalleryService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IExtensionIgnoredRecommendationsService } from '../../../services/extensionRecommendations/common/extensionRecommendations.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { shuffle } from '../../../../base/common/arrays.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { ExeBasedRecommendations } from './exeBasedRecommendations.js';
import { WorkspaceRecommendations } from './workspaceRecommendations.js';
import { FileBasedRecommendations } from './fileBasedRecommendations.js';
import { KeymapRecommendations } from './keymapRecommendations.js';
import { LanguageRecommendations } from './languageRecommendations.js';
import { ConfigBasedRecommendations } from './configBasedRecommendations.js';
import { IExtensionRecommendationNotificationService } from '../../../../platform/extensionRecommendations/common/extensionRecommendations.js';
import { timeout } from '../../../../base/common/async.js';
import { URI } from '../../../../base/common/uri.js';
import { WebRecommendations } from './webRecommendations.js';
import { IExtensionsWorkbenchService } from '../common/extensions.js';
import { areSameExtensions } from '../../../../platform/extensionManagement/common/extensionManagementUtil.js';
import { RemoteRecommendations } from './remoteRecommendations.js';
import { IRemoteExtensionsScannerService } from '../../../../platform/remote/common/remoteExtensionsScanner.js';
import { IUserDataInitializationService } from '../../../services/userData/browser/userDataInit.js';
import { isString } from '../../../../base/common/types.js';
let ExtensionRecommendationsService = class ExtensionRecommendationsService extends Disposable {
    constructor(instantiationService, lifecycleService, galleryService, telemetryService, environmentService, extensionManagementService, extensionRecommendationsManagementService, extensionRecommendationNotificationService, extensionsWorkbenchService, remoteExtensionsScannerService, userDataInitializationService) {
        super();
        this.lifecycleService = lifecycleService;
        this.galleryService = galleryService;
        this.telemetryService = telemetryService;
        this.environmentService = environmentService;
        this.extensionManagementService = extensionManagementService;
        this.extensionRecommendationsManagementService = extensionRecommendationsManagementService;
        this.extensionRecommendationNotificationService = extensionRecommendationNotificationService;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.remoteExtensionsScannerService = remoteExtensionsScannerService;
        this.userDataInitializationService = userDataInitializationService;
        this._onDidChangeRecommendations = this._register(new Emitter());
        this.onDidChangeRecommendations = this._onDidChangeRecommendations.event;
        this.workspaceRecommendations = this._register(instantiationService.createInstance(WorkspaceRecommendations));
        this.fileBasedRecommendations = this._register(instantiationService.createInstance(FileBasedRecommendations));
        this.configBasedRecommendations = this._register(instantiationService.createInstance(ConfigBasedRecommendations));
        this.exeBasedRecommendations = this._register(instantiationService.createInstance(ExeBasedRecommendations));
        this.keymapRecommendations = this._register(instantiationService.createInstance(KeymapRecommendations));
        this.webRecommendations = this._register(instantiationService.createInstance(WebRecommendations));
        this.languageRecommendations = this._register(instantiationService.createInstance(LanguageRecommendations));
        this.remoteRecommendations = this._register(instantiationService.createInstance(RemoteRecommendations));
        if (!this.isEnabled()) {
            this.sessionSeed = 0;
            this.activationPromise = Promise.resolve();
            return;
        }
        this.sessionSeed = +new Date();
        this.activationPromise = this.activate();
        this._register(this.extensionManagementService.onDidInstallExtensions(e => this.onDidInstallExtensions(e)));
    }
    async activate() {
        try {
            await Promise.allSettled([
                this.remoteExtensionsScannerService.whenExtensionsReady(),
                this.userDataInitializationService.whenInitializationFinished(),
                this.lifecycleService.when(3)
            ]);
        }
        catch (error) { }
        await Promise.all([
            this.workspaceRecommendations.activate(),
            this.configBasedRecommendations.activate(),
            this.fileBasedRecommendations.activate(),
            this.keymapRecommendations.activate(),
            this.languageRecommendations.activate(),
            this.webRecommendations.activate(),
            this.remoteRecommendations.activate()
        ]);
        this._register(Event.any(this.workspaceRecommendations.onDidChangeRecommendations, this.configBasedRecommendations.onDidChangeRecommendations, this.extensionRecommendationsManagementService.onDidChangeIgnoredRecommendations)(() => this._onDidChangeRecommendations.fire()));
        this._register(this.extensionRecommendationsManagementService.onDidChangeGlobalIgnoredRecommendation(({ extensionId, isRecommended }) => {
            if (!isRecommended) {
                const reason = this.getAllRecommendationsWithReason()[extensionId];
                if (reason && reason.reasonId) {
                    this.telemetryService.publicLog2('extensionsRecommendations:ignoreRecommendation', { extensionId, recommendationReason: reason.reasonId });
                }
            }
        }));
        this.promptWorkspaceRecommendations();
    }
    isEnabled() {
        return this.galleryService.isEnabled() && !this.environmentService.isExtensionDevelopment;
    }
    async activateProactiveRecommendations() {
        await Promise.all([this.exeBasedRecommendations.activate(), this.configBasedRecommendations.activate()]);
    }
    getAllRecommendationsWithReason() {
        this.activateProactiveRecommendations();
        const output = Object.create(null);
        const allRecommendations = [
            ...this.configBasedRecommendations.recommendations,
            ...this.exeBasedRecommendations.recommendations,
            ...this.fileBasedRecommendations.recommendations,
            ...this.workspaceRecommendations.recommendations,
            ...this.keymapRecommendations.recommendations,
            ...this.languageRecommendations.recommendations,
            ...this.webRecommendations.recommendations,
        ];
        for (const { extension, reason } of allRecommendations) {
            if (isString(extension) && this.isExtensionAllowedToBeRecommended(extension)) {
                output[extension.toLowerCase()] = reason;
            }
        }
        return output;
    }
    async getConfigBasedRecommendations() {
        await this.configBasedRecommendations.activate();
        return {
            important: this.toExtensionIds(this.configBasedRecommendations.importantRecommendations),
            others: this.toExtensionIds(this.configBasedRecommendations.otherRecommendations)
        };
    }
    async getOtherRecommendations() {
        await this.activationPromise;
        await this.activateProactiveRecommendations();
        const recommendations = [
            ...this.configBasedRecommendations.otherRecommendations,
            ...this.exeBasedRecommendations.otherRecommendations,
            ...this.webRecommendations.recommendations
        ];
        const extensionIds = this.toExtensionIds(recommendations);
        shuffle(extensionIds, this.sessionSeed);
        return extensionIds;
    }
    async getImportantRecommendations() {
        await this.activateProactiveRecommendations();
        const recommendations = [
            ...this.fileBasedRecommendations.importantRecommendations,
            ...this.configBasedRecommendations.importantRecommendations,
            ...this.exeBasedRecommendations.importantRecommendations,
        ];
        const extensionIds = this.toExtensionIds(recommendations);
        shuffle(extensionIds, this.sessionSeed);
        return extensionIds;
    }
    getKeymapRecommendations() {
        return this.toExtensionIds(this.keymapRecommendations.recommendations);
    }
    getLanguageRecommendations() {
        return this.toExtensionIds(this.languageRecommendations.recommendations);
    }
    getRemoteRecommendations() {
        return this.toExtensionIds(this.remoteRecommendations.recommendations);
    }
    async getWorkspaceRecommendations() {
        if (!this.isEnabled()) {
            return [];
        }
        await this.workspaceRecommendations.activate();
        const result = [];
        for (const { extension } of this.workspaceRecommendations.recommendations) {
            if (isString(extension)) {
                if (!result.includes(extension.toLowerCase()) && this.isExtensionAllowedToBeRecommended(extension)) {
                    result.push(extension.toLowerCase());
                }
            }
            else {
                result.push(extension);
            }
        }
        return result;
    }
    async getExeBasedRecommendations(exe) {
        await this.exeBasedRecommendations.activate();
        const { important, others } = exe ? this.exeBasedRecommendations.getRecommendations(exe)
            : { important: this.exeBasedRecommendations.importantRecommendations, others: this.exeBasedRecommendations.otherRecommendations };
        return { important: this.toExtensionIds(important), others: this.toExtensionIds(others) };
    }
    getFileBasedRecommendations() {
        return this.toExtensionIds(this.fileBasedRecommendations.recommendations);
    }
    onDidInstallExtensions(results) {
        for (const e of results) {
            if (e.source && !URI.isUri(e.source) && e.operation === 2) {
                const extRecommendations = this.getAllRecommendationsWithReason() || {};
                const recommendationReason = extRecommendations[e.source.identifier.id.toLowerCase()];
                if (recommendationReason) {
                    this.telemetryService.publicLog('extensionGallery:install:recommendations', { ...e.source.telemetryData, recommendationReason: recommendationReason.reasonId });
                }
            }
        }
    }
    toExtensionIds(recommendations) {
        const extensionIds = [];
        for (const { extension } of recommendations) {
            if (isString(extension) && this.isExtensionAllowedToBeRecommended(extension) && !extensionIds.includes(extension.toLowerCase())) {
                extensionIds.push(extension.toLowerCase());
            }
        }
        return extensionIds;
    }
    isExtensionAllowedToBeRecommended(extensionId) {
        return !this.extensionRecommendationsManagementService.ignoredRecommendations.includes(extensionId.toLowerCase());
    }
    async promptWorkspaceRecommendations() {
        const installed = await this.extensionsWorkbenchService.queryLocal();
        const allowedRecommendations = [
            ...this.workspaceRecommendations.recommendations,
            ...this.configBasedRecommendations.importantRecommendations.filter(recommendation => !recommendation.whenNotInstalled || recommendation.whenNotInstalled.every(id => installed.every(local => !areSameExtensions(local.identifier, { id }))))
        ]
            .map(({ extension }) => extension)
            .filter(extension => !isString(extension) || this.isExtensionAllowedToBeRecommended(extension));
        if (allowedRecommendations.length) {
            await this._registerP(timeout(5000));
            await this.extensionRecommendationNotificationService.promptWorkspaceRecommendations(allowedRecommendations);
        }
    }
    _registerP(o) {
        this._register(toDisposable(() => o.cancel()));
        return o;
    }
};
ExtensionRecommendationsService = __decorate([
    __param(0, IInstantiationService),
    __param(1, ILifecycleService),
    __param(2, IExtensionGalleryService),
    __param(3, ITelemetryService),
    __param(4, IEnvironmentService),
    __param(5, IExtensionManagementService),
    __param(6, IExtensionIgnoredRecommendationsService),
    __param(7, IExtensionRecommendationNotificationService),
    __param(8, IExtensionsWorkbenchService),
    __param(9, IRemoteExtensionsScannerService),
    __param(10, IUserDataInitializationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ExtensionRecommendationsService);
export { ExtensionRecommendationsService };
