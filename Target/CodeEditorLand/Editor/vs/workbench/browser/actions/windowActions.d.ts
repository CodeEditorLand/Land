import { Action2, IAction2Options } from '../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../platform/instantiation/common/instantiation.js';
export declare const inRecentFilesPickerContextKey = "inRecentFilesPicker";
declare abstract class BaseOpenRecentAction extends Action2 {
    private readonly removeFromRecentlyOpened;
    private readonly dirtyRecentlyOpenedFolder;
    private readonly dirtyRecentlyOpenedWorkspace;
    constructor(desc: Readonly<IAction2Options>);
    protected abstract isQuickNavigate(): boolean;
    run(accessor: ServicesAccessor): Promise<void>;
    private toQuickPick;
}
export declare class OpenRecentAction extends BaseOpenRecentAction {
    static ID: string;
    constructor();
    protected isQuickNavigate(): boolean;
}
export declare class ReloadWindowAction extends Action2 {
    static readonly ID = "workbench.action.reloadWindow";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export {};
