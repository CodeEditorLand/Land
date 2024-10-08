/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { getZoomLevel, setZoomFactor, setZoomLevel } from '../../../base/browser/browser.js';
import { getActiveWindow, getWindows } from '../../../base/browser/dom.js';
import { mainWindow } from '../../../base/browser/window.js';
import { ipcRenderer, webFrame } from '../../../base/parts/sandbox/electron-sandbox/globals.js';
import { zoomLevelToZoomFactor } from '../common/window.js';
export var ApplyZoomTarget;
(function (ApplyZoomTarget) {
    ApplyZoomTarget[ApplyZoomTarget["ACTIVE_WINDOW"] = 1] = "ACTIVE_WINDOW";
    ApplyZoomTarget[ApplyZoomTarget["ALL_WINDOWS"] = 2] = "ALL_WINDOWS";
})(ApplyZoomTarget || (ApplyZoomTarget = {}));
export const MAX_ZOOM_LEVEL = 8;
export const MIN_ZOOM_LEVEL = -8;
/**
 * Apply a zoom level to the window. Also sets it in our in-memory
 * browser helper so that it can be accessed in non-electron layers.
 */
export function applyZoom(zoomLevel, target) {
    zoomLevel = Math.min(Math.max(zoomLevel, MIN_ZOOM_LEVEL), MAX_ZOOM_LEVEL); // cap zoom levels between -8 and 8
    const targetWindows = [];
    if (target === ApplyZoomTarget.ACTIVE_WINDOW) {
        targetWindows.push(getActiveWindow());
    }
    else if (target === ApplyZoomTarget.ALL_WINDOWS) {
        targetWindows.push(...Array.from(getWindows()).map(({ window }) => window));
    }
    else {
        targetWindows.push(target);
    }
    for (const targetWindow of targetWindows) {
        getGlobals(targetWindow)?.webFrame?.setZoomLevel(zoomLevel);
        setZoomFactor(zoomLevelToZoomFactor(zoomLevel), targetWindow);
        setZoomLevel(zoomLevel, targetWindow);
    }
}
function getGlobals(win) {
    if (win === mainWindow) {
        // main window
        return { ipcRenderer, webFrame };
    }
    else {
        // auxiliary window
        const auxiliaryWindow = win;
        if (auxiliaryWindow?.vscode?.ipcRenderer && auxiliaryWindow?.vscode?.webFrame) {
            return auxiliaryWindow.vscode;
        }
    }
    return undefined;
}
export function zoomIn(target) {
    applyZoom(getZoomLevel(typeof target === 'number' ? getActiveWindow() : target) + 1, target);
}
export function zoomOut(target) {
    applyZoom(getZoomLevel(typeof target === 'number' ? getActiveWindow() : target) - 1, target);
}
//#endregion
