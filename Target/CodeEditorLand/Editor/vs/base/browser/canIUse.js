import * as browser from './browser.js';
import { mainWindow } from './window.js';
import * as platform from '../common/platform.js';
export const BrowserFeatures = {
    clipboard: {
        writeText: (platform.isNative
            || (document.queryCommandSupported && document.queryCommandSupported('copy'))
            || !!(navigator && navigator.clipboard && navigator.clipboard.writeText)),
        readText: (platform.isNative
            || !!(navigator && navigator.clipboard && navigator.clipboard.readText))
    },
    keyboard: (() => {
        if (platform.isNative || browser.isStandalone()) {
            return 0;
        }
        if (navigator.keyboard || browser.isSafari) {
            return 1;
        }
        return 2;
    })(),
    touch: 'ontouchstart' in mainWindow || navigator.maxTouchPoints > 0,
    pointerEvents: mainWindow.PointerEvent && ('ontouchstart' in mainWindow || navigator.maxTouchPoints > 0)
};
