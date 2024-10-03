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
import { RunOnceScheduler } from '../../../base/common/async.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { CancellationToken, CancellationTokenSource } from '../../../base/common/cancellation.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { createSingleCallFunction } from '../../../base/common/functional.js';
import { hash } from '../../../base/common/hash.js';
import { Disposable, DisposableStore, toDisposable } from '../../../base/common/lifecycle.js';
import { isDefined } from '../../../base/common/types.js';
import { URI } from '../../../base/common/uri.js';
import { generateUuid } from '../../../base/common/uuid.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { MainContext } from './extHost.protocol.js';
import { IExtHostCommands } from './extHostCommands.js';
import { IExtHostDocumentsAndEditors } from './extHostDocumentsAndEditors.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { ExtHostTestItemCollection, TestItemImpl, TestItemRootImpl, toItemFromContext } from './extHostTestItem.js';
import * as Convert from './extHostTypeConverters.js';
import { FileCoverage, TestRunProfileKind, TestRunRequest } from './extHostTypes.js';
import { TestId } from '../../contrib/testing/common/testId.js';
import { InvalidTestItemError } from '../../contrib/testing/common/testItemCollection.js';
import { AbstractIncrementalTestCollection, TestsDiffOp, isStartControllerTests } from '../../contrib/testing/common/testTypes.js';
import { checkProposedApiEnabled } from '../../services/extensions/common/extensions.js';
let followupCounter = 0;
const testResultInternalIDs = new WeakMap();
export const IExtHostTesting = createDecorator('IExtHostTesting');
let ExtHostTesting = class ExtHostTesting extends Disposable {
    constructor(rpc, logService, commands, editors) {
        super();
        this.logService = logService;
        this.commands = commands;
        this.editors = editors;
        this.resultsChangedEmitter = this._register(new Emitter());
        this.controllers = new Map();
        this.defaultProfilesChangedEmitter = this._register(new Emitter());
        this.followupProviders = new Set();
        this.testFollowups = new Map();
        this.onResultsChanged = this.resultsChangedEmitter.event;
        this.results = [];
        this.proxy = rpc.getProxy(MainContext.MainThreadTesting);
        this.observer = new TestObservers(this.proxy);
        this.runTracker = new TestRunCoordinator(this.proxy, logService);
        commands.registerArgumentProcessor({
            processArgument: arg => {
                switch (arg?.$mid) {
                    case 16: {
                        const cast = arg;
                        const targetTest = cast.tests[cast.tests.length - 1].item.extId;
                        const controller = this.controllers.get(TestId.root(targetTest));
                        return controller?.collection.tree.get(targetTest)?.actual ?? toItemFromContext(arg);
                    }
                    case 18: {
                        const { test, message } = arg;
                        const extId = test.item.extId;
                        return {
                            test: this.controllers.get(TestId.root(extId))?.collection.tree.get(extId)?.actual
                                ?? toItemFromContext({ $mid: 16, tests: [test] }),
                            message: Convert.TestMessage.to(message),
                        };
                    }
                    default: return arg;
                }
            }
        });
        commands.registerCommand(false, 'testing.getExplorerSelection', async () => {
            const inner = await commands.executeCommand("_testing.getExplorerSelection");
            const lookup = (i) => {
                const controller = this.controllers.get(TestId.root(i));
                if (!controller) {
                    return undefined;
                }
                return TestId.isRoot(i) ? controller.controller : controller.collection.tree.get(i)?.actual;
            };
            return {
                include: inner?.include.map(lookup).filter(isDefined) || [],
                exclude: inner?.exclude.map(lookup).filter(isDefined) || [],
            };
        });
    }
    createTestController(extension, controllerId, label, refreshHandler) {
        if (this.controllers.has(controllerId)) {
            throw new Error(`Attempt to insert a duplicate controller with ID "${controllerId}"`);
        }
        const disposable = new DisposableStore();
        const collection = disposable.add(new ExtHostTestItemCollection(controllerId, label, this.editors));
        collection.root.label = label;
        const profiles = new Map();
        const activeProfiles = new Set();
        const proxy = this.proxy;
        const getCapability = () => {
            let cap = 0;
            if (refreshHandler) {
                cap |= 2;
            }
            const rcp = info.relatedCodeProvider;
            if (rcp) {
                if (rcp?.provideRelatedTests) {
                    cap |= 8;
                }
                if (rcp?.provideRelatedCode) {
                    cap |= 4;
                }
            }
            return cap;
        };
        const controller = {
            items: collection.root.children,
            get label() {
                return label;
            },
            set label(value) {
                label = value;
                collection.root.label = value;
                proxy.$updateController(controllerId, { label });
            },
            get refreshHandler() {
                return refreshHandler;
            },
            set refreshHandler(value) {
                refreshHandler = value;
                proxy.$updateController(controllerId, { capabilities: getCapability() });
            },
            get id() {
                return controllerId;
            },
            get relatedCodeProvider() {
                return info.relatedCodeProvider;
            },
            set relatedCodeProvider(value) {
                checkProposedApiEnabled(extension, 'testRelatedCode');
                info.relatedCodeProvider = value;
                proxy.$updateController(controllerId, { capabilities: getCapability() });
            },
            createRunProfile: (label, group, runHandler, isDefault, tag, supportsContinuousRun) => {
                let profileId = hash(label);
                while (profiles.has(profileId)) {
                    profileId++;
                }
                return new TestRunProfileImpl(this.proxy, profiles, activeProfiles, this.defaultProfilesChangedEmitter.event, controllerId, profileId, label, group, runHandler, isDefault, tag, supportsContinuousRun);
            },
            createTestItem(id, label, uri) {
                return new TestItemImpl(controllerId, id, label, uri);
            },
            createTestRun: (request, name, persist = true) => {
                return this.runTracker.createTestRun(extension, controllerId, collection, request, name, persist);
            },
            invalidateTestResults: items => {
                if (items === undefined) {
                    this.proxy.$markTestRetired(undefined);
                }
                else {
                    const itemsArr = items instanceof Array ? items : [items];
                    this.proxy.$markTestRetired(itemsArr.map(i => TestId.fromExtHostTestItem(i, controllerId).toString()));
                }
            },
            set resolveHandler(fn) {
                collection.resolveHandler = fn;
            },
            get resolveHandler() {
                return collection.resolveHandler;
            },
            dispose: () => {
                disposable.dispose();
            },
        };
        const info = { controller, collection, profiles, extension, activeProfiles };
        proxy.$registerTestController(controllerId, label, getCapability());
        disposable.add(toDisposable(() => proxy.$unregisterTestController(controllerId)));
        this.controllers.set(controllerId, info);
        disposable.add(toDisposable(() => this.controllers.delete(controllerId)));
        disposable.add(collection.onDidGenerateDiff(diff => proxy.$publishDiff(controllerId, diff.map(TestsDiffOp.serialize))));
        return controller;
    }
    createTestObserver() {
        return this.observer.checkout();
    }
    async runTests(req, token = CancellationToken.None) {
        const profile = tryGetProfileFromTestRunReq(req);
        if (!profile) {
            throw new Error('The request passed to `vscode.test.runTests` must include a profile');
        }
        const controller = this.controllers.get(profile.controllerId);
        if (!controller) {
            throw new Error('Controller not found');
        }
        await this.proxy.$runTests({
            preserveFocus: req.preserveFocus ?? true,
            group: profileGroupToBitset[profile.kind],
            targets: [{
                    testIds: req.include?.map(t => TestId.fromExtHostTestItem(t, controller.collection.root.id).toString()) ?? [controller.collection.root.id],
                    profileId: profile.profileId,
                    controllerId: profile.controllerId,
                }],
            exclude: req.exclude?.map(t => t.id),
        }, token);
    }
    registerTestFollowupProvider(provider) {
        this.followupProviders.add(provider);
        return { dispose: () => { this.followupProviders.delete(provider); } };
    }
    async $getTestsRelatedToCode(uri, _position, token) {
        const doc = this.editors.getDocument(URI.revive(uri));
        if (!doc) {
            return [];
        }
        const position = Convert.Position.to(_position);
        const related = [];
        await Promise.all([...this.controllers.values()].map(async (c) => {
            let tests;
            try {
                tests = await c.relatedCodeProvider?.provideRelatedTests?.(doc.document, position, token);
            }
            catch (e) {
                if (!token.isCancellationRequested) {
                    this.logService.warn(`Error thrown while providing related tests for ${c.controller.label}`, e);
                }
            }
            if (tests) {
                for (const test of tests) {
                    related.push(TestId.fromExtHostTestItem(test, c.controller.id).toString());
                }
                c.collection.flushDiff();
            }
        }));
        return related;
    }
    async $getCodeRelatedToTest(testId, token) {
        const controller = this.controllers.get(TestId.root(testId));
        if (!controller) {
            return [];
        }
        const test = controller.collection.tree.get(testId);
        if (!test) {
            return [];
        }
        const locations = await controller.relatedCodeProvider?.provideRelatedCode?.(test.actual, token);
        return locations?.map(Convert.location.from) ?? [];
    }
    $syncTests() {
        for (const { collection } of this.controllers.values()) {
            collection.flushDiff();
        }
        return Promise.resolve();
    }
    async $getCoverageDetails(coverageId, testId, token) {
        const details = await this.runTracker.getCoverageDetails(coverageId, testId, token);
        return details?.map(Convert.TestCoverage.fromDetails);
    }
    async $disposeRun(runId) {
        this.runTracker.disposeTestRun(runId);
    }
    $configureRunProfile(controllerId, profileId) {
        this.controllers.get(controllerId)?.profiles.get(profileId)?.configureHandler?.();
    }
    $setDefaultRunProfiles(profiles) {
        const evt = new Map();
        for (const [controllerId, profileIds] of Object.entries(profiles)) {
            const ctrl = this.controllers.get(controllerId);
            if (!ctrl) {
                continue;
            }
            const changes = new Map();
            const added = profileIds.filter(id => !ctrl.activeProfiles.has(id));
            const removed = [...ctrl.activeProfiles].filter(id => !profileIds.includes(id));
            for (const id of added) {
                changes.set(id, true);
                ctrl.activeProfiles.add(id);
            }
            for (const id of removed) {
                changes.set(id, false);
                ctrl.activeProfiles.delete(id);
            }
            if (changes.size) {
                evt.set(controllerId, changes);
            }
        }
        this.defaultProfilesChangedEmitter.fire(evt);
    }
    async $refreshTests(controllerId, token) {
        await this.controllers.get(controllerId)?.controller.refreshHandler?.(token);
    }
    $publishTestResults(results) {
        this.results = Object.freeze(results
            .map(r => {
            const o = Convert.TestResults.to(r);
            const taskWithCoverage = r.tasks.findIndex(t => t.hasCoverage);
            if (taskWithCoverage !== -1) {
                o.getDetailedCoverage = (uri, token = CancellationToken.None) => this.proxy.$getCoverageDetails(r.id, taskWithCoverage, uri, token).then(r => r.map(Convert.TestCoverage.to));
            }
            testResultInternalIDs.set(o, r.id);
            return o;
        })
            .concat(this.results)
            .sort((a, b) => b.completedAt - a.completedAt)
            .slice(0, 32));
        this.resultsChangedEmitter.fire();
    }
    async $expandTest(testId, levels) {
        const collection = this.controllers.get(TestId.fromString(testId).controllerId)?.collection;
        if (collection) {
            await collection.expand(testId, levels < 0 ? Infinity : levels);
            collection.flushDiff();
        }
    }
    $acceptDiff(diff) {
        this.observer.applyDiff(diff.map(d => TestsDiffOp.deserialize({ asCanonicalUri: u => u }, d)));
    }
    async $runControllerTests(reqs, token) {
        return Promise.all(reqs.map(req => this.runControllerTestRequest(req, false, token)));
    }
    async $startContinuousRun(reqs, token) {
        const cts = new CancellationTokenSource(token);
        const res = await Promise.all(reqs.map(req => this.runControllerTestRequest(req, true, cts.token)));
        if (!token.isCancellationRequested && !res.some(r => r.error)) {
            await new Promise(r => token.onCancellationRequested(r));
        }
        cts.dispose(true);
        return res;
    }
    async $provideTestFollowups(req, token) {
        const results = this.results.find(r => testResultInternalIDs.get(r) === req.resultId);
        const test = results && findTestInResultSnapshot(TestId.fromString(req.extId), results?.results);
        if (!test) {
            return [];
        }
        let followups = [];
        await Promise.all([...this.followupProviders].map(async (provider) => {
            try {
                const r = await provider.provideFollowup(results, test, req.taskIndex, req.messageIndex, token);
                if (r) {
                    followups = followups.concat(r);
                }
            }
            catch (e) {
                this.logService.error(`Error thrown while providing followup for test message`, e);
            }
        }));
        if (token.isCancellationRequested) {
            return [];
        }
        return followups.map(command => {
            const id = followupCounter++;
            this.testFollowups.set(id, command);
            return { title: command.title, id };
        });
    }
    $disposeTestFollowups(id) {
        for (const i of id) {
            this.testFollowups.delete(i);
        }
    }
    $executeTestFollowup(id) {
        const command = this.testFollowups.get(id);
        if (!command) {
            return Promise.resolve();
        }
        return this.commands.executeCommand(command.command, ...(command.arguments || []));
    }
    $cancelExtensionTestRun(runId, taskId) {
        if (runId === undefined) {
            this.runTracker.cancelAllRuns();
        }
        else {
            this.runTracker.cancelRunById(runId, taskId);
        }
    }
    getMetadataForRun(run) {
        for (const tracker of this.runTracker.trackers) {
            const taskId = tracker.getTaskIdForRun(run);
            if (taskId) {
                return { taskId, runId: tracker.id };
            }
        }
        return undefined;
    }
    async runControllerTestRequest(req, isContinuous, token) {
        const lookup = this.controllers.get(req.controllerId);
        if (!lookup) {
            return {};
        }
        const { collection, profiles, extension } = lookup;
        const profile = profiles.get(req.profileId);
        if (!profile) {
            return {};
        }
        const includeTests = req.testIds
            .map((testId) => collection.tree.get(testId))
            .filter(isDefined);
        const excludeTests = req.excludeExtIds
            .map(id => lookup.collection.tree.get(id))
            .filter(isDefined)
            .filter(exclude => includeTests.some(include => include.fullId.compare(exclude.fullId) === 2));
        if (!includeTests.length) {
            return {};
        }
        const publicReq = new TestRunRequest(includeTests.some(i => i.actual instanceof TestItemRootImpl) ? undefined : includeTests.map(t => t.actual), excludeTests.map(t => t.actual), profile, isContinuous);
        const tracker = isStartControllerTests(req) && this.runTracker.prepareForMainThreadTestRun(extension, publicReq, TestRunDto.fromInternal(req, lookup.collection), profile, token);
        try {
            await profile.runHandler(publicReq, token);
            return {};
        }
        catch (e) {
            return { error: String(e) };
        }
        finally {
            if (tracker) {
                if (tracker.hasRunningTasks && !token.isCancellationRequested) {
                    await Event.toPromise(tracker.onEnd);
                }
            }
        }
    }
};
ExtHostTesting = __decorate([
    __param(0, IExtHostRpcService),
    __param(1, ILogService),
    __param(2, IExtHostCommands),
    __param(3, IExtHostDocumentsAndEditors),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ExtHostTesting);
export { ExtHostTesting };
const RUN_CANCEL_DEADLINE = 10_000;
class TestRunTracker extends Disposable {
    get hasRunningTasks() {
        return this.running > 0;
    }
    get id() {
        return this.dto.id;
    }
    constructor(dto, proxy, logService, profile, extension, parentToken) {
        super();
        this.dto = dto;
        this.proxy = proxy;
        this.logService = logService;
        this.profile = profile;
        this.extension = extension;
        this.state = 0;
        this.running = 0;
        this.tasks = new Map();
        this.sharedTestIds = new Set();
        this.endEmitter = this._register(new Emitter());
        this.publishedCoverage = new Map();
        this.onEnd = this.endEmitter.event;
        this.cts = this._register(new CancellationTokenSource(parentToken));
        const forciblyEnd = this._register(new RunOnceScheduler(() => this.forciblyEndTasks(), RUN_CANCEL_DEADLINE));
        this._register(this.cts.token.onCancellationRequested(() => forciblyEnd.schedule()));
        const didDisposeEmitter = new Emitter();
        this.onDidDispose = didDisposeEmitter.event;
        this._register(toDisposable(() => {
            didDisposeEmitter.fire();
            didDisposeEmitter.dispose();
        }));
    }
    getTaskIdForRun(run) {
        for (const [taskId, { run: r }] of this.tasks) {
            if (r === run) {
                return taskId;
            }
        }
        return undefined;
    }
    cancel(taskId) {
        if (taskId) {
            this.tasks.get(taskId)?.cts.cancel();
        }
        else if (this.state === 0) {
            this.cts.cancel();
            this.state = 1;
        }
        else if (this.state === 1) {
            this.forciblyEndTasks();
        }
    }
    async getCoverageDetails(id, testId, token) {
        const [, taskId] = TestId.fromString(id).path;
        const coverage = this.publishedCoverage.get(id);
        if (!coverage) {
            return [];
        }
        const { report, extIds } = coverage;
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error('unreachable: run task was not found');
        }
        let testItem;
        if (testId && report instanceof FileCoverage) {
            const index = extIds.indexOf(testId);
            if (index === -1) {
                return [];
            }
            testItem = report.fromTests[index];
        }
        const details = testItem
            ? this.profile?.loadDetailedCoverageForTest?.(task.run, report, testItem, token)
            : this.profile?.loadDetailedCoverage?.(task.run, report, token);
        return (await details) ?? [];
    }
    createRun(name) {
        const runId = this.dto.id;
        const ctrlId = this.dto.controllerId;
        const taskId = generateUuid();
        const guardTestMutation = (fn) => (test, ...args) => {
            if (ended) {
                this.logService.warn(`Setting the state of test "${test.id}" is a no-op after the run ends.`);
                return;
            }
            this.ensureTestIsKnown(test);
            fn(test, ...args);
        };
        const appendMessages = (test, messages) => {
            const converted = messages instanceof Array
                ? messages.map(Convert.TestMessage.from)
                : [Convert.TestMessage.from(messages)];
            if (test.uri && test.range) {
                const defaultLocation = { range: Convert.Range.from(test.range), uri: test.uri };
                for (const message of converted) {
                    message.location = message.location || defaultLocation;
                }
            }
            this.proxy.$appendTestMessagesInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), converted);
        };
        let ended = false;
        const cts = this._register(new CancellationTokenSource(this.cts.token));
        const run = {
            isPersisted: this.dto.isPersisted,
            token: cts.token,
            name,
            onDidDispose: this.onDidDispose,
            addCoverage: (coverage) => {
                if (ended) {
                    return;
                }
                const fromTests = coverage instanceof FileCoverage ? coverage.fromTests : [];
                if (fromTests.length) {
                    checkProposedApiEnabled(this.extension, 'attributableCoverage');
                    for (const test of fromTests) {
                        this.ensureTestIsKnown(test);
                    }
                }
                const uriStr = coverage.uri.toString();
                const id = new TestId([runId, taskId, uriStr]).toString();
                this.publishedCoverage.set(id, { report: coverage, extIds: fromTests.map(t => TestId.fromExtHostTestItem(t, ctrlId).toString()) });
                this.proxy.$appendCoverage(runId, taskId, Convert.TestCoverage.fromFile(ctrlId, id, coverage));
            },
            enqueued: guardTestMutation(test => {
                this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), 1);
            }),
            skipped: guardTestMutation(test => {
                this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), 5);
            }),
            started: guardTestMutation(test => {
                this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), 2);
            }),
            errored: guardTestMutation((test, messages, duration) => {
                appendMessages(test, messages);
                this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), 6, duration);
            }),
            failed: guardTestMutation((test, messages, duration) => {
                appendMessages(test, messages);
                this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), 4, duration);
            }),
            passed: guardTestMutation((test, duration) => {
                this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, this.dto.controllerId).toString(), 3, duration);
            }),
            appendOutput: (output, location, test) => {
                if (ended) {
                    return;
                }
                if (test) {
                    this.ensureTestIsKnown(test);
                }
                this.proxy.$appendOutputToRun(runId, taskId, VSBuffer.fromString(output), location && Convert.location.from(location), test && TestId.fromExtHostTestItem(test, ctrlId).toString());
            },
            end: () => {
                if (ended) {
                    return;
                }
                ended = true;
                this.proxy.$finishedTestRunTask(runId, taskId);
                if (!--this.running) {
                    this.markEnded();
                }
            }
        };
        this.running++;
        this.tasks.set(taskId, { run, cts });
        this.proxy.$startedTestRunTask(runId, {
            id: taskId,
            ctrlId: this.dto.controllerId,
            name: name || this.extension.displayName || this.extension.identifier.value,
            running: true,
        });
        return run;
    }
    forciblyEndTasks() {
        for (const { run } of this.tasks.values()) {
            run.end();
        }
    }
    markEnded() {
        if (this.state !== 2) {
            this.state = 2;
            this.endEmitter.fire();
        }
    }
    ensureTestIsKnown(test) {
        if (!(test instanceof TestItemImpl)) {
            throw new InvalidTestItemError(test.id);
        }
        if (this.sharedTestIds.has(TestId.fromExtHostTestItem(test, this.dto.controllerId).toString())) {
            return;
        }
        const chain = [];
        const root = this.dto.colllection.root;
        while (true) {
            const converted = Convert.TestItem.from(test);
            chain.unshift(converted);
            if (this.sharedTestIds.has(converted.extId)) {
                break;
            }
            this.sharedTestIds.add(converted.extId);
            if (test === root) {
                break;
            }
            test = test.parent || root;
        }
        this.proxy.$addTestsToRun(this.dto.controllerId, this.dto.id, chain);
    }
    dispose() {
        this.markEnded();
        super.dispose();
    }
}
export class TestRunCoordinator {
    get trackers() {
        return this.tracked.values();
    }
    constructor(proxy, logService) {
        this.proxy = proxy;
        this.logService = logService;
        this.tracked = new Map();
        this.trackedById = new Map();
    }
    getCoverageDetails(id, testId, token) {
        const runId = TestId.root(id);
        return this.trackedById.get(runId)?.getCoverageDetails(id, testId, token) || [];
    }
    disposeTestRun(runId) {
        this.trackedById.get(runId)?.dispose();
        this.trackedById.delete(runId);
        for (const [req, { id }] of this.tracked) {
            if (id === runId) {
                this.tracked.delete(req);
            }
        }
    }
    prepareForMainThreadTestRun(extension, req, dto, profile, token) {
        return this.getTracker(req, dto, profile, extension, token);
    }
    cancelRunById(runId, taskId) {
        this.trackedById.get(runId)?.cancel(taskId);
    }
    cancelAllRuns() {
        for (const tracker of this.tracked.values()) {
            tracker.cancel();
        }
    }
    createTestRun(extension, controllerId, collection, request, name, persist) {
        const existing = this.tracked.get(request);
        if (existing) {
            return existing.createRun(name);
        }
        const dto = TestRunDto.fromPublic(controllerId, collection, request, persist);
        const profile = tryGetProfileFromTestRunReq(request);
        this.proxy.$startedExtensionTestRun({
            controllerId,
            continuous: !!request.continuous,
            profile: profile && { group: profileGroupToBitset[profile.kind], id: profile.profileId },
            exclude: request.exclude?.map(t => TestId.fromExtHostTestItem(t, collection.root.id).toString()) ?? [],
            id: dto.id,
            include: request.include?.map(t => TestId.fromExtHostTestItem(t, collection.root.id).toString()) ?? [collection.root.id],
            preserveFocus: request.preserveFocus ?? true,
            persist
        });
        const tracker = this.getTracker(request, dto, request.profile, extension);
        Event.once(tracker.onEnd)(() => {
            this.proxy.$finishedExtensionTestRun(dto.id);
        });
        return tracker.createRun(name);
    }
    getTracker(req, dto, profile, extension, token) {
        const tracker = new TestRunTracker(dto, this.proxy, this.logService, profile, extension, token);
        this.tracked.set(req, tracker);
        this.trackedById.set(tracker.id, tracker);
        return tracker;
    }
}
const tryGetProfileFromTestRunReq = (request) => {
    if (!request.profile) {
        return undefined;
    }
    if (!(request.profile instanceof TestRunProfileImpl)) {
        throw new Error(`TestRunRequest.profile is not an instance created from TestController.createRunProfile`);
    }
    return request.profile;
};
export class TestRunDto {
    static fromPublic(controllerId, collection, request, persist) {
        return new TestRunDto(controllerId, generateUuid(), persist, collection);
    }
    static fromInternal(request, collection) {
        return new TestRunDto(request.controllerId, request.runId, true, collection);
    }
    constructor(controllerId, id, isPersisted, colllection) {
        this.controllerId = controllerId;
        this.id = id;
        this.isPersisted = isPersisted;
        this.colllection = colllection;
    }
}
class MirroredChangeCollector {
    get isEmpty() {
        return this.added.size === 0 && this.removed.size === 0 && this.updated.size === 0;
    }
    constructor(emitter) {
        this.emitter = emitter;
        this.added = new Set();
        this.updated = new Set();
        this.removed = new Set();
        this.alreadyRemoved = new Set();
    }
    add(node) {
        this.added.add(node);
    }
    update(node) {
        Object.assign(node.revived, Convert.TestItem.toPlain(node.item));
        if (!this.added.has(node)) {
            this.updated.add(node);
        }
    }
    remove(node) {
        if (this.added.has(node)) {
            this.added.delete(node);
            return;
        }
        this.updated.delete(node);
        const parentId = TestId.parentId(node.item.extId);
        if (parentId && this.alreadyRemoved.has(parentId.toString())) {
            this.alreadyRemoved.add(node.item.extId);
            return;
        }
        this.removed.add(node);
    }
    getChangeEvent() {
        const { added, updated, removed } = this;
        return {
            get added() { return [...added].map(n => n.revived); },
            get updated() { return [...updated].map(n => n.revived); },
            get removed() { return [...removed].map(n => n.revived); },
        };
    }
    complete() {
        if (!this.isEmpty) {
            this.emitter.fire(this.getChangeEvent());
        }
    }
}
class MirroredTestCollection extends AbstractIncrementalTestCollection {
    constructor() {
        super(...arguments);
        this.changeEmitter = new Emitter();
        this.onDidChangeTests = this.changeEmitter.event;
    }
    get rootTests() {
        return this.roots;
    }
    getMirroredTestDataById(itemId) {
        return this.items.get(itemId);
    }
    getMirroredTestDataByReference(item) {
        return this.items.get(item.id);
    }
    createItem(item, parent) {
        return {
            ...item,
            revived: Convert.TestItem.toPlain(item.item),
            depth: parent ? parent.depth + 1 : 0,
            children: new Set(),
        };
    }
    createChangeCollector() {
        return new MirroredChangeCollector(this.changeEmitter);
    }
}
class TestObservers {
    constructor(proxy) {
        this.proxy = proxy;
    }
    checkout() {
        if (!this.current) {
            this.current = this.createObserverData();
        }
        const current = this.current;
        current.observers++;
        return {
            onDidChangeTest: current.tests.onDidChangeTests,
            get tests() { return [...current.tests.rootTests].map(t => t.revived); },
            dispose: createSingleCallFunction(() => {
                if (--current.observers === 0) {
                    this.proxy.$unsubscribeFromDiffs();
                    this.current = undefined;
                }
            }),
        };
    }
    getMirroredTestDataByReference(ref) {
        return this.current?.tests.getMirroredTestDataByReference(ref);
    }
    applyDiff(diff) {
        this.current?.tests.apply(diff);
    }
    createObserverData() {
        const tests = new MirroredTestCollection({ asCanonicalUri: u => u });
        this.proxy.$subscribeToDiffs();
        return { observers: 0, tests, };
    }
}
const updateProfile = (impl, proxy, initial, update) => {
    if (initial) {
        Object.assign(initial, update);
    }
    else {
        proxy.$updateTestRunConfig(impl.controllerId, impl.profileId, update);
    }
};
export class TestRunProfileImpl {
    #proxy;
    #activeProfiles;
    #onDidChangeDefaultProfiles;
    #initialPublish;
    #profiles;
    get label() {
        return this._label;
    }
    set label(label) {
        if (label !== this._label) {
            this._label = label;
            updateProfile(this, this.#proxy, this.#initialPublish, { label });
        }
    }
    get supportsContinuousRun() {
        return this._supportsContinuousRun;
    }
    set supportsContinuousRun(supports) {
        if (supports !== this._supportsContinuousRun) {
            this._supportsContinuousRun = supports;
            updateProfile(this, this.#proxy, this.#initialPublish, { supportsContinuousRun: supports });
        }
    }
    get isDefault() {
        return this.#activeProfiles.has(this.profileId);
    }
    set isDefault(isDefault) {
        if (isDefault !== this.isDefault) {
            if (isDefault) {
                this.#activeProfiles.add(this.profileId);
            }
            else {
                this.#activeProfiles.delete(this.profileId);
            }
            updateProfile(this, this.#proxy, this.#initialPublish, { isDefault });
        }
    }
    get tag() {
        return this._tag;
    }
    set tag(tag) {
        if (tag?.id !== this._tag?.id) {
            this._tag = tag;
            updateProfile(this, this.#proxy, this.#initialPublish, {
                tag: tag ? Convert.TestTag.namespace(this.controllerId, tag.id) : null,
            });
        }
    }
    get configureHandler() {
        return this._configureHandler;
    }
    set configureHandler(handler) {
        if (handler !== this._configureHandler) {
            this._configureHandler = handler;
            updateProfile(this, this.#proxy, this.#initialPublish, { hasConfigurationHandler: !!handler });
        }
    }
    get onDidChangeDefault() {
        return Event.chain(this.#onDidChangeDefaultProfiles, $ => $
            .map(ev => ev.get(this.controllerId)?.get(this.profileId))
            .filter(isDefined));
    }
    constructor(proxy, profiles, activeProfiles, onDidChangeActiveProfiles, controllerId, profileId, _label, kind, runHandler, _isDefault = false, _tag = undefined, _supportsContinuousRun = false) {
        this.controllerId = controllerId;
        this.profileId = profileId;
        this._label = _label;
        this.kind = kind;
        this.runHandler = runHandler;
        this._tag = _tag;
        this._supportsContinuousRun = _supportsContinuousRun;
        this.#proxy = proxy;
        this.#profiles = profiles;
        this.#activeProfiles = activeProfiles;
        this.#onDidChangeDefaultProfiles = onDidChangeActiveProfiles;
        profiles.set(profileId, this);
        const groupBitset = profileGroupToBitset[kind];
        if (typeof groupBitset !== 'number') {
            throw new Error(`Unknown TestRunProfile.group ${kind}`);
        }
        if (_isDefault) {
            activeProfiles.add(profileId);
        }
        this.#initialPublish = {
            profileId: profileId,
            controllerId,
            tag: _tag ? Convert.TestTag.namespace(this.controllerId, _tag.id) : null,
            label: _label,
            group: groupBitset,
            isDefault: _isDefault,
            hasConfigurationHandler: false,
            supportsContinuousRun: _supportsContinuousRun,
        };
        queueMicrotask(() => {
            if (this.#initialPublish) {
                this.#proxy.$publishTestRunProfile(this.#initialPublish);
                this.#initialPublish = undefined;
            }
        });
    }
    dispose() {
        if (this.#profiles?.delete(this.profileId)) {
            this.#profiles = undefined;
            this.#proxy.$removeTestProfile(this.controllerId, this.profileId);
        }
        this.#initialPublish = undefined;
    }
}
const profileGroupToBitset = {
    [TestRunProfileKind.Coverage]: 8,
    [TestRunProfileKind.Debug]: 4,
    [TestRunProfileKind.Run]: 2,
};
function findTestInResultSnapshot(extId, snapshot) {
    for (let i = 0; i < extId.path.length; i++) {
        const item = snapshot.find(s => s.id === extId.path[i]);
        if (!item) {
            return undefined;
        }
        if (i === extId.path.length - 1) {
            return item;
        }
        snapshot = item.children;
    }
    return undefined;
}
