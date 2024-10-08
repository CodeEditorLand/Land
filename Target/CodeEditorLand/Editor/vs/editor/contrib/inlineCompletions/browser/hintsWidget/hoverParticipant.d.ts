import { ICodeEditor, IEditorMouseEvent } from '../../../../browser/editorBrowser.js';
import { Range } from '../../../../common/core/range.js';
import { ILanguageService } from '../../../../common/languages/language.js';
import { IModelDecoration } from '../../../../common/model.js';
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverParts } from '../../../hover/browser/hoverTypes.js';
import { InlineCompletionsController } from '../controller/inlineCompletionsController.js';
import { IAccessibilityService } from '../../../../../platform/accessibility/common/accessibility.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
export declare class InlineCompletionsHover implements IHoverPart {
    readonly owner: IEditorHoverParticipant<InlineCompletionsHover>;
    readonly range: Range;
    readonly controller: InlineCompletionsController;
    constructor(owner: IEditorHoverParticipant<InlineCompletionsHover>, range: Range, controller: InlineCompletionsController);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
export declare class InlineCompletionsHoverParticipant implements IEditorHoverParticipant<InlineCompletionsHover> {
    private readonly _editor;
    private readonly _languageService;
    private readonly _openerService;
    private readonly accessibilityService;
    private readonly _instantiationService;
    private readonly _telemetryService;
    readonly hoverOrdinal: number;
    constructor(_editor: ICodeEditor, _languageService: ILanguageService, _openerService: IOpenerService, accessibilityService: IAccessibilityService, _instantiationService: IInstantiationService, _telemetryService: ITelemetryService);
    suggestHoverAnchor(mouseEvent: IEditorMouseEvent): HoverAnchor | null;
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): InlineCompletionsHover[];
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: InlineCompletionsHover[]): IRenderedHoverParts<InlineCompletionsHover>;
    getAccessibleContent(hoverPart: InlineCompletionsHover): string;
    private renderScreenReaderText;
}
