import { IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export interface IPickerDebugItem extends IQuickPickItem {
    accept(): void;
}
/**
 * This function takes a regular quickpick and makes one for loaded scripts that has persistent headers
 * e.g. when some picks are filtered out, the ones that are visible still have its header.
 */
export declare function showLoadedScriptMenu(accessor: ServicesAccessor): Promise<void>;
