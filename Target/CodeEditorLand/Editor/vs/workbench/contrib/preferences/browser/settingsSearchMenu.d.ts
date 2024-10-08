import { IActionViewItemOptions } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { DropdownMenuActionViewItem } from '../../../../base/browser/ui/dropdown/dropdownActionViewItem.js';
import { IAction, IActionRunner } from '../../../../base/common/actions.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { SuggestEnabledInput } from '../../codeEditor/browser/suggestEnabledInput/suggestEnabledInput.js';
export declare class SettingsSearchFilterDropdownMenuActionViewItem extends DropdownMenuActionViewItem {
    private readonly searchWidget;
    private readonly suggestController;
    constructor(action: IAction, options: IActionViewItemOptions, actionRunner: IActionRunner | undefined, searchWidget: SuggestEnabledInput, contextMenuService: IContextMenuService);
    render(container: HTMLElement): void;
    private doSearchWidgetAction;
    /**
     * The created action appends a query to the search widget search string. It optionally triggers suggestions.
     */
    private createAction;
    /**
     * The created action appends a query to the search widget search string, if the query does not exist.
     * Otherwise, it removes the query from the search widget search string.
     * The action does not trigger suggestions after adding or removing the query.
     */
    private createToggleAction;
    getActions(): IAction[];
}
