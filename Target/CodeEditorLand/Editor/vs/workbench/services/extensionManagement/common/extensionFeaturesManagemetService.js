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
import { Emitter } from '../../../../base/common/event.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Extensions, IExtensionFeaturesManagementService } from './extensionFeatures.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { isBoolean } from '../../../../base/common/types.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { localize } from '../../../../nls.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { distinct } from '../../../../base/common/arrays.js';
import { equals } from '../../../../base/common/objects.js';
const FEATURES_STATE_KEY = 'extension.features.state';
let ExtensionFeaturesManagementService = class ExtensionFeaturesManagementService extends Disposable {
    constructor(storageService, dialogService, extensionService) {
        super();
        this.storageService = storageService;
        this.dialogService = dialogService;
        this.extensionService = extensionService;
        this._onDidChangeEnablement = this._register(new Emitter());
        this.onDidChangeEnablement = this._onDidChangeEnablement.event;
        this._onDidChangeAccessData = this._register(new Emitter());
        this.onDidChangeAccessData = this._onDidChangeAccessData.event;
        this.extensionFeaturesState = new Map();
        this.registry = Registry.as(Extensions.ExtensionFeaturesRegistry);
        this.extensionFeaturesState = this.loadState();
        this._register(storageService.onDidChangeValue(0, FEATURES_STATE_KEY, this._store)(e => this.onDidStorageChange(e)));
    }
    isEnabled(extension, featureId) {
        const feature = this.registry.getExtensionFeature(featureId);
        if (!feature) {
            return false;
        }
        const isDisabled = this.getExtensionFeatureState(extension, featureId)?.disabled;
        if (isBoolean(isDisabled)) {
            return !isDisabled;
        }
        const defaultExtensionAccess = feature.access.extensionsList?.[extension.value];
        if (isBoolean(defaultExtensionAccess)) {
            return defaultExtensionAccess;
        }
        return !feature.access.requireUserConsent;
    }
    setEnablement(extension, featureId, enabled) {
        const feature = this.registry.getExtensionFeature(featureId);
        if (!feature) {
            throw new Error(`No feature with id '${featureId}'`);
        }
        const featureState = this.getAndSetIfNotExistsExtensionFeatureState(extension, featureId);
        if (featureState.disabled !== !enabled) {
            featureState.disabled = !enabled;
            this._onDidChangeEnablement.fire({ extension, featureId, enabled });
            this.saveState();
        }
    }
    getEnablementData(featureId) {
        const result = [];
        const feature = this.registry.getExtensionFeature(featureId);
        if (feature) {
            for (const [extension, featuresStateMap] of this.extensionFeaturesState) {
                const featureState = featuresStateMap.get(featureId);
                if (featureState?.disabled !== undefined) {
                    result.push({ extension: new ExtensionIdentifier(extension), enabled: !featureState.disabled });
                }
            }
        }
        return result;
    }
    async getAccess(extension, featureId, justification) {
        const feature = this.registry.getExtensionFeature(featureId);
        if (!feature) {
            return false;
        }
        const featureState = this.getAndSetIfNotExistsExtensionFeatureState(extension, featureId);
        if (featureState.disabled) {
            return false;
        }
        if (featureState.disabled === undefined) {
            let enabled = true;
            if (feature.access.requireUserConsent) {
                const extensionDescription = this.extensionService.extensions.find(e => ExtensionIdentifier.equals(e.identifier, extension));
                const confirmationResult = await this.dialogService.confirm({
                    title: localize('accessExtensionFeature', "Access '{0}' Feature", feature.label),
                    message: localize('accessExtensionFeatureMessage', "'{0}' extension would like to access the '{1}' feature.", extensionDescription?.displayName ?? extension.value, feature.label),
                    detail: justification ?? feature.description,
                    custom: true,
                    primaryButton: localize('allow', "Allow"),
                    cancelButton: localize('disallow', "Don't Allow"),
                });
                enabled = confirmationResult.confirmed;
            }
            this.setEnablement(extension, featureId, enabled);
            if (!enabled) {
                return false;
            }
        }
        featureState.accessData.current = {
            count: featureState.accessData.current?.count ? featureState.accessData.current?.count + 1 : 1,
            lastAccessed: Date.now(),
            status: featureState.accessData.current?.status
        };
        featureState.accessData.totalCount = featureState.accessData.totalCount + 1;
        this.saveState();
        this._onDidChangeAccessData.fire({ extension, featureId, accessData: featureState.accessData });
        return true;
    }
    getAccessData(extension, featureId) {
        const feature = this.registry.getExtensionFeature(featureId);
        if (!feature) {
            return;
        }
        return this.getExtensionFeatureState(extension, featureId)?.accessData;
    }
    setStatus(extension, featureId, status) {
        const feature = this.registry.getExtensionFeature(featureId);
        if (!feature) {
            throw new Error(`No feature with id '${featureId}'`);
        }
        const featureState = this.getAndSetIfNotExistsExtensionFeatureState(extension, featureId);
        featureState.accessData.current = {
            count: featureState.accessData.current?.count ?? 0,
            lastAccessed: featureState.accessData.current?.lastAccessed ?? 0,
            status
        };
        this._onDidChangeAccessData.fire({ extension, featureId, accessData: this.getAccessData(extension, featureId) });
    }
    getExtensionFeatureState(extension, featureId) {
        return this.extensionFeaturesState.get(extension.value)?.get(featureId);
    }
    getAndSetIfNotExistsExtensionFeatureState(extension, featureId) {
        let extensionState = this.extensionFeaturesState.get(extension.value);
        if (!extensionState) {
            extensionState = new Map();
            this.extensionFeaturesState.set(extension.value, extensionState);
        }
        let featureState = extensionState.get(featureId);
        if (!featureState) {
            featureState = { accessData: { totalCount: 0 } };
            extensionState.set(featureId, featureState);
        }
        return featureState;
    }
    onDidStorageChange(e) {
        if (e.external) {
            const oldState = this.extensionFeaturesState;
            this.extensionFeaturesState = this.loadState();
            for (const extensionId of distinct([...oldState.keys(), ...this.extensionFeaturesState.keys()])) {
                const extension = new ExtensionIdentifier(extensionId);
                const oldExtensionFeaturesState = oldState.get(extensionId);
                const newExtensionFeaturesState = this.extensionFeaturesState.get(extensionId);
                for (const featureId of distinct([...oldExtensionFeaturesState?.keys() ?? [], ...newExtensionFeaturesState?.keys() ?? []])) {
                    const isEnabled = this.isEnabled(extension, featureId);
                    const wasEnabled = !oldExtensionFeaturesState?.get(featureId)?.disabled;
                    if (isEnabled !== wasEnabled) {
                        this._onDidChangeEnablement.fire({ extension, featureId, enabled: isEnabled });
                    }
                    const newAccessData = this.getAccessData(extension, featureId);
                    const oldAccessData = oldExtensionFeaturesState?.get(featureId)?.accessData;
                    if (!equals(newAccessData, oldAccessData)) {
                        this._onDidChangeAccessData.fire({ extension, featureId, accessData: newAccessData ?? { totalCount: 0 } });
                    }
                }
            }
        }
    }
    loadState() {
        let data = {};
        const raw = this.storageService.get(FEATURES_STATE_KEY, 0, '{}');
        try {
            data = JSON.parse(raw);
        }
        catch (e) {
        }
        const result = new Map();
        for (const extensionId in data) {
            const extensionFeatureState = new Map();
            const extensionFeatures = data[extensionId];
            for (const featureId in extensionFeatures) {
                const extensionFeature = extensionFeatures[featureId];
                extensionFeatureState.set(featureId, {
                    disabled: extensionFeature.disabled,
                    accessData: {
                        totalCount: extensionFeature.accessCount
                    }
                });
            }
            result.set(extensionId, extensionFeatureState);
        }
        return result;
    }
    saveState() {
        const data = {};
        this.extensionFeaturesState.forEach((extensionState, extensionId) => {
            const extensionFeatures = {};
            extensionState.forEach((featureState, featureId) => {
                extensionFeatures[featureId] = {
                    disabled: featureState.disabled,
                    accessCount: featureState.accessData.totalCount
                };
            });
            data[extensionId] = extensionFeatures;
        });
        this.storageService.store(FEATURES_STATE_KEY, JSON.stringify(data), 0, 0);
    }
};
ExtensionFeaturesManagementService = __decorate([
    __param(0, IStorageService),
    __param(1, IDialogService),
    __param(2, IExtensionService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ExtensionFeaturesManagementService);
registerSingleton(IExtensionFeaturesManagementService, ExtensionFeaturesManagementService, 1);
