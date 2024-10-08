import '../colorPicker.css';
import { Color } from '../../../../../base/common/color.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ColorPickerModel } from '../colorPickerModel.js';
export declare abstract class Strip extends Disposable {
    protected model: ColorPickerModel;
    protected domNode: HTMLElement;
    protected overlay: HTMLElement;
    protected slider: HTMLElement;
    private height;
    private readonly _onDidChange;
    readonly onDidChange: Event<number>;
    private readonly _onColorFlushed;
    readonly onColorFlushed: Event<void>;
    constructor(container: HTMLElement, model: ColorPickerModel, showingStandaloneColorPicker?: boolean);
    layout(): void;
    protected onDidChangeColor(color: Color): void;
    private onPointerDown;
    private onDidChangeTop;
    private updateSliderPosition;
    protected abstract getValue(color: Color): number;
}
export declare class OpacityStrip extends Strip {
    constructor(container: HTMLElement, model: ColorPickerModel, showingStandaloneColorPicker?: boolean);
    protected onDidChangeColor(color: Color): void;
    protected getValue(color: Color): number;
}
export declare class HueStrip extends Strip {
    constructor(container: HTMLElement, model: ColorPickerModel, showingStandaloneColorPicker?: boolean);
    protected getValue(color: Color): number;
}
