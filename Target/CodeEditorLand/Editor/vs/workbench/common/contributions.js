import { IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
import { ILifecycleService } from '../services/lifecycle/common/lifecycle.js';
import { Registry } from '../../platform/registry/common/platform.js';
import { DeferredPromise, runWhenGlobalIdle } from '../../base/common/async.js';
import { mark } from '../../base/common/performance.js';
import { ILogService } from '../../platform/log/common/log.js';
import { IEnvironmentService } from '../../platform/environment/common/environment.js';
import { getOrSet } from '../../base/common/map.js';
import { Disposable, DisposableStore, isDisposable } from '../../base/common/lifecycle.js';
import { IEditorPaneService } from '../services/editor/common/editorPaneService.js';
export var Extensions;
(function (Extensions) {
    Extensions.Workbench = 'workbench.contributions.kind';
})(Extensions || (Extensions = {}));
function isOnEditorWorkbenchContributionInstantiation(obj) {
    const candidate = obj;
    return !!candidate && typeof candidate.editorTypeId === 'string';
}
function toWorkbenchPhase(phase) {
    switch (phase) {
        case 3:
            return 3;
        case 4:
            return 4;
    }
}
function toLifecyclePhase(instantiation) {
    switch (instantiation) {
        case 1:
            return 1;
        case 2:
            return 2;
        case 3:
            return 3;
        case 4:
            return 4;
    }
}
export class WorkbenchContributionsRegistry extends Disposable {
    constructor() {
        super(...arguments);
        this.contributionsByPhase = new Map();
        this.contributionsByEditor = new Map();
        this.contributionsById = new Map();
        this.instancesById = new Map();
        this.instanceDisposables = this._register(new DisposableStore());
        this.timingsByPhase = new Map();
        this.pendingRestoredContributions = new DeferredPromise();
        this.whenRestored = this.pendingRestoredContributions.p;
    }
    static { this.INSTANCE = new WorkbenchContributionsRegistry(); }
    static { this.BLOCK_BEFORE_RESTORE_WARN_THRESHOLD = 20; }
    static { this.BLOCK_AFTER_RESTORE_WARN_THRESHOLD = 100; }
    get timings() { return this.timingsByPhase; }
    registerWorkbenchContribution2(id, ctor, instantiation) {
        const contribution = { id, ctor };
        if (this.instantiationService && this.lifecycleService && this.logService && this.environmentService && this.editorPaneService &&
            ((typeof instantiation === 'number' && this.lifecycleService.phase >= instantiation) ||
                (typeof id === 'string' && isOnEditorWorkbenchContributionInstantiation(instantiation) && this.editorPaneService.didInstantiateEditorPane(instantiation.editorTypeId)))) {
            this.safeCreateContribution(this.instantiationService, this.logService, this.environmentService, contribution, typeof instantiation === 'number' ? toLifecyclePhase(instantiation) : this.lifecycleService.phase);
        }
        else {
            if (typeof instantiation === 'number') {
                getOrSet(this.contributionsByPhase, toLifecyclePhase(instantiation), []).push(contribution);
            }
            if (typeof id === 'string') {
                if (!this.contributionsById.has(id)) {
                    this.contributionsById.set(id, contribution);
                }
                else {
                    console.error(`IWorkbenchContributionsRegistry#registerWorkbenchContribution(): Can't register multiple contributions with same id '${id}'`);
                }
                if (isOnEditorWorkbenchContributionInstantiation(instantiation)) {
                    getOrSet(this.contributionsByEditor, instantiation.editorTypeId, []).push(contribution);
                }
            }
        }
    }
    registerWorkbenchContribution(ctor, phase) {
        this.registerWorkbenchContribution2(undefined, ctor, toWorkbenchPhase(phase));
    }
    getWorkbenchContribution(id) {
        if (this.instancesById.has(id)) {
            return this.instancesById.get(id);
        }
        const instantiationService = this.instantiationService;
        const lifecycleService = this.lifecycleService;
        const logService = this.logService;
        const environmentService = this.environmentService;
        if (!instantiationService || !lifecycleService || !logService || !environmentService) {
            throw new Error(`IWorkbenchContributionsRegistry#getContribution('${id}'): cannot be called before registry started`);
        }
        const contribution = this.contributionsById.get(id);
        if (!contribution) {
            throw new Error(`IWorkbenchContributionsRegistry#getContribution('${id}'): contribution with that identifier is unknown.`);
        }
        if (lifecycleService.phase < 3) {
            logService.warn(`IWorkbenchContributionsRegistry#getContribution('${id}'): contribution instantiated before LifecyclePhase.Restored!`);
        }
        this.safeCreateContribution(instantiationService, logService, environmentService, contribution, lifecycleService.phase);
        const instance = this.instancesById.get(id);
        if (!instance) {
            throw new Error(`IWorkbenchContributionsRegistry#getContribution('${id}'): failed to create contribution.`);
        }
        return instance;
    }
    start(accessor) {
        const instantiationService = this.instantiationService = accessor.get(IInstantiationService);
        const lifecycleService = this.lifecycleService = accessor.get(ILifecycleService);
        const logService = this.logService = accessor.get(ILogService);
        const environmentService = this.environmentService = accessor.get(IEnvironmentService);
        const editorPaneService = this.editorPaneService = accessor.get(IEditorPaneService);
        this._register(lifecycleService.onDidShutdown(() => {
            this.instanceDisposables.clear();
        }));
        for (const phase of [1, 2, 3, 4]) {
            this.instantiateByPhase(instantiationService, lifecycleService, logService, environmentService, phase);
        }
        for (const editorTypeId of this.contributionsByEditor.keys()) {
            if (editorPaneService.didInstantiateEditorPane(editorTypeId)) {
                this.onEditor(editorTypeId, instantiationService, lifecycleService, logService, environmentService);
            }
        }
        this._register(editorPaneService.onWillInstantiateEditorPane(e => this.onEditor(e.typeId, instantiationService, lifecycleService, logService, environmentService)));
    }
    onEditor(editorTypeId, instantiationService, lifecycleService, logService, environmentService) {
        const contributions = this.contributionsByEditor.get(editorTypeId);
        if (contributions) {
            this.contributionsByEditor.delete(editorTypeId);
            for (const contribution of contributions) {
                this.safeCreateContribution(instantiationService, logService, environmentService, contribution, lifecycleService.phase);
            }
        }
    }
    instantiateByPhase(instantiationService, lifecycleService, logService, environmentService, phase) {
        if (lifecycleService.phase >= phase) {
            this.doInstantiateByPhase(instantiationService, logService, environmentService, phase);
        }
        else {
            lifecycleService.when(phase).then(() => this.doInstantiateByPhase(instantiationService, logService, environmentService, phase));
        }
    }
    async doInstantiateByPhase(instantiationService, logService, environmentService, phase) {
        const contributions = this.contributionsByPhase.get(phase);
        if (contributions) {
            this.contributionsByPhase.delete(phase);
            switch (phase) {
                case 1:
                case 2: {
                    mark(`code/willCreateWorkbenchContributions/${phase}`);
                    for (const contribution of contributions) {
                        this.safeCreateContribution(instantiationService, logService, environmentService, contribution, phase);
                    }
                    mark(`code/didCreateWorkbenchContributions/${phase}`);
                    break;
                }
                case 3:
                case 4: {
                    if (phase === 4) {
                        await this.pendingRestoredContributions.p;
                    }
                    this.doInstantiateWhenIdle(contributions, instantiationService, logService, environmentService, phase);
                    break;
                }
            }
        }
    }
    doInstantiateWhenIdle(contributions, instantiationService, logService, environmentService, phase) {
        mark(`code/willCreateWorkbenchContributions/${phase}`);
        let i = 0;
        const forcedTimeout = phase === 4 ? 3000 : 500;
        const instantiateSome = (idle) => {
            while (i < contributions.length) {
                const contribution = contributions[i++];
                this.safeCreateContribution(instantiationService, logService, environmentService, contribution, phase);
                if (idle.timeRemaining() < 1) {
                    runWhenGlobalIdle(instantiateSome, forcedTimeout);
                    break;
                }
            }
            if (i === contributions.length) {
                mark(`code/didCreateWorkbenchContributions/${phase}`);
                if (phase === 3) {
                    this.pendingRestoredContributions.complete();
                }
            }
        };
        runWhenGlobalIdle(instantiateSome, forcedTimeout);
    }
    safeCreateContribution(instantiationService, logService, environmentService, contribution, phase) {
        if (typeof contribution.id === 'string' && this.instancesById.has(contribution.id)) {
            return;
        }
        const now = Date.now();
        try {
            if (typeof contribution.id === 'string') {
                mark(`code/willCreateWorkbenchContribution/${phase}/${contribution.id}`);
            }
            const instance = instantiationService.createInstance(contribution.ctor);
            if (typeof contribution.id === 'string') {
                this.instancesById.set(contribution.id, instance);
                this.contributionsById.delete(contribution.id);
            }
            if (isDisposable(instance)) {
                this.instanceDisposables.add(instance);
            }
        }
        catch (error) {
            logService.error(`Unable to create workbench contribution '${contribution.id ?? contribution.ctor.name}'.`, error);
        }
        finally {
            if (typeof contribution.id === 'string') {
                mark(`code/didCreateWorkbenchContribution/${phase}/${contribution.id}`);
            }
        }
        if (typeof contribution.id === 'string' || !environmentService.isBuilt) {
            const time = Date.now() - now;
            if (time > (phase < 3 ? WorkbenchContributionsRegistry.BLOCK_BEFORE_RESTORE_WARN_THRESHOLD : WorkbenchContributionsRegistry.BLOCK_AFTER_RESTORE_WARN_THRESHOLD)) {
                logService.warn(`Creation of workbench contribution '${contribution.id ?? contribution.ctor.name}' took ${time}ms.`);
            }
            if (typeof contribution.id === 'string') {
                let timingsForPhase = this.timingsByPhase.get(phase);
                if (!timingsForPhase) {
                    timingsForPhase = [];
                    this.timingsByPhase.set(phase, timingsForPhase);
                }
                timingsForPhase.push([contribution.id, time]);
            }
        }
    }
}
export const registerWorkbenchContribution2 = WorkbenchContributionsRegistry.INSTANCE.registerWorkbenchContribution2.bind(WorkbenchContributionsRegistry.INSTANCE);
export const getWorkbenchContribution = WorkbenchContributionsRegistry.INSTANCE.getWorkbenchContribution.bind(WorkbenchContributionsRegistry.INSTANCE);
Registry.add(Extensions.Workbench, WorkbenchContributionsRegistry.INSTANCE);
