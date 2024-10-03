import { Action, IAction } from '../../../../base/common/actions.js';
import { UriComponents } from '../../../../base/common/uri.js';
import { ActionViewItem } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
export declare class ToggleReactionsAction extends Action {
    static readonly ID = "toolbar.toggle.pickReactions";
    private _menuActions;
    private toggleDropdownMenu;
    constructor(toggleDropdownMenu: () => void, title?: string);
    run(): Promise<any>;
    get menuActions(): IAction[];
    set menuActions(actions: IAction[]);
}
export declare class ReactionActionViewItem extends ActionViewItem {
    constructor(action: ReactionAction);
    protected updateLabel(): void;
    protected getTooltip(): string | undefined;
}
export declare class ReactionAction extends Action {
    readonly reactors?: readonly string[] | undefined;
    icon?: UriComponents | undefined;
    count?: number | undefined;
    static readonly ID = "toolbar.toggle.reaction";
    constructor(id: string, label?: string, cssClass?: string, enabled?: boolean, actionCallback?: (event?: any) => Promise<any>, reactors?: readonly string[] | undefined, icon?: UriComponents | undefined, count?: number | undefined);
}
