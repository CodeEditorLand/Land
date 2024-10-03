import './media/actions.css';
import { ICommandHandler } from '../../../platform/commands/common/commands.js';
import { ServicesAccessor } from '../../../platform/instantiation/common/instantiation.js';
import { Action2, IAction2Options } from '../../../platform/actions/common/actions.js';
export declare class CloseWindowAction extends Action2 {
    static readonly ID = "workbench.action.closeWindow";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
declare abstract class BaseZoomAction extends Action2 {
    private static readonly ZOOM_LEVEL_SETTING_KEY;
    private static readonly ZOOM_PER_WINDOW_SETTING_KEY;
    constructor(desc: Readonly<IAction2Options>);
    protected setZoomLevel(accessor: ServicesAccessor, levelOrReset: number | true): Promise<void>;
}
export declare class ZoomInAction extends BaseZoomAction {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ZoomOutAction extends BaseZoomAction {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ZoomResetAction extends BaseZoomAction {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
declare abstract class BaseSwitchWindow extends Action2 {
    private readonly closeWindowAction;
    private readonly closeDirtyWindowAction;
    constructor(desc: Readonly<IAction2Options>);
    protected abstract isQuickNavigate(): boolean;
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class SwitchWindowAction extends BaseSwitchWindow {
    constructor();
    protected isQuickNavigate(): boolean;
}
export declare class QuickSwitchWindowAction extends BaseSwitchWindow {
    constructor();
    protected isQuickNavigate(): boolean;
}
export declare const NewWindowTabHandler: ICommandHandler;
export declare const ShowPreviousWindowTabHandler: ICommandHandler;
export declare const ShowNextWindowTabHandler: ICommandHandler;
export declare const MoveWindowTabToNewWindowHandler: ICommandHandler;
export declare const MergeWindowTabsHandlerHandler: ICommandHandler;
export declare const ToggleWindowTabsBarHandler: ICommandHandler;
export {};
