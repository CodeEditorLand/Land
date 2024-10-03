export function ensureCodeWindow(targetWindow, fallbackWindowId) {
    const codeWindow = targetWindow;
    if (typeof codeWindow.vscodeWindowId !== 'number') {
        Object.defineProperty(codeWindow, 'vscodeWindowId', {
            get: () => fallbackWindowId
        });
    }
}
export const mainWindow = window;
export function isAuxiliaryWindow(obj) {
    if (obj === mainWindow) {
        return false;
    }
    const candidate = obj;
    return typeof candidate?.vscodeWindowId === 'number';
}
