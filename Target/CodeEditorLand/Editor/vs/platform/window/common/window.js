/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
    // Returns if it possible to have a custom title bar in the curren session
    // Does not imply that the title bar is visible
    return true;
}
export function hasNativeTitlebar(configurationService, titleBarStyle) {
    if (!titleBarStyle) {
        titleBarStyle = getTitleBarStyle(configurationService);
    }
    return titleBarStyle === "native" /* TitlebarStyle.NATIVE */;
}
export function getTitleBarStyle(configurationService) {
    if (isWeb) {
        return "custom" /* TitlebarStyle.CUSTOM */;
    }
    const configuration = configurationService.getValue('window');
    if (configuration) {
        const useNativeTabs = isMacintosh && configuration.nativeTabs === true;
        if (useNativeTabs) {
            return "native" /* TitlebarStyle.NATIVE */; // native tabs on sierra do not work with custom title style
        }
        const useSimpleFullScreen = isMacintosh && configuration.nativeFullScreen === false;
        if (useSimpleFullScreen) {
            return "native" /* TitlebarStyle.NATIVE */; // simple fullscreen does not work well with custom title style (https://github.com/microsoft/vscode/issues/63291)
        }
        const style = configuration.titleBarStyle;
        if (style === "native" /* TitlebarStyle.NATIVE */ || style === "custom" /* TitlebarStyle.CUSTOM */) {
            return style;
        }
    }
    return isLinux ? "native" /* TitlebarStyle.NATIVE */ : "custom" /* TitlebarStyle.CUSTOM */; // default to custom on all macOS and Windows
}
export const DEFAULT_CUSTOM_TITLEBAR_HEIGHT = 35; // includes space for command center
export function useWindowControlsOverlay(configurationService) {
    if (isMacintosh || isWeb) {
        return false; // only supported on a Windows/Linux desktop instances
    }
    if (hasNativeTitlebar(configurationService)) {
        return false; // only supported when title bar is custom
    }
    if (isLinux) {
        const setting = configurationService.getValue('window.experimentalControlOverlay');
        if (typeof setting === 'boolean') {
            return setting;
        }
    }
    // Default to true.
    return true;
}
export function useNativeFullScreen(configurationService) {
    const windowConfig = configurationService.getValue('window');
    if (!windowConfig || typeof windowConfig.nativeFullScreen !== 'boolean') {
        return true; // default
    }
    if (windowConfig.nativeTabs) {
        return true; // https://github.com/electron/electron/issues/16142
    }
    return windowConfig.nativeFullScreen !== false;
}
/**
 * According to Electron docs: `scale := 1.2 ^ level`.
 * https://github.com/electron/electron/blob/master/docs/api/web-contents.md#contentssetzoomlevellevel
 */
export function zoomLevelToZoomFactor(zoomLevel = 0) {
    return Math.pow(1.2, zoomLevel);
}
