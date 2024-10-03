import { IAnchor } from '../../../base/browser/ui/contextview/contextview.js';
import { IAction } from '../../../base/common/actions.js';
import './actionWidget.css';
import { IActionListDelegate, IActionListItem } from './actionList.js';
export declare const IActionWidgetService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IActionWidgetService>;
export interface IActionWidgetService {
    readonly _serviceBrand: undefined;
    show<T>(user: string, supportsPreview: boolean, items: readonly IActionListItem<T>[], delegate: IActionListDelegate<T>, anchor: IAnchor, container: HTMLElement | undefined, actionBarActions?: readonly IAction[]): void;
    hide(didCancel?: boolean): void;
    readonly isVisible: boolean;
}
