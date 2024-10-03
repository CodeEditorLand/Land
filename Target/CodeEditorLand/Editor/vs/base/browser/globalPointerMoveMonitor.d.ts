import { IDisposable } from '../common/lifecycle.js';
export interface IPointerMoveCallback {
    (event: PointerEvent): void;
}
export interface IOnStopCallback {
    (browserEvent?: PointerEvent | KeyboardEvent): void;
}
export declare class GlobalPointerMoveMonitor implements IDisposable {
    private readonly _hooks;
    private _pointerMoveCallback;
    private _onStopCallback;
    dispose(): void;
    stopMonitoring(invokeStopCallback: boolean, browserEvent?: PointerEvent | KeyboardEvent): void;
    isMonitoring(): boolean;
    startMonitoring(initialElement: Element, pointerId: number, initialButtons: number, pointerMoveCallback: IPointerMoveCallback, onStopCallback: IOnStopCallback): void;
}
