import { Color } from '../../../../base/common/color.js';
import { Event } from '../../../../base/common/event.js';
import { IColorPresentation } from '../../../common/languages.js';
export declare class ColorPickerModel {
    private presentationIndex;
    readonly originalColor: Color;
    private _color;
    get color(): Color;
    set color(color: Color);
    get presentation(): IColorPresentation;
    private _colorPresentations;
    get colorPresentations(): IColorPresentation[];
    set colorPresentations(colorPresentations: IColorPresentation[]);
    private readonly _onColorFlushed;
    readonly onColorFlushed: Event<Color>;
    private readonly _onDidChangeColor;
    readonly onDidChangeColor: Event<Color>;
    private readonly _onDidChangePresentation;
    readonly onDidChangePresentation: Event<IColorPresentation>;
    constructor(color: Color, availableColorPresentations: IColorPresentation[], presentationIndex: number);
    selectNextColorPresentation(): void;
    guessColorPresentation(color: Color, originalText: string): void;
    flushColor(): void;
}
