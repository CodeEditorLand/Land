import * as dom from '../../../../base/browser/dom.js';
import { Event } from '../../../../base/common/event.js';
import { ICodeEditor, IEditorMouseEvent } from '../../../../editor/browser/editorBrowser.js';
import { IPosition } from '../../../../editor/common/core/position.js';
import { IRange } from '../../../../editor/common/core/range.js';
import * as languages from '../../../../editor/common/languages.js';
import { ZoneWidget } from '../../../../editor/contrib/zoneWidget/browser/zoneWidget.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ICommentService } from './commentService.js';
import { ICommentThreadWidget } from '../common/commentThreadWidget.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
export declare enum CommentWidgetFocus {
    None = 0,
    Widget = 1,
    Editor = 2
}
export declare function parseMouseDownInfoFromEvent(e: IEditorMouseEvent): {
    lineNumber: number;
} | null;
export declare function isMouseUpEventDragFromMouseDown(mouseDownInfo: {
    lineNumber: number;
} | null, e: IEditorMouseEvent): number | null;
export declare function isMouseUpEventMatchMouseDown(mouseDownInfo: {
    lineNumber: number;
} | null, e: IEditorMouseEvent): number | null;
export declare class ReviewZoneWidget extends ZoneWidget implements ICommentThreadWidget {
    private _uniqueOwner;
    private _commentThread;
    private _pendingComment;
    private _pendingEdits;
    private themeService;
    private commentService;
    private readonly configurationService;
    private _commentThreadWidget;
    private readonly _onDidClose;
    private readonly _onDidCreateThread;
    private _isExpanded?;
    private _initialCollapsibleState?;
    private _commentGlyph?;
    private readonly _globalToDispose;
    private _commentThreadDisposables;
    private _contextKeyService;
    private _scopedInstantiationService;
    get uniqueOwner(): string;
    get commentThread(): languages.CommentThread;
    get expanded(): boolean | undefined;
    private _commentOptions;
    constructor(editor: ICodeEditor, _uniqueOwner: string, _commentThread: languages.CommentThread, _pendingComment: languages.PendingComment | undefined, _pendingEdits: {
        [key: number]: languages.PendingComment;
    } | undefined, instantiationService: IInstantiationService, themeService: IThemeService, commentService: ICommentService, contextKeyService: IContextKeyService, configurationService: IConfigurationService);
    get onDidClose(): Event<ReviewZoneWidget | undefined>;
    get onDidCreateThread(): Event<ReviewZoneWidget>;
    getPosition(): IPosition | undefined;
    protected revealRange(): void;
    reveal(commentUniqueId?: number, focus?: CommentWidgetFocus): void;
    private _expandAndShowZoneWidget;
    private _setFocus;
    private _goToComment;
    private _goToThread;
    makeVisible(commentUniqueId?: number, focus?: CommentWidgetFocus): void;
    getPendingComments(): {
        newComment: languages.PendingComment | undefined;
        edits: {
            [key: number]: languages.PendingComment;
        };
    };
    setPendingComment(pending: languages.PendingComment): void;
    protected _fillContainer(container: HTMLElement): void;
    private arrowPosition;
    private deleteCommentThread;
    collapse(): void;
    expand(setActive?: boolean): void;
    getGlyphPosition(): number;
    update(commentThread: languages.CommentThread<IRange>): Promise<void>;
    protected _onWidth(widthInPixel: number): void;
    protected _doLayout(heightInPixel: number, widthInPixel: number): void;
    display(range: IRange | undefined, shouldReveal: boolean): Promise<void>;
    private bindCommentThreadListeners;
    submitComment(): Promise<void>;
    _refresh(dimensions: dom.Dimension): void;
    private _applyTheme;
    show(rangeOrPos: IRange | IPosition | undefined, heightInLines: number): void;
    hide(): void;
    dispose(): void;
}
