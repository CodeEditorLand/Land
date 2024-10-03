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
    private createAction;
    private createToggleAction;
    getActions(): IAction[];
}
