import { AsyncIterableObject } from '../../../../../base/common/async.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { ICodeEditor } from '../../../../browser/editorBrowser.js';
import { Range } from '../../../../common/core/range.js';
import { IModelDecoration } from '../../../../common/model.js';
import { DocumentColorProvider } from '../../../../common/languages.js';
import { ColorPickerModel } from '../colorPickerModel.js';
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverParts } from '../../../hover/browser/hoverTypes.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { BaseColor } from '../colorPickerParticipantUtils.js';
export declare class ColorHover implements IHoverPart, BaseColor {
    readonly owner: IEditorHoverParticipant<ColorHover>;
    readonly range: Range;
    readonly model: ColorPickerModel;
    readonly provider: DocumentColorProvider;
    /**
     * Force the hover to always be rendered at this specific range,
     * even in the case of multiple hover parts.
     */
    readonly forceShowAtRange: boolean;
    constructor(owner: IEditorHoverParticipant<ColorHover>, range: Range, model: ColorPickerModel, provider: DocumentColorProvider);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
    static fromBaseColor(owner: IEditorHoverParticipant<ColorHover>, color: BaseColor): ColorHover;
}
export declare class HoverColorPickerParticipant implements IEditorHoverParticipant<ColorHover> {
    private readonly _editor;
    private readonly _themeService;
    readonly hoverOrdinal: number;
    private _colorPicker;
    constructor(_editor: ICodeEditor, _themeService: IThemeService);
    computeSync(_anchor: HoverAnchor, _lineDecorations: IModelDecoration[]): ColorHover[];
    computeAsync(anchor: HoverAnchor, lineDecorations: IModelDecoration[], token: CancellationToken): AsyncIterableObject<ColorHover>;
    private _computeAsync;
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: ColorHover[]): IRenderedHoverParts<ColorHover>;
    getAccessibleContent(hoverPart: ColorHover): string;
    handleResize(): void;
    isColorPickerVisible(): boolean;
}
