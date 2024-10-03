import { Disposable } from '../../../../base/common/lifecycle.js';
import './unicodeHighlighter.css';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { EditorAction, ServicesAccessor } from '../../../browser/editorExtensions.js';
import { Range } from '../../../common/core/range.js';
import { IEditorContribution } from '../../../common/editorCommon.js';
import { IModelDecoration } from '../../../common/model.js';
import { UnicodeHighlighterReason } from '../../../common/services/unicodeTextModelHighlighter.js';
import { IEditorWorkerService } from '../../../common/services/editorWorker.js';
import { ILanguageService } from '../../../common/languages/language.js';
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverParts } from '../../hover/browser/hoverTypes.js';
import { MarkdownHover } from '../../hover/browser/markdownHoverParticipant.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
export declare const warningIcon: import("../../../../base/common/themables.js").ThemeIcon;
export declare class UnicodeHighlighter extends Disposable implements IEditorContribution {
    private readonly _editor;
    private readonly _editorWorkerService;
    private readonly _workspaceTrustService;
    static readonly ID = "editor.contrib.unicodeHighlighter";
    private _highlighter;
    private _options;
    private readonly _bannerController;
    private _bannerClosed;
    constructor(_editor: ICodeEditor, _editorWorkerService: IEditorWorkerService, _workspaceTrustService: IWorkspaceTrustManagementService, instantiationService: IInstantiationService);
    dispose(): void;
    private readonly _updateState;
    private _updateHighlighter;
    getDecorationInfo(decoration: IModelDecoration): UnicodeHighlighterDecorationInfo | null;
}
export interface UnicodeHighlighterDecorationInfo {
    reason: UnicodeHighlighterReason;
    inComment: boolean;
    inString: boolean;
}
export declare class UnicodeHighlighterHover implements IHoverPart {
    readonly owner: IEditorHoverParticipant<UnicodeHighlighterHover>;
    readonly range: Range;
    readonly decoration: IModelDecoration;
    constructor(owner: IEditorHoverParticipant<UnicodeHighlighterHover>, range: Range, decoration: IModelDecoration);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
export declare class UnicodeHighlighterHoverParticipant implements IEditorHoverParticipant<MarkdownHover> {
    private readonly _editor;
    private readonly _languageService;
    private readonly _openerService;
    readonly hoverOrdinal: number;
    constructor(_editor: ICodeEditor, _languageService: ILanguageService, _openerService: IOpenerService);
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): MarkdownHover[];
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: MarkdownHover[]): IRenderedHoverParts<MarkdownHover>;
    getAccessibleContent(hoverPart: MarkdownHover): string;
}
interface IDisableUnicodeHighlightAction {
    shortLabel: string;
}
export declare class DisableHighlightingInCommentsAction extends EditorAction implements IDisableUnicodeHighlightAction {
    static ID: string;
    readonly shortLabel: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor, args: any): Promise<void>;
    runAction(configurationService: IConfigurationService): Promise<void>;
}
export declare class DisableHighlightingInStringsAction extends EditorAction implements IDisableUnicodeHighlightAction {
    static ID: string;
    readonly shortLabel: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor, args: any): Promise<void>;
    runAction(configurationService: IConfigurationService): Promise<void>;
}
export declare class DisableHighlightingOfAmbiguousCharactersAction extends EditorAction implements IDisableUnicodeHighlightAction {
    static ID: string;
    readonly shortLabel: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor, args: any): Promise<void>;
    runAction(configurationService: IConfigurationService): Promise<void>;
}
export declare class DisableHighlightingOfInvisibleCharactersAction extends EditorAction implements IDisableUnicodeHighlightAction {
    static ID: string;
    readonly shortLabel: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor, args: any): Promise<void>;
    runAction(configurationService: IConfigurationService): Promise<void>;
}
export declare class DisableHighlightingOfNonBasicAsciiCharactersAction extends EditorAction implements IDisableUnicodeHighlightAction {
    static ID: string;
    readonly shortLabel: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor, args: any): Promise<void>;
    runAction(configurationService: IConfigurationService): Promise<void>;
}
export declare class ShowExcludeOptions extends EditorAction {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor, args: any): Promise<void>;
}
export {};
