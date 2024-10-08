import { IDisposable, Disposable } from '../../../../../base/common/lifecycle.js';
export interface ITypeData {
    text: string;
    replacePrevCharCnt: number;
    replaceNextCharCnt: number;
    positionDelta: number;
}
export declare class FocusTracker extends Disposable {
    private readonly _domNode;
    private readonly _onFocusChange;
    private _isFocused;
    constructor(_domNode: HTMLElement, _onFocusChange: (newFocusValue: boolean) => void);
    private _handleFocusedChanged;
    focus(): void;
    get isFocused(): boolean;
}
export declare function editContextAddDisposableListener<K extends keyof EditContextEventHandlersEventMap>(target: EventTarget, type: K, listener: (this: GlobalEventHandlers, ev: EditContextEventHandlersEventMap[K]) => any, options?: boolean | AddEventListenerOptions): IDisposable;
