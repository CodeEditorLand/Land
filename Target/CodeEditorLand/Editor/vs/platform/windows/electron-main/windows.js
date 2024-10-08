/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import electron from 'electron';
import { Color } from '../../../base/common/color.js';
import { join } from '../../../base/common/path.js';
import { isLinux, isMacintosh, isWindows } from '../../../base/common/platform.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { IProductService } from '../../product/common/productService.js';
import { IThemeMainService } from '../../theme/electron-main/themeMainService.js';
import { WindowMinimumSize, hasNativeTitlebar, useNativeFullScreen, useWindowControlsOverlay, zoomLevelToZoomFactor } from '../../window/common/window.js';
import { defaultWindowState } from '../../window/electron-main/window.js';
export const IWindowsMainService = createDecorator('windowsMainService');
export function defaultBrowserWindowOptions(accessor, windowState, overrides, webPreferences) {
    const themeMainService = accessor.get(IThemeMainService);
    const productService = accessor.get(IProductService);
    const configurationService = accessor.get(IConfigurationService);
    const environmentMainService = accessor.get(IEnvironmentMainService);
    const windowSettings = configurationService.getValue('window');
    const options = {
        backgroundColor: themeMainService.getBackgroundColor(),
        minWidth: WindowMinimumSize.WIDTH,
        minHeight: WindowMinimumSize.HEIGHT,
        title: productService.nameLong,
        show: windowState.mode !== 0 /* WindowMode.Maximized */ && windowState.mode !== 3 /* WindowMode.Fullscreen */, // reduce flicker by showing later
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
        webPreferences: {
            ...webPreferences,
            enableWebSQL: false,
            spellcheck: false,
            zoomFactor: zoomLevelToZoomFactor(windowState.zoomLevel ?? windowSettings?.zoomLevel),
            autoplayPolicy: 'user-gesture-required',
            // Enable experimental css highlight api https://chromestatus.com/feature/5436441440026624
            // Refs https://github.com/microsoft/vscode/issues/140098
            enableBlinkFeatures: 'HighlightAPI',
            sandbox: true
        },
        experimentalDarkMode: true
    };
    if (isLinux) {
        options.icon = join(environmentMainService.appRoot, 'resources/linux/code.png'); // always on Linux
    }
    else if (isWindows && !environmentMainService.isBuilt) {
        options.icon = join(environmentMainService.appRoot, 'resources/win32/code_150x150.png'); // only when running out of sources on Windows
    }
    if (isMacintosh) {
        options.acceptFirstMouse = true; // enabled by default
        if (windowSettings?.clickThroughInactive === false) {
            options.acceptFirstMouse = false;
        }
    }
    if (overrides?.disableFullscreen) {
        options.fullscreen = false;
    }
    else if (isMacintosh && !useNativeFullScreen(configurationService)) {
        options.fullscreenable = false; // enables simple fullscreen mode
    }
    const useNativeTabs = isMacintosh && windowSettings?.nativeTabs === true;
    if (useNativeTabs) {
        options.tabbingIdentifier = productService.nameShort; // this opts in to sierra tabs
    }
    const hideNativeTitleBar = !hasNativeTitlebar(configurationService, overrides?.forceNativeTitlebar ? "native" /* TitlebarStyle.NATIVE */ : undefined);
    if (hideNativeTitleBar) {
        options.titleBarStyle = 'hidden';
        if (!isMacintosh) {
            options.frame = false;
        }
        if (useWindowControlsOverlay(configurationService)) {
            // This logic will not perfectly guess the right colors
            // to use on initialization, but prefer to keep things
            // simple as it is temporary and not noticeable
            const titleBarColor = themeMainService.getWindowSplash()?.colorInfo.titleBarBackground ?? themeMainService.getBackgroundColor();
            const symbolColor = Color.fromHex(titleBarColor).isDarker() ? '#FFFFFF' : '#000000';
            options.titleBarOverlay = {
                height: 29, // the smallest size of the title bar on windows accounting for the border on windows 11
                color: titleBarColor,
                symbolColor
            };
        }
    }
    return options;
}
export function getLastFocused(windows) {
    let lastFocusedWindow = undefined;
    let maxLastFocusTime = Number.MIN_VALUE;
    for (const window of windows) {
        if (window.lastFocusTime > maxLastFocusTime) {
            maxLastFocusTime = window.lastFocusTime;
            lastFocusedWindow = window;
        }
    }
    return lastFocusedWindow;
}
export var WindowStateValidator;
(function (WindowStateValidator) {
    function validateWindowState(logService, state, displays = electron.screen.getAllDisplays()) {
        logService.trace(`window#validateWindowState: validating window state on ${displays.length} display(s)`, state);
        if (typeof state.x !== 'number' ||
            typeof state.y !== 'number' ||
            typeof state.width !== 'number' ||
            typeof state.height !== 'number') {
            logService.trace('window#validateWindowState: unexpected type of state values');
            return undefined;
        }
        if (state.width <= 0 || state.height <= 0) {
            logService.trace('window#validateWindowState: unexpected negative values');
            return undefined;
        }
        // Single Monitor: be strict about x/y positioning
        // macOS & Linux: these OS seem to be pretty good in ensuring that a window is never outside of it's bounds.
        // Windows: it is possible to have a window with a size that makes it fall out of the window. our strategy
        //          is to try as much as possible to keep the window in the monitor bounds. we are not as strict as
        //          macOS and Linux and allow the window to exceed the monitor bounds as long as the window is still
        //          some pixels (128) visible on the screen for the user to drag it back.
        if (displays.length === 1) {
            const displayWorkingArea = getWorkingArea(displays[0]);
            logService.trace('window#validateWindowState: single monitor working area', displayWorkingArea);
            if (displayWorkingArea) {
                function ensureStateInDisplayWorkingArea() {
                    if (!state || typeof state.x !== 'number' || typeof state.y !== 'number' || !displayWorkingArea) {
                        return;
                    }
                    if (state.x < displayWorkingArea.x) {
                        // prevent window from falling out of the screen to the left
                        state.x = displayWorkingArea.x;
                    }
                    if (state.y < displayWorkingArea.y) {
                        // prevent window from falling out of the screen to the top
                        state.y = displayWorkingArea.y;
                    }
                }
                // ensure state is not outside display working area (top, left)
                ensureStateInDisplayWorkingArea();
                if (state.width > displayWorkingArea.width) {
                    // prevent window from exceeding display bounds width
                    state.width = displayWorkingArea.width;
                }
                if (state.height > displayWorkingArea.height) {
                    // prevent window from exceeding display bounds height
                    state.height = displayWorkingArea.height;
                }
                if (state.x > (displayWorkingArea.x + displayWorkingArea.width - 128)) {
                    // prevent window from falling out of the screen to the right with
                    // 128px margin by positioning the window to the far right edge of
                    // the screen
                    state.x = displayWorkingArea.x + displayWorkingArea.width - state.width;
                }
                if (state.y > (displayWorkingArea.y + displayWorkingArea.height - 128)) {
                    // prevent window from falling out of the screen to the bottom with
                    // 128px margin by positioning the window to the far bottom edge of
                    // the screen
                    state.y = displayWorkingArea.y + displayWorkingArea.height - state.height;
                }
                // again ensure state is not outside display working area
                // (it may have changed from the previous validation step)
                ensureStateInDisplayWorkingArea();
            }
            return state;
        }
        // Multi Montior (fullscreen): try to find the previously used display
        if (state.display && state.mode === 3 /* WindowMode.Fullscreen */) {
            const display = displays.find(d => d.id === state.display);
            if (display && typeof display.bounds?.x === 'number' && typeof display.bounds?.y === 'number') {
                logService.trace('window#validateWindowState: restoring fullscreen to previous display');
                const defaults = defaultWindowState(3 /* WindowMode.Fullscreen */); // make sure we have good values when the user restores the window
                defaults.x = display.bounds.x; // carefull to use displays x/y position so that the window ends up on the correct monitor
                defaults.y = display.bounds.y;
                return defaults;
            }
        }
        // Multi Monitor (non-fullscreen): ensure window is within display bounds
        let display;
        let displayWorkingArea;
        try {
            display = electron.screen.getDisplayMatching({ x: state.x, y: state.y, width: state.width, height: state.height });
            displayWorkingArea = getWorkingArea(display);
            logService.trace('window#validateWindowState: multi-monitor working area', displayWorkingArea);
        }
        catch (error) {
            // Electron has weird conditions under which it throws errors
            // e.g. https://github.com/microsoft/vscode/issues/100334 when
            // large numbers are passed in
            logService.error('window#validateWindowState: error finding display for window state', error);
        }
        if (display && // we have a display matching the desired bounds
            displayWorkingArea && // we have valid working area bounds
            state.x + state.width > displayWorkingArea.x && // prevent window from falling out of the screen to the left
            state.y + state.height > displayWorkingArea.y && // prevent window from falling out of the screen to the top
            state.x < displayWorkingArea.x + displayWorkingArea.width && // prevent window from falling out of the screen to the right
            state.y < displayWorkingArea.y + displayWorkingArea.height // prevent window from falling out of the screen to the bottom
        ) {
            return state;
        }
        logService.trace('window#validateWindowState: state is outside of the multi-monitor working area');
        return undefined;
    }
    WindowStateValidator.validateWindowState = validateWindowState;
    function getWorkingArea(display) {
        // Prefer the working area of the display to account for taskbars on the
        // desktop being positioned somewhere (https://github.com/microsoft/vscode/issues/50830).
        //
        // Linux X11 sessions sometimes report wrong display bounds, so we validate
        // the reported sizes are positive.
        if (display.workArea.width > 0 && display.workArea.height > 0) {
            return display.workArea;
        }
        if (display.bounds.width > 0 && display.bounds.height > 0) {
            return display.bounds;
        }
        return undefined;
    }
})(WindowStateValidator || (WindowStateValidator = {}));
