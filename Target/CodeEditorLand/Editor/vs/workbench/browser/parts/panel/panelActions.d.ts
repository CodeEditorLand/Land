import './media/panelpart.css';
import { Action2, IAction2Options } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../editor/browser/editorExtensions.js';
import { ViewContainerLocation } from '../../../common/views.js';
export declare class TogglePanelAction extends Action2 {
    static readonly ID = "workbench.action.togglePanel";
    static readonly LABEL: import("../../../../nls.js").ILocalizedString;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
declare class MoveViewsBetweenPanelsAction extends Action2 {
    private readonly source;
    private readonly destination;
    constructor(source: ViewContainerLocation, destination: ViewContainerLocation, desc: Readonly<IAction2Options>);
    run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare class MovePanelToSecondarySideBarAction extends MoveViewsBetweenPanelsAction {
    static readonly ID = "workbench.action.movePanelToSecondarySideBar";
    constructor();
}
export declare class MoveSecondarySideBarToPanelAction extends MoveViewsBetweenPanelsAction {
    static readonly ID = "workbench.action.moveSecondarySideBarToPanel";
    constructor();
}
export {};
