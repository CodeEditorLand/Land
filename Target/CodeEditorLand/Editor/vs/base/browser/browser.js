/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { mainWindow } from './window.js';
import { Emitter } from '../common/event.js';
class WindowManager {
    constructor() {
        // --- Zoom Level
        this.mapWindowIdToZoomLevel = new Map();
        this._onDidChangeZoomLevel = new Emitter();
        this.onDidChangeZoomLevel = this._onDidChangeZoomLevel.event;
        // --- Zoom Factor
        this.mapWindowIdToZoomFactor = new Map();
        // --- Fullscreen
        this._onDidChangeFullscreen = new Emitter();
        this.onDidChangeFullscreen = this._onDidChangeFullscreen.event;
        this.mapWindowIdToFullScreen = new Map();
    }
    static { this.INSTANCE = new WindowManager(); }
    getZoomLevel(targetWindow) {
        return this.mapWindowIdToZoomLevel.get(this.getWindowId(targetWindow)) ?? 0;
    }
    setZoomLevel(zoomLevel, targetWindow) {
        if (this.getZoomLevel(targetWindow) === zoomLevel) {
            return;
        }
        const targetWindowId = this.getWindowId(targetWindow);
        this.mapWindowIdToZoomLevel.set(targetWindowId, zoomLevel);
        this._onDidChangeZoomLevel.fire(targetWindowId);
    }
    getZoomFactor(targetWindow) {
        return this.mapWindowIdToZoomFactor.get(this.getWindowId(targetWindow)) ?? 1;
    }
    setZoomFactor(zoomFactor, targetWindow) {
        this.mapWindowIdToZoomFactor.set(this.getWindowId(targetWindow), zoomFactor);
    }
    setFullscreen(fullscreen, targetWindow) {
        if (this.isFullscreen(targetWindow) === fullscreen) {
            return;
        }
        const windowId = this.getWindowId(targetWindow);
        this.mapWindowIdToFullScreen.set(windowId, fullscreen);
        this._onDidChangeFullscreen.fire(windowId);
    }
    isFullscreen(targetWindow) {
        return !!this.mapWindowIdToFullScreen.get(this.getWindowId(targetWindow));
    }
    getWindowId(targetWindow) {
        return targetWindow.vscodeWindowId;
    }
}
export function addMatchMediaChangeListener(targetWindow, query, callback) {
    if (typeof query === 'string') {
        query = targetWindow.matchMedia(query);
    }
    query.addEventListener('change', callback);
}
/** A zoom index, e.g. 1, 2, 3 */
export function setZoomLevel(zoomLevel, targetWindow) {
    WindowManager.INSTANCE.setZoomLevel(zoomLevel, targetWindow);
}
export function getZoomLevel(targetWindow) {
    return WindowManager.INSTANCE.getZoomLevel(targetWindow);
}
export const onDidChangeZoomLevel = WindowManager.INSTANCE.onDidChangeZoomLevel;
/** The zoom scale for an index, e.g. 1, 1.2, 1.4 */
export function getZoomFactor(targetWindow) {
    return WindowManager.INSTANCE.getZoomFactor(targetWindow);
}
export function setZoomFactor(zoomFactor, targetWindow) {
    WindowManager.INSTANCE.setZoomFactor(zoomFactor, targetWindow);
}
export function setFullscreen(fullscreen, targetWindow) {
    WindowManager.INSTANCE.setFullscreen(fullscreen, targetWindow);
}
export function isFullscreen(targetWindow) {
    return WindowManager.INSTANCE.isFullscreen(targetWindow);
}
export const onDidChangeFullscreen = WindowManager.INSTANCE.onDidChangeFullscreen;
const userAgent = navigator.userAgent;
export const isFirefox = (userAgent.indexOf('Firefox') >= 0);
export const isWebKit = (userAgent.indexOf('AppleWebKit') >= 0);
export const isChrome = (userAgent.indexOf('Chrome') >= 0);
export const isSafari = (!isChrome && (userAgent.indexOf('Safari') >= 0));
export const isWebkitWebView = (!isChrome && !isSafari && isWebKit);
export const isElectron = (userAgent.indexOf('Electron/') >= 0);
export const isAndroid = (userAgent.indexOf('Android') >= 0);
let standalone = false;
if (typeof mainWindow.matchMedia === 'function') {
    const standaloneMatchMedia = mainWindow.matchMedia('(display-mode: standalone) or (display-mode: window-controls-overlay)');
    const fullScreenMatchMedia = mainWindow.matchMedia('(display-mode: fullscreen)');
    standalone = standaloneMatchMedia.matches;
    addMatchMediaChangeListener(mainWindow, standaloneMatchMedia, ({ matches }) => {
        // entering fullscreen would change standaloneMatchMedia.matches to false
        // if standalone is true (running as PWA) and entering fullscreen, skip this change
        if (standalone && fullScreenMatchMedia.matches) {
            return;
        }
        // otherwise update standalone (browser to PWA or PWA to browser)
        standalone = matches;
    });
}
export function isStandalone() {
    return standalone;
}
// Visible means that the feature is enabled, not necessarily being rendered
// e.g. visible is true even in fullscreen mode where the controls are hidden
// See docs at https://developer.mozilla.org/en-US/docs/Web/API/WindowControlsOverlay/visible
export function isWCOEnabled() {
    return navigator?.windowControlsOverlay?.visible;
}
// Returns the bounding rect of the titlebar area if it is supported and defined
// See docs at https://developer.mozilla.org/en-US/docs/Web/API/WindowControlsOverlay/getTitlebarAreaRect
export function getWCOTitlebarAreaRect(targetWindow) {
    return targetWindow.navigator?.windowControlsOverlay?.getTitlebarAreaRect();
}
