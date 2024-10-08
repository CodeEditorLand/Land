export type CodeWindow = Window & typeof globalThis & {
    readonly vscodeWindowId: number;
};
export declare function ensureCodeWindow(targetWindow: Window, fallbackWindowId: number): asserts targetWindow is CodeWindow;
export declare const mainWindow: CodeWindow;
export declare function isAuxiliaryWindow(obj: Window): obj is CodeWindow;
