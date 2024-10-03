import { IActionViewItemOptions } from './actionViewItems.js';
import { IHoverDelegate } from '../hover/hoverDelegate.js';
import { IAction, IActionRunner, IRunEvent } from '../../../common/actions.js';
import { KeyCode } from '../../../common/keyCodes.js';
import { Disposable, IDisposable } from '../../../common/lifecycle.js';
import './actionbar.css';
export interface IActionViewItem extends IDisposable {
    action: IAction;
    actionRunner: IActionRunner;
    setActionContext(context: unknown): void;
    render(element: HTMLElement): void;
    isEnabled(): boolean;
    focus(fromRight?: boolean): void;
    blur(): void;
    showHover?(): void;
}
export interface IActionViewItemProvider {
    (action: IAction, options: IActionViewItemOptions): IActionViewItem | undefined;
}
export declare const enum ActionsOrientation {
    HORIZONTAL = 0,
    VERTICAL = 1
}
export interface ActionTrigger {
    keys?: KeyCode[];
    keyDown: boolean;
}
export interface IActionBarOptions {
    readonly orientation?: ActionsOrientation;
    readonly context?: unknown;
    readonly actionViewItemProvider?: IActionViewItemProvider;
    readonly actionRunner?: IActionRunner;
    readonly ariaLabel?: string;
    readonly ariaRole?: string;
    readonly triggerKeys?: ActionTrigger;
    readonly allowContextMenu?: boolean;
    readonly preventLoopNavigation?: boolean;
    readonly focusOnlyEnabledItems?: boolean;
    readonly hoverDelegate?: IHoverDelegate;
    readonly highlightToggledItems?: boolean;
}
export interface IActionOptions extends IActionViewItemOptions {
    index?: number;
}
export declare class ActionBar extends Disposable implements IActionRunner {
    private readonly options;
    private readonly _hoverDelegate;
    private _actionRunner;
    private readonly _actionRunnerDisposables;
    private _context;
    private readonly _orientation;
    private readonly _triggerKeys;
    viewItems: IActionViewItem[];
    private readonly viewItemDisposables;
    private previouslyFocusedItem?;
    protected focusedItem?: number;
    private focusTracker;
    private triggerKeyDown;
    private focusable;
    domNode: HTMLElement;
    protected readonly actionsList: HTMLElement;
    private readonly _onDidBlur;
    readonly onDidBlur: import("../../../common/event.js").Event<void>;
    private readonly _onDidCancel;
    readonly onDidCancel: import("../../../common/event.js").Event<void>;
    private cancelHasListener;
    private readonly _onDidRun;
    readonly onDidRun: import("../../../common/event.js").Event<IRunEvent>;
    private readonly _onWillRun;
    readonly onWillRun: import("../../../common/event.js").Event<IRunEvent>;
    constructor(container: HTMLElement, options?: IActionBarOptions);
    private refreshRole;
    setAriaLabel(label: string): void;
    setFocusable(focusable: boolean): void;
    private isTriggerKeyEvent;
    private updateFocusedItem;
    get context(): unknown;
    set context(context: unknown);
    get actionRunner(): IActionRunner;
    set actionRunner(actionRunner: IActionRunner);
    getContainer(): HTMLElement;
    hasAction(action: IAction): boolean;
    getAction(indexOrElement: number | HTMLElement): IAction | undefined;
    push(arg: IAction | ReadonlyArray<IAction>, options?: IActionOptions): void;
    getWidth(index: number): number;
    getHeight(index: number): number;
    pull(index: number): void;
    clear(): void;
    length(): number;
    isEmpty(): boolean;
    focus(index?: number): void;
    focus(selectFirst?: boolean): void;
    private focusFirst;
    private focusLast;
    protected focusNext(forceLoop?: boolean, forceFocus?: boolean): boolean;
    protected focusPrevious(forceLoop?: boolean): boolean;
    protected updateFocus(fromRight?: boolean, preventScroll?: boolean, forceFocus?: boolean): void;
    private doTrigger;
    run(action: IAction, context?: unknown): Promise<void>;
    dispose(): void;
}
export declare function prepareActions(actions: IAction[]): IAction[];
