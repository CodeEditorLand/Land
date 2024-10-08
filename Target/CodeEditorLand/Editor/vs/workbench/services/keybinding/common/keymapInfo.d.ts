import { IKeyboardLayoutInfo } from '../../../../platform/keyboardLayout/common/keyboardLayout.js';
export interface IRawMixedKeyboardMapping {
    [key: string]: {
        value: string;
        withShift: string;
        withAltGr: string;
        withShiftAltGr: string;
        valueIsDeadKey?: boolean;
        withShiftIsDeadKey?: boolean;
        withAltGrIsDeadKey?: boolean;
        withShiftAltGrIsDeadKey?: boolean;
    };
}
interface ISerializedMapping {
    [key: string]: (string | number)[];
}
export interface IKeymapInfo {
    layout: IKeyboardLayoutInfo;
    secondaryLayouts: IKeyboardLayoutInfo[];
    mapping: ISerializedMapping;
    isUserKeyboardLayout?: boolean;
}
export declare class KeymapInfo {
    layout: IKeyboardLayoutInfo;
    secondaryLayouts: IKeyboardLayoutInfo[];
    mapping: IRawMixedKeyboardMapping;
    isUserKeyboardLayout: boolean;
    constructor(layout: IKeyboardLayoutInfo, secondaryLayouts: IKeyboardLayoutInfo[], keyboardMapping: ISerializedMapping, isUserKeyboardLayout?: boolean);
    static createKeyboardLayoutFromDebugInfo(layout: IKeyboardLayoutInfo, value: IRawMixedKeyboardMapping, isUserKeyboardLayout?: boolean): KeymapInfo;
    update(other: KeymapInfo): void;
    getScore(other: IRawMixedKeyboardMapping): number;
    equal(other: KeymapInfo): boolean;
    fuzzyEqual(other: IRawMixedKeyboardMapping): boolean;
}
export {};
