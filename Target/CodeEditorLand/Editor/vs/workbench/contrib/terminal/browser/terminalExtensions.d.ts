import { BrandedService, IConstructorSignature } from '../../../../platform/instantiation/common/instantiation.js';
import { IDetachedTerminalInstance, ITerminalContribution, ITerminalInstance } from './terminal.js';
import { TerminalWidgetManager } from './widgets/widgetManager.js';
import { ITerminalProcessInfo, ITerminalProcessManager } from '../common/terminal.js';
export interface ITerminalContributionContext {
    instance: ITerminalInstance;
    processManager: ITerminalProcessManager;
    widgetManager: TerminalWidgetManager;
}
export interface IDetachedCompatibleTerminalContributionContext {
    instance: IDetachedTerminalInstance;
    processManager: ITerminalProcessInfo;
    widgetManager: TerminalWidgetManager;
}
/** Constructor compatible with full terminal instances, is assignable to {@link DetachedCompatibleTerminalContributionCtor} */
export type TerminalContributionCtor = IConstructorSignature<ITerminalContribution, [ITerminalContributionContext]>;
/** Constructor compatible with detached terminals */
export type DetachedCompatibleTerminalContributionCtor = IConstructorSignature<ITerminalContribution, [IDetachedCompatibleTerminalContributionContext]>;
export type ITerminalContributionDescription = {
    readonly id: string;
} & ({
    readonly canRunInDetachedTerminals: false;
    readonly ctor: TerminalContributionCtor;
} | {
    readonly canRunInDetachedTerminals: true;
    readonly ctor: DetachedCompatibleTerminalContributionCtor;
});
/**
 * A terminal contribution is a method for extending _each_ terminal created, providing the terminal
 * instance when it becomes ready and various convenient hooks for xterm.js like when it's opened in
 * the DOM.
 * @param id The unique ID of the terminal contribution.
 * @param ctor The constructor of the terminal contribution.
 * @param canRunInDetachedTerminals Whether the terminal contribution should be run in detecthed
 * terminals. Defaults to false.
 */
export declare function registerTerminalContribution<Services extends BrandedService[]>(id: string, ctor: {
    new (ctx: ITerminalContributionContext, ...services: Services): ITerminalContribution;
}, canRunInDetachedTerminals?: false): void;
export declare function registerTerminalContribution<Services extends BrandedService[]>(id: string, ctor: {
    new (ctx: IDetachedCompatibleTerminalContributionContext, ...services: Services): ITerminalContribution;
}, canRunInDetachedTerminals: true): void;
/**
 * The registry of terminal contributions.
 *
 * **WARNING**: This is internal and should only be used by core terminal code that activates the
 * contributions.
 */
export declare namespace TerminalExtensionsRegistry {
    function getTerminalContributions(): ITerminalContributionDescription[];
}
