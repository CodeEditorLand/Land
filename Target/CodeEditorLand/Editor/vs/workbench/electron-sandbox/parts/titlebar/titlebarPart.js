/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuxiliaryNativeTitlebarPart_1;
import { Event } from '../../../../base/common/event.js';
import { getZoomFactor, isWCOEnabled } from '../../../../base/browser/browser.js';
import { $, addDisposableListener, append, EventType, getWindow, getWindowId, hide, show } from '../../../../base/browser/dom.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { isMacintosh, isWindows, isLinux, isNative, isBigSurOrNewer } from '../../../../base/common/platform.js';
import { IMenuService, MenuId } from '../../../../platform/actions/common/actions.js';
import { BrowserTitlebarPart as BrowserTitlebarPart, BrowserTitleService } from '../../../browser/parts/titlebar/titlebarPart.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { hasNativeTitlebar, useWindowControlsOverlay, DEFAULT_CUSTOM_TITLEBAR_HEIGHT } from '../../../../platform/window/common/window.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { NativeMenubarControl } from './menubarControl.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { mainWindow } from '../../../../base/browser/window.js';
let NativeTitlebarPart = class NativeTitlebarPart extends BrowserTitlebarPart {
    //#region IView
    get minimumHeight() {
        if (!isMacintosh) {
            return super.minimumHeight;
        }
        return (this.isCommandCenterVisible ? DEFAULT_CUSTOM_TITLEBAR_HEIGHT : this.macTitlebarSize) / (this.preventZoom ? getZoomFactor(getWindow(this.element)) : 1);
    }
    get maximumHeight() { return this.minimumHeight; }
    get macTitlebarSize() {
        if (this.bigSurOrNewer) {
            return 28; // macOS Big Sur increases title bar height
        }
        return 22;
    }
    constructor(id, targetWindow, editorGroupsContainer, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, nativeHostService, editorGroupService, editorService, menuService, keybindingService) {
        super(id, targetWindow, editorGroupsContainer, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorGroupService, editorService, menuService, keybindingService);
        this.nativeHostService = nativeHostService;
        this.bigSurOrNewer = isBigSurOrNewer(environmentService.os.release);
    }
    onMenubarVisibilityChanged(visible) {
        // Hide title when toggling menu bar
        if ((isWindows || isLinux) && this.currentMenubarVisibility === 'toggle' && visible) {
            // Hack to fix issue #52522 with layered webkit-app-region elements appearing under cursor
            if (this.dragRegion) {
                hide(this.dragRegion);
                setTimeout(() => show(this.dragRegion), 50);
            }
        }
        super.onMenubarVisibilityChanged(visible);
    }
    onConfigurationChanged(event) {
        super.onConfigurationChanged(event);
        if (event.affectsConfiguration('window.doubleClickIconToClose')) {
            if (this.appIcon) {
                this.onUpdateAppIconDragBehavior();
            }
        }
    }
    onUpdateAppIconDragBehavior() {
        const setting = this.configurationService.getValue('window.doubleClickIconToClose');
        if (setting && this.appIcon) {
            this.appIcon.style['-webkit-app-region'] = 'no-drag';
        }
        else if (this.appIcon) {
            this.appIcon.style['-webkit-app-region'] = 'drag';
        }
    }
    installMenubar() {
        super.installMenubar();
        if (this.menubar) {
            return;
        }
        if (this.customMenubar) {
            this._register(this.customMenubar.onFocusStateChange(e => this.onMenubarFocusChanged(e)));
        }
    }
    onMenubarFocusChanged(focused) {
        if ((isWindows || isLinux) && this.currentMenubarVisibility !== 'compact' && this.dragRegion) {
            if (focused) {
                hide(this.dragRegion);
            }
            else {
                show(this.dragRegion);
            }
        }
    }
    createContentArea(parent) {
        const result = super.createContentArea(parent);
        const targetWindow = getWindow(parent);
        const targetWindowId = getWindowId(targetWindow);
        // Native menu controller
        if (isMacintosh || hasNativeTitlebar(this.configurationService)) {
            this._register(this.instantiationService.createInstance(NativeMenubarControl));
        }
        // App Icon (Native Windows/Linux)
        if (this.appIcon) {
            this.onUpdateAppIconDragBehavior();
            this._register(addDisposableListener(this.appIcon, EventType.DBLCLICK, (() => {
                this.nativeHostService.closeWindow({ targetWindowId });
            })));
        }
        // Window Controls (Native Linux when WCO is disabled)
        if (isLinux && !hasNativeTitlebar(this.configurationService) && !isWCOEnabled() && this.windowControlsContainer) {
            // Minimize
            const minimizeIcon = append(this.windowControlsContainer, $('div.window-icon.window-minimize' + ThemeIcon.asCSSSelector(Codicon.chromeMinimize)));
            this._register(addDisposableListener(minimizeIcon, EventType.CLICK, () => {
                this.nativeHostService.minimizeWindow({ targetWindowId });
            }));
            // Restore
            this.maxRestoreControl = append(this.windowControlsContainer, $('div.window-icon.window-max-restore'));
            this._register(addDisposableListener(this.maxRestoreControl, EventType.CLICK, async () => {
                const maximized = await this.nativeHostService.isMaximized({ targetWindowId });
                if (maximized) {
                    return this.nativeHostService.unmaximizeWindow({ targetWindowId });
                }
                return this.nativeHostService.maximizeWindow({ targetWindowId });
            }));
            // Close
            const closeIcon = append(this.windowControlsContainer, $('div.window-icon.window-close' + ThemeIcon.asCSSSelector(Codicon.chromeClose)));
            this._register(addDisposableListener(closeIcon, EventType.CLICK, () => {
                this.nativeHostService.closeWindow({ targetWindowId });
            }));
            // Resizer
            this.resizer = append(this.rootContainer, $('div.resizer'));
            this._register(Event.runAndSubscribe(this.layoutService.onDidChangeWindowMaximized, ({ windowId, maximized }) => {
                if (windowId === targetWindowId) {
                    this.onDidChangeWindowMaximized(maximized);
                }
            }, { windowId: targetWindowId, maximized: this.layoutService.isWindowMaximized(targetWindow) }));
        }
        // Window System Context Menu
        // See https://github.com/electron/electron/issues/24893
        if (isWindows && !hasNativeTitlebar(this.configurationService)) {
            this._register(this.nativeHostService.onDidTriggerWindowSystemContextMenu(({ windowId, x, y }) => {
                if (targetWindowId !== windowId) {
                    return;
                }
                const zoomFactor = getZoomFactor(getWindow(this.element));
                this.onContextMenu(new MouseEvent('mouseup', { clientX: x / zoomFactor, clientY: y / zoomFactor }), MenuId.TitleBarContext);
            }));
        }
        return result;
    }
    onDidChangeWindowMaximized(maximized) {
        if (this.maxRestoreControl) {
            if (maximized) {
                this.maxRestoreControl.classList.remove(...ThemeIcon.asClassNameArray(Codicon.chromeMaximize));
                this.maxRestoreControl.classList.add(...ThemeIcon.asClassNameArray(Codicon.chromeRestore));
            }
            else {
                this.maxRestoreControl.classList.remove(...ThemeIcon.asClassNameArray(Codicon.chromeRestore));
                this.maxRestoreControl.classList.add(...ThemeIcon.asClassNameArray(Codicon.chromeMaximize));
            }
        }
        if (this.resizer) {
            if (maximized) {
                hide(this.resizer);
            }
            else {
                show(this.resizer);
            }
        }
    }
    updateStyles() {
        super.updateStyles();
        // WCO styles only supported on Windows currently
        if (useWindowControlsOverlay(this.configurationService)) {
            if (!this.cachedWindowControlStyles ||
                this.cachedWindowControlStyles.bgColor !== this.element.style.backgroundColor ||
                this.cachedWindowControlStyles.fgColor !== this.element.style.color) {
                this.nativeHostService.updateWindowControls({
                    targetWindowId: getWindowId(getWindow(this.element)),
                    backgroundColor: this.element.style.backgroundColor,
                    foregroundColor: this.element.style.color
                });
            }
        }
    }
    layout(width, height) {
        super.layout(width, height);
        if (useWindowControlsOverlay(this.configurationService) ||
            (isMacintosh && isNative && !hasNativeTitlebar(this.configurationService))) {
            // When the user goes into full screen mode, the height of the title bar becomes 0.
            // Instead, set it back to the default titlebar height for Catalina users
            // so that they can have the traffic lights rendered at the proper offset.
            // Ref https://github.com/microsoft/vscode/issues/159862
            const newHeight = (height > 0 || this.bigSurOrNewer) ? Math.round(height * getZoomFactor(getWindow(this.element))) : this.macTitlebarSize;
            if (newHeight !== this.cachedWindowControlHeight) {
                this.cachedWindowControlHeight = newHeight;
                this.nativeHostService.updateWindowControls({
                    targetWindowId: getWindowId(getWindow(this.element)),
                    height: newHeight
                });
            }
        }
    }
};
NativeTitlebarPart = __decorate([
    __param(3, IContextMenuService),
    __param(4, IConfigurationService),
    __param(5, INativeWorkbenchEnvironmentService),
    __param(6, IInstantiationService),
    __param(7, IThemeService),
    __param(8, IStorageService),
    __param(9, IWorkbenchLayoutService),
    __param(10, IContextKeyService),
    __param(11, IHostService),
    __param(12, INativeHostService),
    __param(13, IEditorGroupsService),
    __param(14, IEditorService),
    __param(15, IMenuService),
    __param(16, IKeybindingService),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], NativeTitlebarPart);
export { NativeTitlebarPart };
let MainNativeTitlebarPart = class MainNativeTitlebarPart extends NativeTitlebarPart {
    constructor(contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, nativeHostService, editorGroupService, editorService, menuService, keybindingService) {
        super("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, mainWindow, 'main', contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, nativeHostService, editorGroupService, editorService, menuService, keybindingService);
    }
};
MainNativeTitlebarPart = __decorate([
    __param(0, IContextMenuService),
    __param(1, IConfigurationService),
    __param(2, INativeWorkbenchEnvironmentService),
    __param(3, IInstantiationService),
    __param(4, IThemeService),
    __param(5, IStorageService),
    __param(6, IWorkbenchLayoutService),
    __param(7, IContextKeyService),
    __param(8, IHostService),
    __param(9, INativeHostService),
    __param(10, IEditorGroupsService),
    __param(11, IEditorService),
    __param(12, IMenuService),
    __param(13, IKeybindingService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], MainNativeTitlebarPart);
export { MainNativeTitlebarPart };
let AuxiliaryNativeTitlebarPart = class AuxiliaryNativeTitlebarPart extends NativeTitlebarPart {
    static { AuxiliaryNativeTitlebarPart_1 = this; }
    static { this.COUNTER = 1; }
    get height() { return this.minimumHeight; }
    constructor(container, editorGroupsContainer, mainTitlebar, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, nativeHostService, editorGroupService, editorService, menuService, keybindingService) {
        const id = AuxiliaryNativeTitlebarPart_1.COUNTER++;
        super(`workbench.parts.auxiliaryTitle.${id}`, getWindow(container), editorGroupsContainer, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, nativeHostService, editorGroupService, editorService, menuService, keybindingService);
        this.container = container;
        this.mainTitlebar = mainTitlebar;
    }
    get preventZoom() {
        // Prevent zooming behavior if any of the following conditions are met:
        // 1. Shrinking below the window control size (zoom < 1)
        // 2. No custom items are present in the main title bar
        // The auxiliary title bar never contains any zoomable items itself,
        // but we want to match the behavior of the main title bar.
        return getZoomFactor(getWindow(this.element)) < 1 || !this.mainTitlebar.hasZoomableElements;
    }
};
AuxiliaryNativeTitlebarPart = AuxiliaryNativeTitlebarPart_1 = __decorate([
    __param(3, IContextMenuService),
    __param(4, IConfigurationService),
    __param(5, INativeWorkbenchEnvironmentService),
    __param(6, IInstantiationService),
    __param(7, IThemeService),
    __param(8, IStorageService),
    __param(9, IWorkbenchLayoutService),
    __param(10, IContextKeyService),
    __param(11, IHostService),
    __param(12, INativeHostService),
    __param(13, IEditorGroupsService),
    __param(14, IEditorService),
    __param(15, IMenuService),
    __param(16, IKeybindingService),
    __metadata("design:paramtypes", [HTMLElement, Object, BrowserTitlebarPart, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AuxiliaryNativeTitlebarPart);
export { AuxiliaryNativeTitlebarPart };
export class NativeTitleService extends BrowserTitleService {
    createMainTitlebarPart() {
        return this.instantiationService.createInstance(MainNativeTitlebarPart);
    }
    doCreateAuxiliaryTitlebarPart(container, editorGroupsContainer) {
        return this.instantiationService.createInstance(AuxiliaryNativeTitlebarPart, container, editorGroupsContainer, this.mainPart);
    }
}
