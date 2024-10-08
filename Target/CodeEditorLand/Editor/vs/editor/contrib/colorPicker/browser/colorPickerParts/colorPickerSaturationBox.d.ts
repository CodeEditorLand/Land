import '../colorPicker.css';
import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ColorPickerModel } from '../colorPickerModel.js';
export declare class SaturationBox extends Disposable {
    private readonly model;
    private pixelRatio;
    private readonly _domNode;
    private readonly selection;
    private readonly _canvas;
    private width;
    private height;
    private monitor;
    private readonly _onDidChange;
    readonly onDidChange: Event<{
        s: number;
        v: number;
    }>;
    private readonly _onColorFlushed;
    readonly onColorFlushed: Event<void>;
    constructor(container: HTMLElement, model: ColorPickerModel, pixelRatio: number);
    get domNode(): HTMLElement;
    get canvas(): HTMLCanvasElement;
    private onPointerDown;
    private onDidChangePosition;
    layout(): void;
    private paint;
    private paintSelection;
    private onDidChangeColor;
}
