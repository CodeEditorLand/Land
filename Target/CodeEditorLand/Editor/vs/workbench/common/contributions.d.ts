import { IConstructorSignature, ServicesAccessor, BrandedService } from '../../platform/instantiation/common/instantiation.js';
import { LifecyclePhase } from '../services/lifecycle/common/lifecycle.js';
import { Disposable } from '../../base/common/lifecycle.js';
export interface IWorkbenchContribution {
}
export declare namespace Extensions {
    const Workbench = "workbench.contributions.kind";
}
export declare const enum WorkbenchPhase {
    BlockStartup = 1,
    BlockRestore = 2,
    AfterRestored = 3,
    Eventually = 4
}
export interface ILazyWorkbenchContributionInstantiation {
    readonly lazy: true;
}
export interface IOnEditorWorkbenchContributionInstantiation {
    readonly editorTypeId: string;
}
export type WorkbenchContributionInstantiation = WorkbenchPhase | ILazyWorkbenchContributionInstantiation | IOnEditorWorkbenchContributionInstantiation;
type IWorkbenchContributionSignature<Service extends BrandedService[]> = new (...services: Service) => IWorkbenchContribution;
export interface IWorkbenchContributionsRegistry {
    registerWorkbenchContribution<Services extends BrandedService[]>(contribution: IWorkbenchContributionSignature<Services>, phase: LifecyclePhase.Restored | LifecyclePhase.Eventually): void;
    start(accessor: ServicesAccessor): void;
    readonly whenRestored: Promise<void>;
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
export declare const registerWorkbenchContribution2: {
    <Services extends BrandedService[]>(id: string, ctor: IWorkbenchContributionSignature<Services>, instantiation: WorkbenchContributionInstantiation): void;
};
export declare const getWorkbenchContribution: <T extends IWorkbenchContribution>(id: string) => T;
export {};
