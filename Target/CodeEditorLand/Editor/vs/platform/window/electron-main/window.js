/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import electron from 'electron';
export const defaultWindowState = function (mode = 1 /* WindowMode.Normal */) {
    return {
        width: 1024,
        height: 768,
        mode
    };
};
export const defaultAuxWindowState = function () {
    // Auxiliary windows are being created from a `window.open` call
    // that sets `windowFeatures` that encode the desired size and
    // position of the new window (`top`, `left`).
    // In order to truly override this to a good default window state
    // we need to set not only width and height but also x and y to
    // a good location on the primary display.
    const width = 800;
    const height = 600;
    const workArea = electron.screen.getPrimaryDisplay().workArea;
    const x = Math.max(workArea.x + (workArea.width / 2) - (width / 2), 0);
    const y = Math.max(workArea.y + (workArea.height / 2) - (height / 2), 0);
    return {
        x,
        y,
        width,
        height,
        mode: 1 /* WindowMode.Normal */
    };
};
