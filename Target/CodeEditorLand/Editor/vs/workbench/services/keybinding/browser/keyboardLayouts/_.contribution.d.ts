import { IKeymapInfo } from '../../common/keymapInfo.js';
export declare class KeyboardLayoutContribution {
    static readonly INSTANCE: KeyboardLayoutContribution;
    private _layoutInfos;
    get layoutInfos(): IKeymapInfo[];
    private constructor();
    registerKeyboardLayout(layout: IKeymapInfo): void;
}
