import { isLinux, isMacintosh, isNative, isWeb } from '../../../base/common/platform.js';
export const WindowMinimumSize = {
    WIDTH: 400,
    WIDTH_WITH_VERTICAL_PANEL: 600,
    HEIGHT: 270
};
export function isOpenedAuxiliaryWindow(candidate) {
    return typeof candidate.parentId === 'number';
}
export function isWorkspaceToOpen(uriToOpen) {
    return !!uriToOpen.workspaceUri;
}
export function isFolderToOpen(uriToOpen) {
    return !!uriToOpen.folderUri;
}
export function isFileToOpen(uriToOpen) {
    return !!uriToOpen.fileUri;
}
export function getMenuBarVisibility(configurationService) {
    const nativeTitleBarEnabled = hasNativeTitlebar(configurationService);
    const menuBarVisibility = configurationService.getValue('window.menuBarVisibility');
    if (menuBarVisibility === 'default' || (nativeTitleBarEnabled && menuBarVisibility === 'compact') || (isMacintosh && isNative)) {
        return 'classic';
    }
    else {
        return menuBarVisibility;
    }
}
export function hasCustomTitlebar(configurationService, titleBarStyle) {
    return true;
}
export function hasNativeTitlebar(configurationService, titleBarStyle) {
    if (!titleBarStyle) {
        titleBarStyle = getTitleBarStyle(configurationService);
    }
    return titleBarStyle === "native";
}
export function getTitleBarStyle(configurationService) {
    if (isWeb) {
        return "custom";
    }
    const configuration = configurationService.getValue('window');
    if (configuration) {
        const useNativeTabs = isMacintosh && configuration.nativeTabs === true;
        if (useNativeTabs) {
            return "native";
        }
        const useSimpleFullScreen = isMacintosh && configuration.nativeFullScreen === false;
        if (useSimpleFullScreen) {
            return "native";
        }
        const style = configuration.titleBarStyle;
        if (style === "native" || style === "custom") {
            return style;
        }
    }
    return isLinux ? "native" : "custom";
}
export const DEFAULT_CUSTOM_TITLEBAR_HEIGHT = 35;
export function useWindowControlsOverlay(configurationService) {
    if (isMacintosh || isWeb) {
        return false;
    }
    if (hasNativeTitlebar(configurationService)) {
        return false;
    }
    if (isLinux) {
        const setting = configurationService.getValue('window.experimentalControlOverlay');
        if (typeof setting === 'boolean') {
            return setting;
        }
    }
    return true;
}
export function useNativeFullScreen(configurationService) {
    const windowConfig = configurationService.getValue('window');
    if (!windowConfig || typeof windowConfig.nativeFullScreen !== 'boolean') {
        return true;
    }
    if (windowConfig.nativeTabs) {
        return true;
    }
    return windowConfig.nativeFullScreen !== false;
}
export function zoomLevelToZoomFactor(zoomLevel = 0) {
    return Math.pow(1.2, zoomLevel);
}
