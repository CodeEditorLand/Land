import { Event } from '../../../base/common/event.js';
import { IKeyboardEvent } from '../../keybinding/common/keybinding.js';
import { IKeyboardMapper } from './keyboardMapper.js';
export declare const IKeyboardLayoutService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IKeyboardLayoutService>;
export interface IWindowsKeyMapping {
    vkey: string;
    value: string;
    withShift: string;
    withAltGr: string;
    withShiftAltGr: string;
}
export interface IWindowsKeyboardMapping {
    [code: string]: IWindowsKeyMapping;
}
export interface ILinuxKeyMapping {
    value: string;
    withShift: string;
    withAltGr: string;
    withShiftAltGr: string;
}
export interface ILinuxKeyboardMapping {
    [code: string]: ILinuxKeyMapping;
}
export interface IMacKeyMapping {
    value: string;
    valueIsDeadKey: boolean;
    withShift: string;
    withShiftIsDeadKey: boolean;
    withAltGr: string;
    withAltGrIsDeadKey: boolean;
    withShiftAltGr: string;
    withShiftAltGrIsDeadKey: boolean;
}
export interface IMacKeyboardMapping {
    [code: string]: IMacKeyMapping;
}
export type IMacLinuxKeyMapping = IMacKeyMapping | ILinuxKeyMapping;
export type IMacLinuxKeyboardMapping = IMacKeyboardMapping | ILinuxKeyboardMapping;
export type IKeyboardMapping = IWindowsKeyboardMapping | ILinuxKeyboardMapping | IMacKeyboardMapping;
export interface IWindowsKeyboardLayoutInfo {
    name: string;
    id: string;
    text: string;
}
export interface ILinuxKeyboardLayoutInfo {
    model: string;
    group: number;
    layout: string;
    variant: string;
    options: string;
    rules: string;
}
export interface IMacKeyboardLayoutInfo {
    id: string;
    lang: string;
    localizedName?: string;
}
export type IKeyboardLayoutInfo = (IWindowsKeyboardLayoutInfo | ILinuxKeyboardLayoutInfo | IMacKeyboardLayoutInfo) & {
    isUserKeyboardLayout?: boolean;
    isUSStandard?: true;
};
export interface IKeyboardLayoutService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeKeyboardLayout: Event<void>;
    getRawKeyboardMapping(): IKeyboardMapping | null;
    getCurrentKeyboardLayout(): IKeyboardLayoutInfo | null;
    getAllKeyboardLayouts(): IKeyboardLayoutInfo[];
    getKeyboardMapper(): IKeyboardMapper;
    validateCurrentKeyboardMapping(keyboardEvent: IKeyboardEvent): void;
}
export declare function areKeyboardLayoutsEqual(a: IKeyboardLayoutInfo | null, b: IKeyboardLayoutInfo | null): boolean;
export declare function parseKeyboardLayoutDescription(layout: IKeyboardLayoutInfo | null): {
    label: string;
    description: string;
};
export declare function getKeyboardLayoutId(layout: IKeyboardLayoutInfo): string;
export declare function windowsKeyboardMappingEquals(a: IWindowsKeyboardMapping | null, b: IWindowsKeyboardMapping | null): boolean;
export declare function macLinuxKeyboardMappingEquals(a: IMacLinuxKeyboardMapping | null, b: IMacLinuxKeyboardMapping | null): boolean;
