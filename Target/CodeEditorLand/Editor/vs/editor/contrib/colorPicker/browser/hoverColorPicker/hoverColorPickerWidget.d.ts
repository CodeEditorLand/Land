import '../colorPicker.css';
import { Widget } from '../../../../../base/browser/ui/widget.js';
import { ColorPickerModel } from '../colorPickerModel.js';
import { IEditorHoverColorPickerWidget } from '../../../hover/browser/hoverTypes.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { ColorPickerBody } from '../colorPickerParts/colorPickerBody.js';
import { ColorPickerHeader } from '../colorPickerParts/colorPickerHeader.js';
export declare class ColorPickerWidget extends Widget implements IEditorHoverColorPickerWidget {
    readonly model: ColorPickerModel;
    private pixelRatio;
    private static readonly ID;
    private readonly _domNode;
    body: ColorPickerBody;
    header: ColorPickerHeader;
    constructor(container: Node, model: ColorPickerModel, pixelRatio: number, themeService: IThemeService, standaloneColorPicker?: boolean);
    getId(): string;
    layout(): void;
    get domNode(): HTMLElement;
}
