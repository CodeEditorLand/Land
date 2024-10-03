import '../colorPicker.css';
import { Disposable } from '../../../../../base/common/lifecycle.js';
export declare class InsertButton extends Disposable {
    private _button;
    private readonly _onClicked;
    readonly onClicked: import("../../../../../workbench/workbench.web.main.internal").Event<void>;
    constructor(container: HTMLElement);
    get button(): HTMLElement;
}
