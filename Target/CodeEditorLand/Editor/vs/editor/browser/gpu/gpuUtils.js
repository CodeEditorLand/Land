import { BugIndicatingError } from '../../../base/common/errors.js';
import { toDisposable } from '../../../base/common/lifecycle.js';
export const quadVertices = new Float32Array([
    1, 0,
    1, 1,
    0, 1,
    0, 0,
    0, 1,
    1, 0,
]);
export function ensureNonNullable(value) {
    if (!value) {
        throw new Error(`Value "${value}" cannot be null`);
    }
    return value;
}
export function observeDevicePixelDimensions(element, parentWindow, callback) {
    let observer = new parentWindow.ResizeObserver((entries) => {
        const entry = entries.find((entry) => entry.target === element);
        if (!entry) {
            return;
        }
        if (!('devicePixelContentBoxSize' in entry)) {
            observer?.disconnect();
            observer = undefined;
            return;
        }
        const width = entry.devicePixelContentBoxSize[0].inlineSize;
        const height = entry.devicePixelContentBoxSize[0].blockSize;
        if (width > 0 && height > 0) {
            callback(width, height);
        }
    });
    try {
        observer.observe(element, { box: ['device-pixel-content-box'] });
    }
    catch {
        observer.disconnect();
        observer = undefined;
        throw new BugIndicatingError('Could not observe device pixel dimensions');
    }
    return toDisposable(() => observer?.disconnect());
}
