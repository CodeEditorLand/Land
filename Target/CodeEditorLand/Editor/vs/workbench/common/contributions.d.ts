import { IConstructorSignature, ServicesAccessor, BrandedService } from '../../platform/instantiation/common/instantiation.js';
import { LifecyclePhase } from '../services/lifecycle/common/lifecycle.js';
import { Disposable } from '../../base/common/lifecycle.js';
/**
 * A workbench contribution that will be loaded when the workbench starts and disposed when the workbench shuts down.
 */
export interface IWorkbenchContribution {
}
export declare namespace Extensions {
    /**
     * @deprecated use `registerWorkbenchContribution2` instead.
     */
    const Workbench = "workbench.contributions.kind";
}
export declare const enum WorkbenchPhase {
    /**
     * The first phase signals that we are about to startup getting ready.
     *
     * Note: doing work in this phase blocks an editor from showing to
     * the user, so please rather consider to use the other types, preferable
     * `Lazy` to only instantiate the contribution when really needed.
     */
    BlockStartup = 1,
    /**
     * Services are ready and the window is about to restore its UI state.
     *
     * Note: doing work in this phase blocks an editor from showing to
     * the user, so please rather consider to use the other types, preferable
     * `Lazy` to only instantiate the contribution when really needed.
     */
    BlockRestore = 2,
    /**
     * Views, panels and editors have restored. Editors are given a bit of
     * time to restore their contents.
     */
    AfterRestored = 3,
    /**
     * The last phase after views, panels and editors have restored and
     * some time has passed (2-5 seconds).
     */
    Eventually = 4
}
/**
 * A workbenchch contribution that will only be instantiated
 * when calling `getWorkbenchContribution`.
 */
export interface ILazyWorkbenchContributionInstantiation {
    readonly lazy: true;
}
/**
 * A workbench contribution that will be instantiated when the
 * corresponding editor is being created.
 */
export interface IOnEditorWorkbenchContributionInstantiation {
    readonly editorTypeId: string;
}
export type WorkbenchContributionInstantiation = WorkbenchPhase | ILazyWorkbenchContributionInstantiation | IOnEditorWorkbenchContributionInstantiation;
type IWorkbenchContributionSignature<Service extends BrandedService[]> = new (...services: Service) => IWorkbenchContribution;
export interface IWorkbenchContributionsRegistry {
    /**
     * @deprecated use `registerWorkbenchContribution2` instead.
     */
    registerWorkbenchContribution<Services extends BrandedService[]>(contribution: IWorkbenchContributionSignature<Services>, phase: LifecyclePhase.Restored | LifecyclePhase.Eventually): void;
    /**
     * Starts the registry by providing the required services.
     */
    start(accessor: ServicesAccessor): void;
    /**
     * A promise that resolves when all contributions up to the `Restored`
     * phase have been instantiated.
     */
    readonly whenRestored: Promise<void>;
    /**
     * Provides access to the instantiation times of all contributions by
     * lifecycle phase.
     */
    readonly timings: Map<LifecyclePhase, Array<[string, number]>>;
}
export declare class WorkbenchContributionsRegistry extends Disposable implements IWorkbenchContributionsRegistry {
    static readonly INSTANCE: WorkbenchContributionsRegistry;
    private static readonly BLOCK_BEFORE_RESTORE_WARN_THRESHOLD;
    private static readonly BLOCK_AFTER_RESTORE_WARN_THRESHOLD;
    private instantiationService;
    private lifecycleService;
    private logService;
    private environmentService;
    private editorPaneService;
    private readonly contributionsByPhase;
    private readonly contributionsByEditor;
    private readonly contributionsById;
    private readonly instancesById;
    private readonly instanceDisposables;
    private readonly timingsByPhase;
    get timings(): Map<LifecyclePhase, [string, number][]>;
    private readonly pendingRestoredContributions;
    readonly whenRestored: Promise<void>;
    registerWorkbenchContribution2(id: string, ctor: IConstructorSignature<IWorkbenchContribution>, phase: WorkbenchPhase.BlockStartup | WorkbenchPhase.BlockRestore): void;
    registerWorkbenchContribution2(id: string | undefined, ctor: IConstructorSignature<IWorkbenchContribution>, phase: WorkbenchPhase.AfterRestored | WorkbenchPhase.Eventually): void;
    registerWorkbenchContribution2(id: string, ctor: IConstructorSignature<IWorkbenchContribution>, lazy: ILazyWorkbenchContributionInstantiation): void;
    registerWorkbenchContribution2(id: string, ctor: IConstructorSignature<IWorkbenchContribution>, onEditor: IOnEditorWorkbenchContributionInstantiation): void;
    registerWorkbenchContribution(ctor: IConstructorSignature<IWorkbenchContribution>, phase: LifecyclePhase.Restored | LifecyclePhase.Eventually): void;
    getWorkbenchContribution<T extends IWorkbenchContribution>(id: string): T;
    start(accessor: ServicesAccessor): void;
    private onEditor;
    private instantiateByPhase;
    private doInstantiateByPhase;
    private doInstantiateWhenIdle;
    private safeCreateContribution;
}
/**
 * Register a workbench contribution that will be instantiated
 * based on the `instantiation` property.
 */
export declare const registerWorkbenchContribution2: {
    <Services extends BrandedService[]>(id: string, ctor: IWorkbenchContributionSignature<Services>, instantiation: WorkbenchContributionInstantiation): void;
};
/**
 * Provides access to a workbench contribution with a specific identifier.
 * The contribution is created if not yet done.
 *
 * Note: will throw an error if
 * - called too early before the registry has started
 * - no contribution is known for the given identifier
 */
export declare const getWorkbenchContribution: <T extends IWorkbenchContribution>(id: string) => T;
export {};
