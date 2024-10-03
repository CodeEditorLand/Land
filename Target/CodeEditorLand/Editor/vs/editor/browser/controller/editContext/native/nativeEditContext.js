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
import './nativeEditContext.css';
import { isFirefox } from '../../../../../base/browser/browser.js';
import { addDisposableListener } from '../../../../../base/browser/dom.js';
import { FastDomNode } from '../../../../../base/browser/fastDomNode.js';
import { StandardKeyboardEvent } from '../../../../../base/browser/keyboardEvent.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ViewContext } from '../../../../common/viewModel/viewContext.js';
import { ViewController } from '../../../view/viewController.js';
import { getDataToCopy, InMemoryClipboardMetadataManager } from '../clipboardUtils.js';
import { AbstractEditContext } from '../editContext.js';
import { editContextAddDisposableListener, FocusTracker } from './nativeEditContextUtils.js';
import { ScreenReaderSupport } from './screenReaderSupport.js';
import { Range } from '../../../../common/core/range.js';
import { Selection } from '../../../../common/core/selection.js';
import { Position } from '../../../../common/core/position.js';
import { PositionOffsetTransformer } from '../../../../common/core/positionToOffset.js';
var CompositionClassName;
(function (CompositionClassName) {
    CompositionClassName["NONE"] = "edit-context-composition-none";
    CompositionClassName["SECONDARY"] = "edit-context-composition-secondary";
    CompositionClassName["PRIMARY"] = "edit-context-composition-primary";
})(CompositionClassName || (CompositionClassName = {}));
let NativeEditContext = class NativeEditContext extends AbstractEditContext {
    constructor(context, overflowGuardContainer, viewController, _visibleRangeProvider, instantiationService, clipboardService) {
        super(context);
        this._visibleRangeProvider = _visibleRangeProvider;
        this._decorations = [];
        this._primarySelection = new Selection(1, 1, 1, 1);
        this._textStartPositionWithinEditor = new Position(1, 1);
        this.domNode = new FastDomNode(document.createElement('div'));
        this.domNode.setClassName(`native-edit-context`);
        this._updateDomAttributes();
        overflowGuardContainer.appendChild(this.domNode);
        this._parent = overflowGuardContainer.domNode;
        this._focusTracker = this._register(new FocusTracker(this.domNode.domNode, (newFocusValue) => this._context.viewModel.setHasFocus(newFocusValue)));
        this._editContext = new EditContext();
        this.domNode.domNode.editContext = this._editContext;
        this._screenReaderSupport = instantiationService.createInstance(ScreenReaderSupport, this.domNode, context);
        this._register(addDisposableListener(this.domNode.domNode, 'copy', () => this._ensureClipboardGetsEditorSelection(clipboardService)));
        this._register(addDisposableListener(this.domNode.domNode, 'cut', () => {
            this._ensureClipboardGetsEditorSelection(clipboardService);
            viewController.cut();
        }));
        this._register(addDisposableListener(this.domNode.domNode, 'keyup', (e) => viewController.emitKeyUp(new StandardKeyboardEvent(e))));
        this._register(addDisposableListener(this.domNode.domNode, 'keydown', async (e) => {
            const standardKeyboardEvent = new StandardKeyboardEvent(e);
            if (standardKeyboardEvent.keyCode === 114) {
                standardKeyboardEvent.stopPropagation();
            }
            viewController.emitKeyDown(standardKeyboardEvent);
        }));
        this._register(addDisposableListener(this.domNode.domNode, 'beforeinput', async (e) => {
            if (e.inputType === 'insertParagraph') {
                this._onType(viewController, { text: '\n', replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 });
            }
        }));
        this._register(editContextAddDisposableListener(this._editContext, 'textformatupdate', (e) => this._handleTextFormatUpdate(e)));
        this._register(editContextAddDisposableListener(this._editContext, 'characterboundsupdate', (e) => this._updateCharacterBounds(e)));
        this._register(editContextAddDisposableListener(this._editContext, 'textupdate', (e) => {
            this._emitTypeEvent(viewController, e);
        }));
        this._register(editContextAddDisposableListener(this._editContext, 'compositionstart', (e) => {
            viewController.compositionStart();
            this._context.viewModel.onCompositionStart();
        }));
        this._register(editContextAddDisposableListener(this._editContext, 'compositionend', (e) => {
            viewController.compositionEnd();
            this._context.viewModel.onCompositionEnd();
        }));
    }
    dispose() {
        this.domNode.domNode.blur();
        this.domNode.domNode.remove();
        super.dispose();
    }
    setAriaOptions() {
        this._screenReaderSupport.setAriaOptions();
    }
    getLastRenderData() {
        return this._primarySelection.getPosition();
    }
    prepareRender(ctx) {
        this._screenReaderSupport.prepareRender(ctx);
        this._updateEditContext();
        this._updateSelectionAndControlBounds(ctx);
    }
    render(ctx) {
        this._screenReaderSupport.render(ctx);
    }
    onCursorStateChanged(e) {
        this._primarySelection = e.modelSelections[0] ?? new Selection(1, 1, 1, 1);
        this._screenReaderSupport.onCursorStateChanged(e);
        return true;
    }
    onConfigurationChanged(e) {
        this._screenReaderSupport.onConfigurationChanged(e);
        this._updateDomAttributes();
        return true;
    }
    writeScreenReaderContent() {
        this._screenReaderSupport.writeScreenReaderContent();
    }
    isFocused() { return this._focusTracker.isFocused; }
    focus() { this._focusTracker.focus(); }
    refreshFocusState() { }
    _updateDomAttributes() {
        const options = this._context.configuration.options;
        this.domNode.domNode.setAttribute('tabindex', String(options.get(127)));
    }
    _updateEditContext() {
        const editContextState = this._getNewEditContextState();
        this._editContext.updateText(0, Number.MAX_SAFE_INTEGER, editContextState.text);
        this._editContext.updateSelection(editContextState.selectionStartOffset, editContextState.selectionEndOffset);
        this._textStartPositionWithinEditor = editContextState.textStartPositionWithinEditor;
    }
    _emitTypeEvent(viewController, e) {
        if (!this._editContext) {
            return;
        }
        const model = this._context.viewModel.model;
        const offsetOfStartOfText = model.getOffsetAt(this._textStartPositionWithinEditor);
        const offsetOfSelectionEnd = model.getOffsetAt(this._primarySelection.getEndPosition());
        const offsetOfSelectionStart = model.getOffsetAt(this._primarySelection.getStartPosition());
        const selectionEndOffset = offsetOfSelectionEnd - offsetOfStartOfText;
        const selectionStartOffset = offsetOfSelectionStart - offsetOfStartOfText;
        let replaceNextCharCnt = 0;
        let replacePrevCharCnt = 0;
        if (e.updateRangeEnd > selectionEndOffset) {
            replaceNextCharCnt = e.updateRangeEnd - selectionEndOffset;
        }
        if (e.updateRangeStart < selectionStartOffset) {
            replacePrevCharCnt = selectionStartOffset - e.updateRangeStart;
        }
        let text = '';
        if (selectionStartOffset < e.updateRangeStart) {
            text += this._editContext.text.substring(selectionStartOffset, e.updateRangeStart);
        }
        text += e.text;
        if (selectionEndOffset > e.updateRangeEnd) {
            text += this._editContext.text.substring(e.updateRangeEnd, selectionEndOffset);
        }
        const typeInput = {
            text,
            replacePrevCharCnt,
            replaceNextCharCnt,
            positionDelta: 0,
        };
        this._onType(viewController, typeInput);
        this._updateEditContext();
    }
    _onType(viewController, typeInput) {
        if (typeInput.replacePrevCharCnt || typeInput.replaceNextCharCnt || typeInput.positionDelta) {
            viewController.compositionType(typeInput.text, typeInput.replacePrevCharCnt, typeInput.replaceNextCharCnt, typeInput.positionDelta);
        }
        else {
            viewController.type(typeInput.text);
        }
    }
    _getNewEditContextState() {
        const model = this._context.viewModel.model;
        const primarySelectionStartLine = this._primarySelection.startLineNumber;
        const primarySelectionEndLine = this._primarySelection.endLineNumber;
        const endColumnOfEndLineNumber = model.getLineMaxColumn(primarySelectionEndLine);
        const rangeOfText = new Range(primarySelectionStartLine, 1, primarySelectionEndLine, endColumnOfEndLineNumber);
        const text = model.getValueInRange(rangeOfText, 0);
        const selectionStartOffset = this._primarySelection.startColumn - 1;
        const selectionEndOffset = text.length + this._primarySelection.endColumn - endColumnOfEndLineNumber;
        const textStartPositionWithinEditor = rangeOfText.getStartPosition();
        return {
            text,
            selectionStartOffset,
            selectionEndOffset,
            textStartPositionWithinEditor
        };
    }
    _handleTextFormatUpdate(e) {
        if (!this._editContext) {
            return;
        }
        const formats = e.getTextFormats();
        const textStartPositionWithinEditor = this._textStartPositionWithinEditor;
        const decorations = [];
        formats.forEach(f => {
            const textModel = this._context.viewModel.model;
            const offsetOfEditContextText = textModel.getOffsetAt(textStartPositionWithinEditor);
            const startPositionOfDecoration = textModel.getPositionAt(offsetOfEditContextText + f.rangeStart);
            const endPositionOfDecoration = textModel.getPositionAt(offsetOfEditContextText + f.rangeEnd);
            const decorationRange = Range.fromPositions(startPositionOfDecoration, endPositionOfDecoration);
            const thickness = f.underlineThickness.toLowerCase();
            let decorationClassName = CompositionClassName.NONE;
            switch (thickness) {
                case 'thin':
                    decorationClassName = CompositionClassName.SECONDARY;
                    break;
                case 'thick':
                    decorationClassName = CompositionClassName.PRIMARY;
                    break;
            }
            decorations.push({
                range: decorationRange,
                options: {
                    description: 'textFormatDecoration',
                    inlineClassName: decorationClassName,
                }
            });
        });
        this._decorations = this._context.viewModel.model.deltaDecorations(this._decorations, decorations);
    }
    _updateSelectionAndControlBounds(ctx) {
        if (!this._parent) {
            return;
        }
        const options = this._context.configuration.options;
        const lineHeight = options.get(69);
        const contentLeft = options.get(148).contentLeft;
        const parentBounds = this._parent.getBoundingClientRect();
        const modelStartPosition = this._primarySelection.getStartPosition();
        const viewStartPosition = this._context.viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelStartPosition);
        const verticalOffsetStart = this._context.viewLayout.getVerticalOffsetForLineNumber(viewStartPosition.lineNumber);
        const editorScrollTop = this._context.viewLayout.getCurrentScrollTop();
        const editorScrollLeft = this._context.viewLayout.getCurrentScrollLeft();
        const top = parentBounds.top + verticalOffsetStart - editorScrollTop;
        const height = (this._primarySelection.endLineNumber - this._primarySelection.startLineNumber + 1) * lineHeight;
        let left = parentBounds.left + contentLeft - editorScrollLeft;
        let width;
        if (this._primarySelection.isEmpty()) {
            const linesVisibleRanges = ctx.visibleRangeForPosition(viewStartPosition);
            if (linesVisibleRanges) {
                left += linesVisibleRanges.left;
            }
            width = 0;
        }
        else {
            width = parentBounds.width - contentLeft;
        }
        const selectionBounds = new DOMRect(left, top, width, height);
        this._editContext.updateSelectionBounds(selectionBounds);
        this._editContext.updateControlBounds(selectionBounds);
    }
    _updateCharacterBounds(e) {
        if (!this._parent) {
            return;
        }
        const options = this._context.configuration.options;
        const typicalHalfWidthCharacterWidth = options.get(52).typicalHalfwidthCharacterWidth;
        const lineHeight = options.get(69);
        const contentLeft = options.get(148).contentLeft;
        const parentBounds = this._parent.getBoundingClientRect();
        const characterBounds = [];
        const offsetTransformer = new PositionOffsetTransformer(this._editContext.text);
        for (let offset = e.rangeStart; offset < e.rangeEnd; offset++) {
            const editContextStartPosition = offsetTransformer.getPosition(offset);
            const textStartLineOffsetWithinEditor = this._textStartPositionWithinEditor.lineNumber - 1;
            const characterStartPosition = new Position(textStartLineOffsetWithinEditor + editContextStartPosition.lineNumber, editContextStartPosition.column);
            const characterEndPosition = characterStartPosition.delta(0, 1);
            const characterModelRange = Range.fromPositions(characterStartPosition, characterEndPosition);
            const characterViewRange = this._context.viewModel.coordinatesConverter.convertModelRangeToViewRange(characterModelRange);
            const characterLinesVisibleRanges = this._visibleRangeProvider.linesVisibleRangesForRange(characterViewRange, true) ?? [];
            const characterVerticalOffset = this._context.viewLayout.getVerticalOffsetForLineNumber(characterViewRange.startLineNumber);
            const editorScrollTop = this._context.viewLayout.getCurrentScrollTop();
            const editorScrollLeft = this._context.viewLayout.getCurrentScrollLeft();
            const top = parentBounds.top + characterVerticalOffset - editorScrollTop;
            let left = 0;
            let width = typicalHalfWidthCharacterWidth;
            if (characterLinesVisibleRanges.length > 0) {
                for (const visibleRange of characterLinesVisibleRanges[0].ranges) {
                    left = visibleRange.left;
                    width = visibleRange.width;
                    break;
                }
            }
            characterBounds.push(new DOMRect(parentBounds.left + contentLeft + left - editorScrollLeft, top, width, lineHeight));
        }
        this._editContext.updateCharacterBounds(e.rangeStart, characterBounds);
    }
    _ensureClipboardGetsEditorSelection(clipboardService) {
        const options = this._context.configuration.options;
        const emptySelectionClipboard = options.get(38);
        const copyWithSyntaxHighlighting = options.get(25);
        const selections = this._context.viewModel.getCursorStates().map(cursorState => cursorState.modelState.selection);
        const dataToCopy = getDataToCopy(this._context.viewModel, selections, emptySelectionClipboard, copyWithSyntaxHighlighting);
        const storedMetadata = {
            version: 1,
            isFromEmptySelection: dataToCopy.isFromEmptySelection,
            multicursorText: dataToCopy.multicursorText,
            mode: dataToCopy.mode
        };
        InMemoryClipboardMetadataManager.INSTANCE.set((isFirefox ? dataToCopy.text.replace(/\r\n/g, '\n') : dataToCopy.text), storedMetadata);
        clipboardService.writeText(dataToCopy.text);
    }
};
NativeEditContext = __decorate([
    __param(4, IInstantiationService),
    __param(5, IClipboardService),
    __metadata("design:paramtypes", [ViewContext,
        FastDomNode,
        ViewController, Object, Object, Object])
], NativeEditContext);
export { NativeEditContext };
