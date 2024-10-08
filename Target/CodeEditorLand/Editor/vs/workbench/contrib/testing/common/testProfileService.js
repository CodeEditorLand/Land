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
import { Emitter } from '../../../../base/common/event.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { deepClone } from '../../../../base/common/objects.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { StoredValue } from './storedValue.js';
import { TestId } from './testId.js';
import { testRunProfileBitsetList } from './testTypes.js';
import { TestingContextKeys } from './testingContextKeys.js';
export const ITestProfileService = createDecorator('testProfileService');
/**
 * Gets whether the given profile can be used to run the test.
 */
export const canUseProfileWithTest = (profile, test) => profile.controllerId === test.controllerId && (TestId.isRoot(test.item.extId) || !profile.tag || test.item.tags.includes(profile.tag));
const sorter = (a, b) => {
    if (a.isDefault !== b.isDefault) {
        return a.isDefault ? -1 : 1;
    }
    return a.label.localeCompare(b.label);
};
/**
 * Given a capabilities bitset, returns a map of context keys representing
 * them.
 */
export const capabilityContextKeys = (capabilities) => [
    [TestingContextKeys.hasRunnableTests.key, (capabilities & 2 /* TestRunProfileBitset.Run */) !== 0],
    [TestingContextKeys.hasDebuggableTests.key, (capabilities & 4 /* TestRunProfileBitset.Debug */) !== 0],
    [TestingContextKeys.hasCoverableTests.key, (capabilities & 8 /* TestRunProfileBitset.Coverage */) !== 0],
];
let TestProfileService = class TestProfileService extends Disposable {
    constructor(contextKeyService, storageService) {
        super();
        this.changeEmitter = this._register(new Emitter());
        this.controllerProfiles = new Map();
        /** @inheritdoc */
        this.onDidChange = this.changeEmitter.event;
        storageService.remove('testingPreferredProfiles', 1 /* StorageScope.WORKSPACE */); // cleanup old format
        this.userDefaults = this._register(new StoredValue({
            key: 'testingPreferredProfiles2',
            scope: 1 /* StorageScope.WORKSPACE */,
            target: 1 /* StorageTarget.MACHINE */,
        }, storageService));
        this.capabilitiesContexts = {
            [2 /* TestRunProfileBitset.Run */]: TestingContextKeys.hasRunnableTests.bindTo(contextKeyService),
            [4 /* TestRunProfileBitset.Debug */]: TestingContextKeys.hasDebuggableTests.bindTo(contextKeyService),
            [8 /* TestRunProfileBitset.Coverage */]: TestingContextKeys.hasCoverableTests.bindTo(contextKeyService),
            [16 /* TestRunProfileBitset.HasNonDefaultProfile */]: TestingContextKeys.hasNonDefaultProfile.bindTo(contextKeyService),
            [32 /* TestRunProfileBitset.HasConfigurable */]: TestingContextKeys.hasConfigurableProfile.bindTo(contextKeyService),
            [64 /* TestRunProfileBitset.SupportsContinuousRun */]: TestingContextKeys.supportsContinuousRun.bindTo(contextKeyService),
        };
        this.refreshContextKeys();
    }
    /** @inheritdoc */
    addProfile(controller, profile) {
        const previousExplicitDefaultValue = this.userDefaults.get()?.[controller.id]?.[profile.profileId];
        const extended = {
            ...profile,
            isDefault: previousExplicitDefaultValue ?? profile.isDefault,
            wasInitiallyDefault: profile.isDefault,
        };
        let record = this.controllerProfiles.get(profile.controllerId);
        if (record) {
            record.profiles.push(extended);
            record.profiles.sort(sorter);
        }
        else {
            record = {
                profiles: [extended],
                controller,
            };
            this.controllerProfiles.set(profile.controllerId, record);
        }
        this.refreshContextKeys();
        this.changeEmitter.fire();
    }
    /** @inheritdoc */
    updateProfile(controllerId, profileId, update) {
        const ctrl = this.controllerProfiles.get(controllerId);
        if (!ctrl) {
            return;
        }
        const profile = ctrl.profiles.find(c => c.controllerId === controllerId && c.profileId === profileId);
        if (!profile) {
            return;
        }
        Object.assign(profile, update);
        ctrl.profiles.sort(sorter);
        // store updates is isDefault as if the user changed it (which they might
        // have through some extension-contributed UI)
        if (update.isDefault !== undefined) {
            const map = deepClone(this.userDefaults.get({}));
            setIsDefault(map, profile, update.isDefault);
            this.userDefaults.store(map);
        }
        this.changeEmitter.fire();
    }
    /** @inheritdoc */
    configure(controllerId, profileId) {
        this.controllerProfiles.get(controllerId)?.controller.configureRunProfile(profileId);
    }
    /** @inheritdoc */
    removeProfile(controllerId, profileId) {
        const ctrl = this.controllerProfiles.get(controllerId);
        if (!ctrl) {
            return;
        }
        if (!profileId) {
            this.controllerProfiles.delete(controllerId);
            this.changeEmitter.fire();
            return;
        }
        const index = ctrl.profiles.findIndex(c => c.profileId === profileId);
        if (index === -1) {
            return;
        }
        ctrl.profiles.splice(index, 1);
        this.refreshContextKeys();
        this.changeEmitter.fire();
    }
    /** @inheritdoc */
    capabilitiesForTest(test) {
        const ctrl = this.controllerProfiles.get(TestId.root(test.extId));
        if (!ctrl) {
            return 0;
        }
        let capabilities = 0;
        for (const profile of ctrl.profiles) {
            if (!profile.tag || test.tags.includes(profile.tag)) {
                capabilities |= capabilities & profile.group ? 16 /* TestRunProfileBitset.HasNonDefaultProfile */ : profile.group;
            }
        }
        return capabilities;
    }
    /** @inheritdoc */
    all() {
        return this.controllerProfiles.values();
    }
    /** @inheritdoc */
    getControllerProfiles(profileId) {
        return this.controllerProfiles.get(profileId)?.profiles ?? [];
    }
    /** @inheritdoc */
    getGroupDefaultProfiles(group, controllerId) {
        const allProfiles = controllerId
            ? (this.controllerProfiles.get(controllerId)?.profiles || [])
            : [...Iterable.flatMap(this.controllerProfiles.values(), c => c.profiles)];
        const defaults = allProfiles.filter(c => c.group === group && c.isDefault);
        // have *some* default profile to run if none are set otherwise
        if (defaults.length === 0) {
            const first = allProfiles.find(p => p.group === group);
            if (first) {
                defaults.push(first);
            }
        }
        return defaults;
    }
    /** @inheritdoc */
    setGroupDefaultProfiles(group, profiles) {
        const next = {};
        for (const ctrl of this.controllerProfiles.values()) {
            next[ctrl.controller.id] = {};
            for (const profile of ctrl.profiles) {
                if (profile.group !== group) {
                    continue;
                }
                setIsDefault(next, profile, profiles.some(p => p.profileId === profile.profileId));
            }
            // When switching a profile, if the controller has a same-named profile in
            // other groups, update those to match the enablement state as well.
            for (const profile of ctrl.profiles) {
                if (profile.group === group) {
                    continue;
                }
                const matching = ctrl.profiles.find(p => p.group === group && p.label === profile.label);
                if (matching) {
                    setIsDefault(next, profile, matching.isDefault);
                }
            }
            ctrl.profiles.sort(sorter);
        }
        this.userDefaults.store(next);
        this.changeEmitter.fire();
    }
    getDefaultProfileForTest(group, test) {
        return this.getControllerProfiles(test.controllerId).find(p => (p.group & group) !== 0 && canUseProfileWithTest(p, test));
    }
    refreshContextKeys() {
        let allCapabilities = 0;
        for (const { profiles } of this.controllerProfiles.values()) {
            for (const profile of profiles) {
                allCapabilities |= allCapabilities & profile.group ? 16 /* TestRunProfileBitset.HasNonDefaultProfile */ : profile.group;
                allCapabilities |= profile.supportsContinuousRun ? 64 /* TestRunProfileBitset.SupportsContinuousRun */ : 0;
            }
        }
        for (const group of testRunProfileBitsetList) {
            this.capabilitiesContexts[group].set((allCapabilities & group) !== 0);
        }
    }
};
TestProfileService = __decorate([
    __param(0, IContextKeyService),
    __param(1, IStorageService),
    __metadata("design:paramtypes", [Object, Object])
], TestProfileService);
export { TestProfileService };
const setIsDefault = (map, profile, isDefault) => {
    profile.isDefault = isDefault;
    map[profile.controllerId] ??= {};
    if (profile.isDefault !== profile.wasInitiallyDefault) {
        map[profile.controllerId][profile.profileId] = profile.isDefault;
    }
    else {
        delete map[profile.controllerId][profile.profileId];
    }
};
