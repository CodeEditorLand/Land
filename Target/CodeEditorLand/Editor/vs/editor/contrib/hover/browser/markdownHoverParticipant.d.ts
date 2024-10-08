import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { Position } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import { IModelDecoration } from '../../../common/model.js';
import { ILanguageService } from '../../../common/languages/language.js';
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverParts } from './hoverTypes.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { Hover, HoverProvider, HoverVerbosityAction } from '../../../common/languages.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { AsyncIterableObject } from '../../../../base/common/async.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
export declare class MarkdownHover implements IHoverPart {
    readonly owner: IEditorHoverParticipant<MarkdownHover>;
    readonly range: Range;
    readonly contents: IMarkdownString[];
    readonly isBeforeContent: boolean;
    readonly ordinal: number;
    readonly source: HoverSource | undefined;
    constructor(owner: IEditorHoverParticipant<MarkdownHover>, range: Range, contents: IMarkdownString[], isBeforeContent: boolean, ordinal: number, source?: HoverSource | undefined);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
declare class HoverSource {
    readonly hover: Hover;
    readonly hoverProvider: HoverProvider;
    readonly hoverPosition: Position;
    constructor(hover: Hover, hoverProvider: HoverProvider, hoverPosition: Position);
    supportsVerbosityAction(hoverVerbosityAction: HoverVerbosityAction): boolean;
}
export declare class MarkdownHoverParticipant implements IEditorHoverParticipant<MarkdownHover> {
    protected readonly _editor: ICodeEditor;
    private readonly _languageService;
    private readonly _openerService;
    private readonly _configurationService;
    protected readonly _languageFeaturesService: ILanguageFeaturesService;
    private readonly _keybindingService;
    private readonly _hoverService;
    private readonly _commandService;
    readonly hoverOrdinal: number;
    private _renderedHoverParts;
    constructor(_editor: ICodeEditor, _languageService: ILanguageService, _openerService: IOpenerService, _configurationService: IConfigurationService, _languageFeaturesService: ILanguageFeaturesService, _keybindingService: IKeybindingService, _hoverService: IHoverService, _commandService: ICommandService);
    createLoadingMessage(anchor: HoverAnchor): MarkdownHover | null;
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): MarkdownHover[];
    computeAsync(anchor: HoverAnchor, lineDecorations: IModelDecoration[], token: CancellationToken): AsyncIterableObject<MarkdownHover>;
    private _getMarkdownHovers;
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: MarkdownHover[]): IRenderedHoverParts<MarkdownHover>;
    getAccessibleContent(hoverPart: MarkdownHover): string;
    doesMarkdownHoverAtIndexSupportVerbosityAction(index: number, action: HoverVerbosityAction): boolean;
    updateMarkdownHoverVerbosityLevel(action: HoverVerbosityAction, index: number, focus?: boolean): Promise<{
        hoverPart: MarkdownHover;
        hoverElement: HTMLElement;
    } | undefined>;
}
export declare function renderMarkdownHovers(context: IEditorHoverRenderContext, markdownHovers: MarkdownHover[], editor: ICodeEditor, languageService: ILanguageService, openerService: IOpenerService): IRenderedHoverParts<MarkdownHover>;
export declare function labelForHoverVerbosityAction(keybindingService: IKeybindingService, action: HoverVerbosityAction): string;
export {};
