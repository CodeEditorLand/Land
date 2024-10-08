import { StatusbarAlignment as MainThreadStatusBarAlignment, IStatusbarEntry } from '../../services/statusbar/browser/statusbar.js';
import { ThemeColor } from '../../../base/common/themables.js';
import { Command } from '../../../editor/common/languages.js';
import { IAccessibilityInformation } from '../../../platform/accessibility/common/accessibility.js';
import { IMarkdownString } from '../../../base/common/htmlContent.js';
import { Event } from '../../../base/common/event.js';
export declare const IExtensionStatusBarItemService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionStatusBarItemService>;
export interface IExtensionStatusBarItemChangeEvent {
    readonly added?: ExtensionStatusBarEntry;
    readonly removed?: string;
}
export type ExtensionStatusBarEntry = [
    string,
    {
        entry: IStatusbarEntry;
        alignment: MainThreadStatusBarAlignment;
        priority: number;
    }
];
export declare const enum StatusBarUpdateKind {
    DidDefine = 0,
    DidUpdate = 1
}
export interface IExtensionStatusBarItemService {
    readonly _serviceBrand: undefined;
    onDidChange: Event<IExtensionStatusBarItemChangeEvent>;
    setOrUpdateEntry(id: string, statusId: string, extensionId: string | undefined, name: string, text: string, tooltip: IMarkdownString | string | undefined, command: Command | undefined, color: string | ThemeColor | undefined, backgroundColor: ThemeColor | undefined, alignLeft: boolean, priority: number | undefined, accessibilityInformation: IAccessibilityInformation | undefined): StatusBarUpdateKind;
    unsetEntry(id: string): void;
    getEntries(): Iterable<ExtensionStatusBarEntry>;
}
export declare class StatusBarItemsExtensionPoint {
    constructor(statusBarItemsService: IExtensionStatusBarItemService);
}
