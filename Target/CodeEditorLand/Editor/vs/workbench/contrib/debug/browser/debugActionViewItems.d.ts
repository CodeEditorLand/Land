import { IAction } from '../../../../base/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IDebugService, IDebugSession } from '../common/debug.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { BaseActionViewItem, IBaseActionViewItemOptions, SelectActionViewItem } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
export declare class StartDebugActionViewItem extends BaseActionViewItem {
    private context;
    private readonly debugService;
    private readonly configurationService;
    private readonly commandService;
    private readonly contextService;
    private readonly keybindingService;
    private readonly hoverService;
    private readonly contextKeyService;
    private static readonly SEPARATOR;
    private container;
    private start;
    private selectBox;
    private debugOptions;
    private toDispose;
    private selected;
    private providers;
    constructor(context: unknown, action: IAction, options: IBaseActionViewItemOptions, debugService: IDebugService, configurationService: IConfigurationService, commandService: ICommandService, contextService: IWorkspaceContextService, contextViewService: IContextViewService, keybindingService: IKeybindingService, hoverService: IHoverService, contextKeyService: IContextKeyService);
    private registerListeners;
    render(container: HTMLElement): void;
    setActionContext(context: any): void;
    isEnabled(): boolean;
    focus(fromRight?: boolean): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
    dispose(): void;
    private updateOptions;
    private _setAriaLabel;
}
export declare class FocusSessionActionViewItem extends SelectActionViewItem<IDebugSession> {
    protected readonly debugService: IDebugService;
    private readonly configurationService;
    constructor(action: IAction, session: IDebugSession | undefined, debugService: IDebugService, contextViewService: IContextViewService, configurationService: IConfigurationService);
    protected getActionContext(_: string, index: number): IDebugSession;
    private update;
    private getSelectedSession;
    protected getSessions(): ReadonlyArray<IDebugSession>;
    protected mapFocusedSessionToSelected(focusedSession: IDebugSession): IDebugSession;
}
