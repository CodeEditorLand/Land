import { refineServiceDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
import { isMacintosh, isNative, isWeb } from '../../../../base/common/platform.js';
import { isAuxiliaryWindow } from '../../../../base/browser/window.js';
import { getMenuBarVisibility, hasCustomTitlebar, hasNativeTitlebar } from '../../../../platform/window/common/window.js';
import { isFullscreen, isWCOEnabled } from '../../../../base/browser/browser.js';
export const IWorkbenchLayoutService = refineServiceDecorator(ILayoutService);
export function isHorizontal(position) {
    return position === 2 || position === 3;
}
export function positionToString(position) {
    switch (position) {
        case 0: return 'left';
        case 1: return 'right';
        case 2: return 'bottom';
        case 3: return 'top';
        default: return 'bottom';
    }
}
const positionsByString = {
    [positionToString(0)]: 0,
    [positionToString(1)]: 1,
    [positionToString(2)]: 2,
    [positionToString(3)]: 3
};
export function positionFromString(str) {
    return positionsByString[str];
}
function panelOpensMaximizedSettingToString(setting) {
    switch (setting) {
        case 0: return 'always';
        case 1: return 'never';
        case 2: return 'preserve';
        default: return 'preserve';
    }
}
const panelOpensMaximizedByString = {
    [panelOpensMaximizedSettingToString(0)]: 0,
    [panelOpensMaximizedSettingToString(1)]: 1,
    [panelOpensMaximizedSettingToString(2)]: 2
};
export function panelOpensMaximizedFromString(str) {
    return panelOpensMaximizedByString[str];
}
export function shouldShowCustomTitleBar(configurationService, window, menuBarToggled, zenModeActive) {
    if (!hasCustomTitlebar(configurationService)) {
        return false;
    }
    if (zenModeActive) {
        return !configurationService.getValue("zenMode.fullScreen");
    }
    const inFullscreen = isFullscreen(window);
    const nativeTitleBarEnabled = hasNativeTitlebar(configurationService);
    if (!isWeb) {
        const showCustomTitleBar = configurationService.getValue("window.customTitleBarVisibility");
        if (showCustomTitleBar === "never" && nativeTitleBarEnabled || showCustomTitleBar === "windowed" && inFullscreen) {
            return false;
        }
    }
    if (!isTitleBarEmpty(configurationService)) {
        return true;
    }
    if (nativeTitleBarEnabled) {
        return false;
    }
    if (isMacintosh && isNative) {
        return !inFullscreen;
    }
    if (isNative && !inFullscreen) {
        return true;
    }
    if (isWCOEnabled() && !inFullscreen) {
        return true;
    }
    const menuBarVisibility = !isAuxiliaryWindow(window) ? getMenuBarVisibility(configurationService) : 'hidden';
    switch (menuBarVisibility) {
        case 'classic':
            return !inFullscreen || !!menuBarToggled;
        case 'compact':
        case 'hidden':
            return false;
        case 'toggle':
            return !!menuBarToggled;
        case 'visible':
            return true;
        default:
            return isWeb ? false : !inFullscreen || !!menuBarToggled;
    }
}
function isTitleBarEmpty(configurationService) {
    if (configurationService.getValue("window.commandCenter")) {
        return false;
    }
    const activityBarPosition = configurationService.getValue("workbench.activityBar.location");
    if (activityBarPosition === "top" || activityBarPosition === "bottom") {
        return false;
    }
    const editorActionsLocation = configurationService.getValue("workbench.editor.editorActionsLocation");
    const editorTabsMode = configurationService.getValue("workbench.editor.showTabs");
    if (editorActionsLocation === "titleBar" || editorActionsLocation === "default" && editorTabsMode === "none") {
        return false;
    }
    if (configurationService.getValue("workbench.layoutControl.enabled")) {
        return false;
    }
    return true;
}
