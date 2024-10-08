import { Action, IAction } from '../../../../base/common/actions.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { ISelectOptionItem } from '../../../../base/browser/ui/selectBox/selectBox.js';
import { SelectActionViewItem } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
export interface IQuickDiffSelectItem extends ISelectOptionItem {
    provider: string;
}
export declare class SwitchQuickDiffViewItem extends SelectActionViewItem<IQuickDiffSelectItem> {
    private readonly optionsItems;
    constructor(action: IAction, providers: string[], selected: string, contextViewService: IContextViewService, themeService: IThemeService);
    setSelection(provider: string): void;
    protected getActionContext(_: string, index: number): IQuickDiffSelectItem;
    render(container: HTMLElement): void;
}
export declare class SwitchQuickDiffBaseAction extends Action {
    private readonly callback;
    static readonly ID = "quickDiff.base.switch";
    static readonly LABEL: string;
    constructor(callback: (event?: IQuickDiffSelectItem) => void);
    run(event?: IQuickDiffSelectItem): Promise<void>;
}
