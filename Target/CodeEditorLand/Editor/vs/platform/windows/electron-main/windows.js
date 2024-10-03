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
        show: windowState.mode !== 0 && windowState.mode !== 3,
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
            enableBlinkFeatures: 'HighlightAPI',
            sandbox: true
        },
        experimentalDarkMode: true
    };
    if (isLinux) {
        options.icon = join(environmentMainService.appRoot, 'resources/linux/code.png');
    }
    else if (isWindows && !environmentMainService.isBuilt) {
        options.icon = join(environmentMainService.appRoot, 'resources/win32/code_150x150.png');
    }
    if (isMacintosh) {
        options.acceptFirstMouse = true;
        if (windowSettings?.clickThroughInactive === false) {
            options.acceptFirstMouse = false;
        }
    }
    if (overrides?.disableFullscreen) {
        options.fullscreen = false;
    }
    else if (isMacintosh && !useNativeFullScreen(configurationService)) {
        options.fullscreenable = false;
    }
    const useNativeTabs = isMacintosh && windowSettings?.nativeTabs === true;
    if (useNativeTabs) {
        options.tabbingIdentifier = productService.nameShort;
    }
    const hideNativeTitleBar = !hasNativeTitlebar(configurationService, overrides?.forceNativeTitlebar ? "native" : undefined);
    if (hideNativeTitleBar) {
        options.titleBarStyle = 'hidden';
        if (!isMacintosh) {
            options.frame = false;
        }
        if (useWindowControlsOverlay(configurationService)) {
            const titleBarColor = themeMainService.getWindowSplash()?.colorInfo.titleBarBackground ?? themeMainService.getBackgroundColor();
            const symbolColor = Color.fromHex(titleBarColor).isDarker() ? '#FFFFFF' : '#000000';
            options.titleBarOverlay = {
                height: 29,
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
        if (displays.length === 1) {
            const displayWorkingArea = getWorkingArea(displays[0]);
            logService.trace('window#validateWindowState: single monitor working area', displayWorkingArea);
            if (displayWorkingArea) {
                function ensureStateInDisplayWorkingArea() {
                    if (!state || typeof state.x !== 'number' || typeof state.y !== 'number' || !displayWorkingArea) {
                        return;
                    }
                    if (state.x < displayWorkingArea.x) {
                        state.x = displayWorkingArea.x;
                    }
                    if (state.y < displayWorkingArea.y) {
                        state.y = displayWorkingArea.y;
                    }
                }
                ensureStateInDisplayWorkingArea();
                if (state.width > displayWorkingArea.width) {
                    state.width = displayWorkingArea.width;
                }
                if (state.height > displayWorkingArea.height) {
                    state.height = displayWorkingArea.height;
                }
                if (state.x > (displayWorkingArea.x + displayWorkingArea.width - 128)) {
                    state.x = displayWorkingArea.x + displayWorkingArea.width - state.width;
                }
                if (state.y > (displayWorkingArea.y + displayWorkingArea.height - 128)) {
                    state.y = displayWorkingArea.y + displayWorkingArea.height - state.height;
                }
                ensureStateInDisplayWorkingArea();
            }
            return state;
        }
        if (state.display && state.mode === 3) {
            const display = displays.find(d => d.id === state.display);
            if (display && typeof display.bounds?.x === 'number' && typeof display.bounds?.y === 'number') {
                logService.trace('window#validateWindowState: restoring fullscreen to previous display');
                const defaults = defaultWindowState(3);
                defaults.x = display.bounds.x;
                defaults.y = display.bounds.y;
                return defaults;
            }
        }
        let display;
        let displayWorkingArea;
        try {
            display = electron.screen.getDisplayMatching({ x: state.x, y: state.y, width: state.width, height: state.height });
            displayWorkingArea = getWorkingArea(display);
            logService.trace('window#validateWindowState: multi-monitor working area', displayWorkingArea);
        }
        catch (error) {
            logService.error('window#validateWindowState: error finding display for window state', error);
        }
        if (display &&
            displayWorkingArea &&
            state.x + state.width > displayWorkingArea.x &&
            state.y + state.height > displayWorkingArea.y &&
            state.x < displayWorkingArea.x + displayWorkingArea.width &&
            state.y < displayWorkingArea.y + displayWorkingArea.height) {
            return state;
        }
        logService.trace('window#validateWindowState: state is outside of the multi-monitor working area');
        return undefined;
    }
    WindowStateValidator.validateWindowState = validateWindowState;
    function getWorkingArea(display) {
        if (display.workArea.width > 0 && display.workArea.height > 0) {
            return display.workArea;
        }
        if (display.bounds.width > 0 && display.bounds.height > 0) {
            return display.bounds;
        }
        return undefined;
    }
})(WindowStateValidator || (WindowStateValidator = {}));
