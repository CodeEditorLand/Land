import './textAreaEditContext.css';
import { FastDomNode } from '../../../../../base/browser/fastDomNode.js';
import { ViewController } from '../../../view/viewController.js';
import { Position } from '../../../../common/core/position.js';
import { Range } from '../../../../common/core/range.js';
import { RenderingContext, RestrictedRenderingContext, HorizontalPosition, LineVisibleRanges } from '../../../view/renderingContext.js';
import { ViewContext } from '../../../../common/viewModel/viewContext.js';
import * as viewEvents from '../../../../common/viewEvents.js';
import { IEditorAriaOptions } from '../../../editorBrowser.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { AbstractEditContext } from '../editContext.js';
export interface IVisibleRangeProvider {
    visibleRangeForPosition(position: Position): HorizontalPosition | null;
    linesVisibleRangesForRange(range: Range, includeNewLines: boolean): LineVisibleRanges[] | null;
}
export declare class TextAreaEditContext extends AbstractEditContext {
    private readonly _keybindingService;
    private readonly _instantiationService;
    private readonly _viewController;
    private readonly _visibleRangeProvider;
    private _scrollLeft;
    private _scrollTop;
    private _accessibilitySupport;
    private _accessibilityPageSize;
    private _textAreaWrapping;
    private _textAreaWidth;
    private _contentLeft;
    private _contentWidth;
    private _contentHeight;
    private _fontInfo;
    private _lineHeight;
    private _emptySelectionClipboard;
    private _copyWithSyntaxHighlighting;
    /**
     * Defined only when the text area is visible (composition case).
     */
    private _visibleTextArea;
    private _selections;
    private _modelSelections;
    /**
     * The position at which the textarea was rendered.
     * This is useful for hit-testing and determining the mouse position.
     */
    private _lastRenderPosition;
    readonly textArea: FastDomNode<HTMLTextAreaElement>;
    readonly textAreaCover: FastDomNode<HTMLElement>;
    private readonly _textAreaInput;
    constructor(context: ViewContext, overflowGuardContainer: FastDomNode<HTMLElement>, viewController: ViewController, visibleRangeProvider: IVisibleRangeProvider, _keybindingService: IKeybindingService, _instantiationService: IInstantiationService);
    get domNode(): FastDomNode<HTMLTextAreaElement>;
    writeScreenReaderContent(reason: string): void;
    dispose(): void;
    private _getAndroidWordAtPosition;
    private _getWordBeforePosition;
    private _getCharacterBeforePosition;
    private _setAccessibilityOptions;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    isFocused(): boolean;
    focus(): void;
    refreshFocusState(): void;
    getLastRenderData(): Position | null;
    setAriaOptions(options: IEditorAriaOptions): void;
    private _ensureReadOnlyAttribute;
    private _primaryCursorPosition;
    private _primaryCursorVisibleRange;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
    private _render;
    private _renderAtTopLeft;
    private _doRender;
}
