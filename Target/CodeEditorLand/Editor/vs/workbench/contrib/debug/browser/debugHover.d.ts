import { IMouseEvent } from '../../../../base/browser/mouseEvent.js';
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition } from '../../../../editor/browser/editorBrowser.js';
import { IDimension } from '../../../../editor/common/core/dimension.js';
import { Position } from '../../../../editor/common/core/position.js';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IDebugService, IExpression, IStackFrame } from '../common/debug.js';
export declare const enum ShowDebugHoverResult {
    NOT_CHANGED = 0,
    NOT_AVAILABLE = 1,
    CANCELLED = 2
}
export declare function findExpressionInStackFrame(stackFrame: IStackFrame, namesToFind: string[]): Promise<IExpression | undefined>;
export declare class DebugHoverWidget implements IContentWidget {
    private editor;
    private readonly debugService;
    private readonly instantiationService;
    private readonly menuService;
    private readonly contextKeyService;
    private readonly contextMenuService;
    static readonly ID = "debug.hoverWidget";
    readonly allowEditorOverflow = true;
    private _isVisible?;
    private safeTriangle?;
    private showCancellationSource?;
    private domNode;
    private tree;
    private showAtPosition;
    private positionPreference;
    private readonly highlightDecorations;
    private complexValueContainer;
    private complexValueTitle;
    private valueContainer;
    private treeContainer;
    private toDispose;
    private scrollbar;
    private debugHoverComputer;
    private expressionRenderer;
    private expressionToRender;
    private isUpdatingTree;
    get isShowingComplexValue(): boolean;
    constructor(editor: ICodeEditor, debugService: IDebugService, instantiationService: IInstantiationService, menuService: IMenuService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService);
    private create;
    private onContextMenu;
    private registerListeners;
    isHovered(): boolean;
    isVisible(): boolean;
    willBeVisible(): boolean;
    getId(): string;
    getDomNode(): HTMLElement;
    /**
     * Gets whether the given coordinates are in the safe triangle formed from
     * the position at which the hover was initiated.
     */
    isInSafeTriangle(x: number, y: number): boolean | undefined;
    showAt(position: Position, focus: boolean, mouseEvent?: IMouseEvent): Promise<void | ShowDebugHoverResult>;
    private static readonly _HOVER_HIGHLIGHT_DECORATION_OPTIONS;
    private doShow;
    private layoutTreeAndContainer;
    private layoutTree;
    beforeRender(): IDimension | null;
    afterRender(positionPreference: ContentWidgetPositionPreference | null): void;
    hide(): void;
    getPosition(): IContentWidgetPosition | null;
    dispose(): void;
}
