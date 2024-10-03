import { IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export interface IPickerDebugItem extends IQuickPickItem {
    accept(): void;
}
export declare function showLoadedScriptMenu(accessor: ServicesAccessor): Promise<void>;
