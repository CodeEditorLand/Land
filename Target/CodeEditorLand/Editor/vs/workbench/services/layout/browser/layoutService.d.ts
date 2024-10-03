import { Event } from '../../../../base/common/event.js';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
import { Part } from '../../../browser/part.js';
import { IDimension } from '../../../../base/browser/dom.js';
import { Direction } from '../../../../base/browser/ui/grid/grid.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
export declare const IWorkbenchLayoutService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchLayoutService>;
export declare const enum Parts {
    TITLEBAR_PART = "workbench.parts.titlebar",
    BANNER_PART = "workbench.parts.banner",
    ACTIVITYBAR_PART = "workbench.parts.activitybar",
    SIDEBAR_PART = "workbench.parts.sidebar",
    PANEL_PART = "workbench.parts.panel",
    AUXILIARYBAR_PART = "workbench.parts.auxiliarybar",
    EDITOR_PART = "workbench.parts.editor",
    STATUSBAR_PART = "workbench.parts.statusbar"
}
export declare const enum ZenModeSettings {
    SHOW_TABS = "zenMode.showTabs",
    HIDE_LINENUMBERS = "zenMode.hideLineNumbers",
    HIDE_STATUSBAR = "zenMode.hideStatusBar",
    HIDE_ACTIVITYBAR = "zenMode.hideActivityBar",
    CENTER_LAYOUT = "zenMode.centerLayout",
    FULLSCREEN = "zenMode.fullScreen",
    RESTORE = "zenMode.restore",
    SILENT_NOTIFICATIONS = "zenMode.silentNotifications"
}
export declare const enum LayoutSettings {
    ACTIVITY_BAR_LOCATION = "workbench.activityBar.location",
    EDITOR_TABS_MODE = "workbench.editor.showTabs",
    EDITOR_ACTIONS_LOCATION = "workbench.editor.editorActionsLocation",
    COMMAND_CENTER = "window.commandCenter",
    LAYOUT_ACTIONS = "workbench.layoutControl.enabled"
}
export declare const enum ActivityBarPosition {
    DEFAULT = "default",
    TOP = "top",
    BOTTOM = "bottom",
    HIDDEN = "hidden"
}
export declare const enum EditorTabsMode {
    MULTIPLE = "multiple",
    SINGLE = "single",
    NONE = "none"
}
export declare const enum EditorActionsLocation {
    DEFAULT = "default",
    TITLEBAR = "titleBar",
    HIDDEN = "hidden"
}
export declare const enum Position {
    LEFT = 0,
    RIGHT = 1,
    BOTTOM = 2,
    TOP = 3
}
export declare function isHorizontal(position: Position): boolean;
export declare const enum PanelOpensMaximizedOptions {
    ALWAYS = 0,
    NEVER = 1,
    REMEMBER_LAST = 2
}
export type PanelAlignment = 'left' | 'center' | 'right' | 'justify';
export declare function positionToString(position: Position): string;
export declare function positionFromString(str: string): Position;
export declare function panelOpensMaximizedFromString(str: string): PanelOpensMaximizedOptions;
export type MULTI_WINDOW_PARTS = Parts.EDITOR_PART | Parts.STATUSBAR_PART | Parts.TITLEBAR_PART;
export type SINGLE_WINDOW_PARTS = Exclude<Parts, MULTI_WINDOW_PARTS>;
export interface IWorkbenchLayoutService extends ILayoutService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeZenMode: Event<boolean>;
    readonly onDidChangeWindowMaximized: Event<{
        readonly windowId: number;
        readonly maximized: boolean;
    }>;
    readonly onDidChangeMainEditorCenteredLayout: Event<boolean>;
    readonly onDidChangePanelPosition: Event<string>;
    readonly onDidChangePanelAlignment: Event<PanelAlignment>;
    readonly onDidChangePartVisibility: Event<void>;
    readonly onDidChangeNotificationsVisibility: Event<boolean>;
    readonly openedDefaultEditors: boolean;
    layout(): void;
    isRestored(): boolean;
    readonly whenRestored: Promise<void>;
    hasFocus(part: Parts): boolean;
    focusPart(part: SINGLE_WINDOW_PARTS): void;
    focusPart(part: MULTI_WINDOW_PARTS, targetWindow: Window): void;
    focusPart(part: Parts, targetWindow: Window): void;
    getContainer(targetWindow: Window): HTMLElement;
    getContainer(targetWindow: Window, part: Parts): HTMLElement | undefined;
    isVisible(part: SINGLE_WINDOW_PARTS): boolean;
    isVisible(part: MULTI_WINDOW_PARTS, targetWindow: Window): boolean;
    isVisible(part: Parts, targetWindow: Window): boolean;
    setPartHidden(hidden: boolean, part: Exclude<SINGLE_WINDOW_PARTS, Parts.STATUSBAR_PART | Parts.TITLEBAR_PART>): void;
    setPartHidden(hidden: boolean, part: Exclude<MULTI_WINDOW_PARTS, Parts.STATUSBAR_PART | Parts.TITLEBAR_PART>, targetWindow: Window): void;
    setPartHidden(hidden: boolean, part: Exclude<Parts, Parts.STATUSBAR_PART | Parts.TITLEBAR_PART>, targetWindow: Window): void;
    toggleMaximizedPanel(): void;
    hasMainWindowBorder(): boolean;
    getMainWindowBorderRadius(): string | undefined;
    isPanelMaximized(): boolean;
    getSideBarPosition(): Position;
    toggleMenuBar(): void;
    getPanelPosition(): Position;
    setPanelPosition(position: Position): void;
    getPanelAlignment(): PanelAlignment;
    setPanelAlignment(alignment: PanelAlignment): void;
    getMaximumEditorDimensions(container: HTMLElement): IDimension;
    toggleZenMode(): void;
    isMainEditorLayoutCentered(): boolean;
    centerMainEditorLayout(active: boolean): void;
    resizePart(part: Parts, sizeChangeWidth: number, sizeChangeHeight: number): void;
    registerPart(part: Part): IDisposable;
    isWindowMaximized(targetWindow: Window): boolean;
    updateWindowMaximizedState(targetWindow: Window, maximized: boolean): void;
    getVisibleNeighborPart(part: Parts, direction: Direction): Parts | undefined;
}
export declare function shouldShowCustomTitleBar(configurationService: IConfigurationService, window: Window, menuBarToggled?: boolean, zenModeActive?: boolean): boolean;
