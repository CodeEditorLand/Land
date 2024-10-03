var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { getColors } from '../color.js';
import { ColorDetector } from '../colorDetector.js';
import { createColorHover, updateColorPresentations, updateEditorModel } from '../colorPickerParticipantUtils.js';
import { ColorPickerWidget } from '../hoverColorPicker/hoverColorPickerWidget.js';
import { Range } from '../../../../common/core/range.js';
import { Dimension } from '../../../../../base/browser/dom.js';
export class StandaloneColorPickerHover {
    constructor(owner, range, model, provider) {
        this.owner = owner;
        this.range = range;
        this.model = model;
        this.provider = provider;
    }
    static fromBaseColor(owner, color) {
        return new StandaloneColorPickerHover(owner, color.range, color.model, color.provider);
    }
}
let StandaloneColorPickerParticipant = class StandaloneColorPickerParticipant {
    constructor(_editor, _themeService) {
        this._editor = _editor;
        this._themeService = _themeService;
        this.hoverOrdinal = 2;
        this._color = null;
    }
    async createColorHover(defaultColorInfo, defaultColorProvider, colorProviderRegistry) {
        if (!this._editor.hasModel()) {
            return null;
        }
        const colorDetector = ColorDetector.get(this._editor);
        if (!colorDetector) {
            return null;
        }
        const colors = await getColors(colorProviderRegistry, this._editor.getModel(), CancellationToken.None);
        let foundColorInfo = null;
        let foundColorProvider = null;
        for (const colorData of colors) {
            const colorInfo = colorData.colorInfo;
            if (Range.containsRange(colorInfo.range, defaultColorInfo.range)) {
                foundColorInfo = colorInfo;
                foundColorProvider = colorData.provider;
            }
        }
        const colorInfo = foundColorInfo ?? defaultColorInfo;
        const colorProvider = foundColorProvider ?? defaultColorProvider;
        const foundInEditor = !!foundColorInfo;
        const colorHover = StandaloneColorPickerHover.fromBaseColor(this, await createColorHover(this._editor.getModel(), colorInfo, colorProvider));
        return { colorHover, foundInEditor };
    }
    async updateEditorModel(colorHoverData) {
        if (!this._editor.hasModel()) {
            return;
        }
        const colorPickerModel = colorHoverData.model;
        let range = new Range(colorHoverData.range.startLineNumber, colorHoverData.range.startColumn, colorHoverData.range.endLineNumber, colorHoverData.range.endColumn);
        if (this._color) {
            await updateColorPresentations(this._editor.getModel(), colorPickerModel, this._color, range, colorHoverData);
            range = updateEditorModel(this._editor, range, colorPickerModel);
        }
    }
    renderHoverParts(context, hoverParts) {
        if (hoverParts.length === 0 || !this._editor.hasModel()) {
            return undefined;
        }
        if (context.setMinimumDimensions) {
            const minimumHeight = this._editor.getOption(69) + 8;
            context.setMinimumDimensions(new Dimension(302, minimumHeight));
        }
        const disposables = new DisposableStore();
        const colorHover = hoverParts[0];
        const editorModel = this._editor.getModel();
        const model = colorHover.model;
        const colorPicker = disposables.add(new ColorPickerWidget(context.fragment, model, this._editor.getOption(146), this._themeService, true));
        let editorUpdatedByColorPicker = false;
        const range = new Range(colorHover.range.startLineNumber, colorHover.range.startColumn, colorHover.range.endLineNumber, colorHover.range.endColumn);
        const color = colorHover.model.color;
        this._color = color;
        updateColorPresentations(editorModel, model, color, range, colorHover);
        disposables.add(model.onColorFlushed((color) => {
            this._color = color;
        }));
        disposables.add(model.onDidChangeColor((color) => {
            updateColorPresentations(editorModel, model, color, range, colorHover);
        }));
        disposables.add(this._editor.onDidChangeModelContent((e) => {
            if (editorUpdatedByColorPicker) {
                editorUpdatedByColorPicker = false;
            }
            else {
                context.hide();
                this._editor.focus();
            }
        }));
        return { hoverPart: colorHover, colorPicker, disposables };
    }
};
StandaloneColorPickerParticipant = __decorate([
    __param(1, IThemeService),
    __metadata("design:paramtypes", [Object, Object])
], StandaloneColorPickerParticipant);
export { StandaloneColorPickerParticipant };
