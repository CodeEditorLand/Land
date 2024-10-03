import { DisposableStore, IDisposable } from '../../../../base/common/lifecycle.js';
import { ThemeColor } from '../../../../base/common/themables.js';
import { Command } from '../../../../editor/common/languages.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { ColorIdentifier } from '../../../../platform/theme/common/colorRegistry.js';
import { IAuxiliaryStatusbarPart, IStatusbarEntryContainer } from '../../../browser/parts/statusbar/statusbarPart.js';
export declare const IStatusbarService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IStatusbarService>;
export interface IStatusbarService extends IStatusbarEntryContainer {
    readonly _serviceBrand: undefined;
    getPart(container: HTMLElement): IStatusbarEntryContainer;
    createAuxiliaryStatusbarPart(container: HTMLElement): IAuxiliaryStatusbarPart;
    createScoped(statusbarEntryContainer: IStatusbarEntryContainer, disposables: DisposableStore): IStatusbarService;
}
export declare const enum StatusbarAlignment {
    LEFT = 0,
    RIGHT = 1
}
export interface IStatusbarEntryLocation {
    id: string;
    alignment: StatusbarAlignment;
    compact?: boolean;
}
export declare function isStatusbarEntryLocation(thing: unknown): thing is IStatusbarEntryLocation;
export interface IStatusbarEntryPriority {
    readonly primary: number | IStatusbarEntryLocation;
    readonly secondary: number;
}
export declare function isStatusbarEntryPriority(thing: unknown): thing is IStatusbarEntryPriority;
export declare const ShowTooltipCommand: Command;
export interface IStatusbarStyleOverride {
    readonly priority: number;
    readonly foreground?: ColorIdentifier;
    readonly background?: ColorIdentifier;
    readonly border?: ColorIdentifier;
}
export type StatusbarEntryKind = 'standard' | 'warning' | 'error' | 'prominent' | 'remote' | 'offline';
export declare const StatusbarEntryKinds: StatusbarEntryKind[];
export interface IStatusbarEntry {
    readonly name: string;
    readonly text: string;
    readonly ariaLabel: string;
    readonly role?: string;
    readonly tooltip?: string | IMarkdownString | HTMLElement;
    readonly color?: string | ThemeColor;
    readonly backgroundColor?: string | ThemeColor;
    readonly command?: string | Command | typeof ShowTooltipCommand;
    readonly showBeak?: boolean;
    readonly showProgress?: boolean | 'loading' | 'syncing';
    readonly kind?: StatusbarEntryKind;
    readonly showInAllWindows?: boolean;
}
export interface IStatusbarEntryAccessor extends IDisposable {
    update(properties: IStatusbarEntry): void;
}
