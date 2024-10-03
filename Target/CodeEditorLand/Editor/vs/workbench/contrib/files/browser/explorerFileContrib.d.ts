import { DisposableStore, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
export declare const enum ExplorerExtensions {
    FileContributionRegistry = "workbench.registry.explorer.fileContributions"
}
export interface IExplorerFileContribution extends IDisposable {
    setResource(resource: URI | undefined): void;
}
export interface IExplorerFileContributionDescriptor {
    create(insta: IInstantiationService, container: HTMLElement): IExplorerFileContribution;
}
export interface IExplorerFileContributionRegistry {
    register(descriptor: IExplorerFileContributionDescriptor): void;
}
declare class ExplorerFileContributionRegistry implements IExplorerFileContributionRegistry {
    private readonly _onDidRegisterDescriptor;
    readonly onDidRegisterDescriptor: import("../../../workbench.web.main.internal.js").Event<IExplorerFileContributionDescriptor>;
    private readonly descriptors;
    register(descriptor: IExplorerFileContributionDescriptor): void;
    create(insta: IInstantiationService, container: HTMLElement, store: DisposableStore): IExplorerFileContribution[];
}
export declare const explorerFileContribRegistry: ExplorerFileContributionRegistry;
export {};
