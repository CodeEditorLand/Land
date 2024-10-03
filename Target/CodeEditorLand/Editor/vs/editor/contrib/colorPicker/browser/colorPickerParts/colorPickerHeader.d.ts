import '../colorPicker.css';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ColorPickerModel } from '../colorPickerModel.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { CloseButton } from './colorPickerCloseButton.js';
export declare class ColorPickerHeader extends Disposable {
    private readonly model;
    private showingStandaloneColorPicker;
    private readonly _domNode;
    private readonly _pickedColorNode;
    private readonly _pickedColorPresentation;
    private readonly _originalColorNode;
    private readonly _closeButton;
    private backgroundColor;
    constructor(container: HTMLElement, model: ColorPickerModel, themeService: IThemeService, showingStandaloneColorPicker?: boolean);
    get domNode(): HTMLElement;
    get closeButton(): CloseButton | null;
    get pickedColorNode(): HTMLElement;
    get originalColorNode(): HTMLElement;
    private onDidChangeColor;
    private onDidChangePresentation;
}
