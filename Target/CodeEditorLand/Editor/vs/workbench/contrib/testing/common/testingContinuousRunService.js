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
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { Disposable, DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { StoredValue } from './storedValue.js';
import { TestingContextKeys } from './testingContextKeys.js';
import { ITestService } from './testService.js';
import { TestService } from './testServiceImpl.js';
import { Emitter } from '../../../../base/common/event.js';
import { TestId } from './testId.js';
import { WellDefinedPrefixTree } from '../../../../base/common/prefixTree.js';
import { ITestProfileService } from './testProfileService.js';
import * as arrays from '../../../../base/common/arrays.js';
export const ITestingContinuousRunService = createDecorator('testingContinuousRunService');
let TestingContinuousRunService = class TestingContinuousRunService extends Disposable {
    get lastRunProfileIds() {
        return this.lastRun.get(new Set());
    }
    constructor(testService, storageService, contextKeyService, testProfileService) {
        super();
        this.testService = testService;
        this.testProfileService = testProfileService;
        this.changeEmitter = new Emitter();
        this.running = new WellDefinedPrefixTree();
        this.onDidChange = this.changeEmitter.event;
        this.isGloballyOn = TestingContextKeys.isContinuousModeOn.bindTo(contextKeyService);
        this.lastRun = this._register(new StoredValue({
            key: 'lastContinuousRunProfileIds',
            scope: 1,
            target: 1,
            serialization: {
                deserialize: v => new Set(JSON.parse(v)),
                serialize: v => JSON.stringify([...v])
            },
        }, storageService));
        this._register(toDisposable(() => {
            this.globallyRunning?.dispose();
            for (const cts of this.running.values()) {
                cts.dispose();
            }
        }));
    }
    isSpecificallyEnabledFor(testId) {
        return this.running.size > 0 && this.running.hasKey(TestId.fromString(testId).path);
    }
    isEnabledForAParentOf(testId) {
        if (this.globallyRunning) {
            return true;
        }
        return this.running.size > 0 && this.running.hasKeyOrParent(TestId.fromString(testId).path);
    }
    isEnabledForAChildOf(testId) {
        return this.running.size > 0 && this.running.hasKeyOrChildren(TestId.fromString(testId).path);
    }
    isEnabled() {
        return !!this.globallyRunning || this.running.size > 0;
    }
    start(profiles, testId) {
        const store = new DisposableStore();
        const cts = new CancellationTokenSource();
        store.add(toDisposable(() => cts.dispose(true)));
        if (testId === undefined) {
            this.isGloballyOn.set(true);
        }
        if (!testId) {
            this.globallyRunning?.dispose();
            this.globallyRunning = store;
        }
        else {
            this.running.mutate(TestId.fromString(testId).path, c => {
                c?.dispose();
                return store;
            });
        }
        let actualProfiles;
        if (profiles instanceof Array) {
            actualProfiles = profiles;
        }
        else {
            const getRelevant = () => this.testProfileService.getGroupDefaultProfiles(profiles)
                .filter(p => p.supportsContinuousRun && (!testId || TestId.root(testId) === p.controllerId));
            actualProfiles = getRelevant();
            store.add(this.testProfileService.onDidChange(() => {
                if (!arrays.equals(getRelevant(), actualProfiles)) {
                    this.start(profiles, testId);
                }
            }));
        }
        this.lastRun.store(new Set(actualProfiles.map(p => p.profileId)));
        if (actualProfiles.length) {
            this.testService.startContinuousRun({
                continuous: true,
                group: actualProfiles[0].group,
                targets: actualProfiles.map(p => ({
                    testIds: [testId ?? p.controllerId],
                    controllerId: p.controllerId,
                    profileId: p.profileId
                })),
            }, cts.token);
        }
        this.changeEmitter.fire(testId);
    }
    stop(testId) {
        if (!testId) {
            this.globallyRunning?.dispose();
            this.globallyRunning = undefined;
        }
        else {
            const cancellations = [...this.running.deleteRecursive(TestId.fromString(testId).path)];
            for (let i = cancellations.length - 1; i >= 0; i--) {
                cancellations[i].dispose();
            }
        }
        if (testId === undefined) {
            this.isGloballyOn.set(false);
        }
        this.changeEmitter.fire(testId);
    }
};
TestingContinuousRunService = __decorate([
    __param(0, ITestService),
    __param(1, IStorageService),
    __param(2, IContextKeyService),
    __param(3, ITestProfileService),
    __metadata("design:paramtypes", [TestService, Object, Object, Object])
], TestingContinuousRunService);
export { TestingContinuousRunService };
