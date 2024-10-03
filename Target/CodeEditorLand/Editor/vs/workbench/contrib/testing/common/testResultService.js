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
import { findFirstIdxMonotonousOrArrLen } from '../../../../base/common/arraysFind.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { Emitter } from '../../../../base/common/event.js';
import { createSingleCallFunction } from '../../../../base/common/functional.js';
import { Disposable, DisposableStore, dispose, toDisposable } from '../../../../base/common/lifecycle.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { TestingContextKeys } from './testingContextKeys.js';
import { ITestProfileService } from './testProfileService.js';
import { LiveTestResult } from './testResult.js';
import { ITestResultStorage, RETAIN_MAX_RESULTS } from './testResultStorage.js';
const isRunningTests = (service) => service.results.length > 0 && service.results[0].completedAt === undefined;
export const ITestResultService = createDecorator('testResultService');
let TestResultService = class TestResultService extends Disposable {
    get results() {
        this.loadResults();
        return this._results;
    }
    constructor(contextKeyService, storage, testProfiles, telemetryService) {
        super();
        this.storage = storage;
        this.testProfiles = testProfiles;
        this.telemetryService = telemetryService;
        this.changeResultEmitter = this._register(new Emitter());
        this._results = [];
        this._resultsDisposables = [];
        this.testChangeEmitter = this._register(new Emitter());
        this.onResultsChanged = this.changeResultEmitter.event;
        this.onTestChanged = this.testChangeEmitter.event;
        this.loadResults = createSingleCallFunction(() => this.storage.read().then(loaded => {
            for (let i = loaded.length - 1; i >= 0; i--) {
                this.push(loaded[i]);
            }
        }));
        this.persistScheduler = new RunOnceScheduler(() => this.persistImmediately(), 500);
        this._register(toDisposable(() => dispose(this._resultsDisposables)));
        this.isRunning = TestingContextKeys.isRunning.bindTo(contextKeyService);
        this.hasAnyResults = TestingContextKeys.hasAnyResults.bindTo(contextKeyService);
    }
    getStateById(extId) {
        for (const result of this.results) {
            const lookup = result.getStateById(extId);
            if (lookup && lookup.computedState !== 0) {
                return [result, lookup];
            }
        }
        return undefined;
    }
    createLiveResult(req) {
        if ('targets' in req) {
            const id = generateUuid();
            return this.push(new LiveTestResult(id, true, req, this.telemetryService));
        }
        let profile;
        if (req.profile) {
            const profiles = this.testProfiles.getControllerProfiles(req.controllerId);
            profile = profiles.find(c => c.profileId === req.profile.id);
        }
        const resolved = {
            preserveFocus: req.preserveFocus,
            targets: [],
            exclude: req.exclude,
            continuous: req.continuous,
            group: profile?.group ?? 2,
        };
        if (profile) {
            resolved.targets.push({
                profileId: profile.profileId,
                controllerId: req.controllerId,
                testIds: req.include,
            });
        }
        return this.push(new LiveTestResult(req.id, req.persist, resolved, this.telemetryService));
    }
    push(result) {
        if (result.completedAt === undefined) {
            this.results.unshift(result);
        }
        else {
            const index = findFirstIdxMonotonousOrArrLen(this.results, r => r.completedAt !== undefined && r.completedAt <= result.completedAt);
            this.results.splice(index, 0, result);
            this.persistScheduler.schedule();
        }
        this.hasAnyResults.set(true);
        if (this.results.length > RETAIN_MAX_RESULTS) {
            this.results.pop();
            this._resultsDisposables.pop()?.dispose();
        }
        const ds = new DisposableStore();
        this._resultsDisposables.push(ds);
        if (result instanceof LiveTestResult) {
            ds.add(result);
            ds.add(result.onComplete(() => this.onComplete(result)));
            ds.add(result.onChange(this.testChangeEmitter.fire, this.testChangeEmitter));
            this.isRunning.set(true);
            this.changeResultEmitter.fire({ started: result });
        }
        else {
            this.changeResultEmitter.fire({ inserted: result });
            for (const item of result.tests) {
                for (const otherResult of this.results) {
                    if (otherResult === result) {
                        this.testChangeEmitter.fire({ item, result, reason: 0 });
                        break;
                    }
                    else if (otherResult.getStateById(item.item.extId) !== undefined) {
                        break;
                    }
                }
            }
        }
        return result;
    }
    getResult(id) {
        return this.results.find(r => r.id === id);
    }
    clear() {
        const keep = [];
        const removed = [];
        for (const result of this.results) {
            if (result.completedAt !== undefined) {
                removed.push(result);
            }
            else {
                keep.push(result);
            }
        }
        this._results = keep;
        this.persistScheduler.schedule();
        if (keep.length === 0) {
            this.hasAnyResults.set(false);
        }
        this.changeResultEmitter.fire({ removed });
    }
    onComplete(result) {
        this.resort();
        this.updateIsRunning();
        this.persistScheduler.schedule();
        this.changeResultEmitter.fire({ completed: result });
    }
    resort() {
        this.results.sort((a, b) => (b.completedAt ?? Number.MAX_SAFE_INTEGER) - (a.completedAt ?? Number.MAX_SAFE_INTEGER));
    }
    updateIsRunning() {
        this.isRunning.set(isRunningTests(this));
    }
    async persistImmediately() {
        await this.loadResults();
        this.storage.persist(this.results);
    }
};
TestResultService = __decorate([
    __param(0, IContextKeyService),
    __param(1, ITestResultStorage),
    __param(2, ITestProfileService),
    __param(3, ITelemetryService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], TestResultService);
export { TestResultService };
