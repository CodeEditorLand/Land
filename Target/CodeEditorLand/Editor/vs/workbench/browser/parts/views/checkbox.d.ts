import { IHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegate.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import type { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { ITreeItem } from '../../../common/views.js';
export declare class CheckboxStateHandler extends Disposable {
    private readonly _onDidChangeCheckboxState;
    readonly onDidChangeCheckboxState: Event<ITreeItem[]>;
    setCheckboxState(node: ITreeItem): void;
}
export declare class TreeItemCheckbox extends Disposable {
    private readonly checkboxStateHandler;
    private readonly hoverDelegate;
    private readonly hoverService;
    private toggle;
    private readonly checkboxContainer;
    private hover;
    static readonly checkboxClass = "custom-view-tree-node-item-checkbox";
    constructor(container: HTMLElement, checkboxStateHandler: CheckboxStateHandler, hoverDelegate: IHoverDelegate, hoverService: IHoverService);
    render(node: ITreeItem): void;
    private createCheckbox;
    private registerListener;
    private setHover;
    private setCheckbox;
    private checkboxHoverContent;
    private setAccessibilityInformation;
    private removeCheckbox;
}
