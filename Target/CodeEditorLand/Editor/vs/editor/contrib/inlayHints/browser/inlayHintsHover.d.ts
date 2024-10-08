import { AsyncIterableObject } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ICodeEditor, IEditorMouseEvent } from '../../../browser/editorBrowser.js';
import { IModelDecoration } from '../../../common/model.js';
import { HoverAnchor, IEditorHoverParticipant } from '../../hover/browser/hoverTypes.js';
import { ILanguageService } from '../../../common/languages/language.js';
import { ITextModelService } from '../../../common/services/resolverService.js';
import { MarkdownHover, MarkdownHoverParticipant } from '../../hover/browser/markdownHoverParticipant.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
export declare class InlayHintsHover extends MarkdownHoverParticipant implements IEditorHoverParticipant<MarkdownHover> {
    private readonly _resolverService;
    readonly hoverOrdinal: number;
    constructor(editor: ICodeEditor, languageService: ILanguageService, openerService: IOpenerService, keybindingService: IKeybindingService, hoverService: IHoverService, configurationService: IConfigurationService, _resolverService: ITextModelService, languageFeaturesService: ILanguageFeaturesService, commandService: ICommandService);
    suggestHoverAnchor(mouseEvent: IEditorMouseEvent): HoverAnchor | null;
    computeSync(): MarkdownHover[];
    computeAsync(anchor: HoverAnchor, _lineDecorations: IModelDecoration[], token: CancellationToken): AsyncIterableObject<MarkdownHover>;
    private _resolveInlayHintLabelPartHover;
}
