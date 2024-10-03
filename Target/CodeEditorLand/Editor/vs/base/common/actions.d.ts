import { Emitter, Event } from './event.js';
import { Disposable, IDisposable } from './lifecycle.js';
export interface ITelemetryData {
    readonly from?: string;
    readonly target?: string;
    [key: string]: unknown;
}
export type WorkbenchActionExecutedClassification = {
    id: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The identifier of the action that was run.';
    };
    from: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The name of the component the action was run from.';
    };
    detail?: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'Optional details about how the action was run, e.g which keybinding was used.';
    };
    owner: 'bpasero';
    comment: 'Provides insight into actions that are executed within the workbench.';
};
export type WorkbenchActionExecutedEvent = {
    id: string;
    from: string;
    detail?: string;
};
export interface IAction {
    readonly id: string;
    label: string;
    tooltip: string;
    class: string | undefined;
    enabled: boolean;
    checked?: boolean;
    run(...args: unknown[]): unknown;
}
export interface IActionRunner extends IDisposable {
    readonly onDidRun: Event<IRunEvent>;
    readonly onWillRun: Event<IRunEvent>;
    run(action: IAction, context?: unknown): unknown;
}
export interface IActionChangeEvent {
    readonly label?: string;
    readonly tooltip?: string;
    readonly class?: string;
    readonly enabled?: boolean;
    readonly checked?: boolean;
}
export declare class Action extends Disposable implements IAction {
    protected _onDidChange: Emitter<IActionChangeEvent>;
    readonly onDidChange: Event<IActionChangeEvent>;
    protected readonly _id: string;
    protected _label: string;
    protected _tooltip: string | undefined;
    protected _cssClass: string | undefined;
    protected _enabled: boolean;
    protected _checked?: boolean;
    protected readonly _actionCallback?: (event?: unknown) => unknown;
    constructor(id: string, label?: string, cssClass?: string, enabled?: boolean, actionCallback?: (event?: unknown) => unknown);
    get id(): string;
    get label(): string;
    set label(value: string);
    private _setLabel;
    get tooltip(): string;
    set tooltip(value: string);
    protected _setTooltip(value: string): void;
    get class(): string | undefined;
    set class(value: string | undefined);
    protected _setClass(value: string | undefined): void;
    get enabled(): boolean;
    set enabled(value: boolean);
    protected _setEnabled(value: boolean): void;
    get checked(): boolean | undefined;
    set checked(value: boolean | undefined);
    protected _setChecked(value: boolean | undefined): void;
    run(event?: unknown, data?: ITelemetryData): Promise<void>;
}
export interface IRunEvent {
    readonly action: IAction;
    readonly error?: Error;
}
export declare class ActionRunner extends Disposable implements IActionRunner {
    private readonly _onWillRun;
    readonly onWillRun: Event<IRunEvent>;
    private readonly _onDidRun;
    readonly onDidRun: Event<IRunEvent>;
    run(action: IAction, context?: unknown): Promise<void>;
    protected runAction(action: IAction, context?: unknown): Promise<void>;
}
export declare class Separator implements IAction {
    static join(...actionLists: readonly IAction[][]): IAction[];
    static readonly ID = "vs.actions.separator";
    readonly id: string;
    readonly label: string;
    readonly tooltip: string;
    readonly class: string;
    readonly enabled: boolean;
    readonly checked: boolean;
    run(): Promise<void>;
}
export declare class SubmenuAction implements IAction {
    readonly id: string;
    readonly label: string;
    readonly class: string | undefined;
    readonly tooltip: string;
    readonly enabled: boolean;
    readonly checked: undefined;
    private readonly _actions;
    get actions(): readonly IAction[];
    constructor(id: string, label: string, actions: readonly IAction[], cssClass?: string);
    run(): Promise<void>;
}
export declare class EmptySubmenuAction extends Action {
    static readonly ID = "vs.actions.empty";
    constructor();
}
export declare function toAction(props: {
    id: string;
    label: string;
    tooltip?: string;
    enabled?: boolean;
    checked?: boolean;
    class?: string;
    run: Function;
}): IAction;
