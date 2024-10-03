import { IHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegate.js';
import { Toggle } from '../../../../base/browser/ui/toggle/toggle.js';
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
    private checkboxStateHandler;
    private readonly hoverDelegate;
    private readonly hoverService;
    toggle: Toggle | undefined;
    private checkboxContainer;
    isDisposed: boolean;
    private hover;
    static readonly checkboxClass = "custom-view-tree-node-item-checkbox";
    private readonly _onDidChangeState;
    readonly onDidChangeState: Event<boolean>;
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
