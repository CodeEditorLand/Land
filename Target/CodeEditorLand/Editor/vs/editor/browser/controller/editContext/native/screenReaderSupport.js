/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { getActiveWindow } from '../../../../../base/browser/dom.js';
import { FastDomNode } from '../../../../../base/browser/fastDomNode.js';
import { localize } from '../../../../../nls.js';
import { IAccessibilityService } from '../../../../../platform/accessibility/common/accessibility.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { Selection } from '../../../../common/core/selection.js';
import { ViewContext } from '../../../../common/viewModel/viewContext.js';
import { applyFontInfo } from '../../../config/domFontInfo.js';
import { ariaLabelForScreenReaderContent, newlinecount, PagedScreenReaderStrategy } from '../screenReaderUtils.js';
let ScreenReaderSupport = class ScreenReaderSupport {
    constructor(_domNode, _context, _keybindingService, _accessibilityService) {
        this._domNode = _domNode;
        this._context = _context;
        this._keybindingService = _keybindingService;
        this._accessibilityService = _accessibilityService;
        // Configuration values
        this._contentLeft = 1;
        this._contentWidth = 1;
        this._lineHeight = 1;
        this._accessibilityPageSize = 1;
        this._primarySelection = new Selection(1, 1, 1, 1);
        this._updateConfigurationSettings();
        this._updateDomAttributes();
    }
    onConfigurationChanged(e) {
        this._updateConfigurationSettings();
        this._updateDomAttributes();
        if (this._accessibilityService.isScreenReaderOptimized()) {
            this.writeScreenReaderContent();
        }
    }
    _updateConfigurationSettings() {
        const options = this._context.configuration.options;
        const layoutInfo = options.get(149 /* EditorOption.layoutInfo */);
        this._contentLeft = layoutInfo.contentLeft;
        this._contentWidth = layoutInfo.contentWidth;
        this._fontInfo = options.get(52 /* EditorOption.fontInfo */);
        this._lineHeight = options.get(69 /* EditorOption.lineHeight */);
        this._accessibilityPageSize = options.get(3 /* EditorOption.accessibilityPageSize */);
    }
    _updateDomAttributes() {
        const options = this._context.configuration.options;
        this._domNode.domNode.setAttribute('role', 'textbox');
        this._domNode.domNode.setAttribute('aria-required', options.get(5 /* EditorOption.ariaRequired */) ? 'true' : 'false');
        this._domNode.domNode.setAttribute('aria-multiline', 'true');
        this._domNode.domNode.setAttribute('aria-autocomplete', options.get(95 /* EditorOption.readOnly */) ? 'none' : 'both');
        this._domNode.domNode.setAttribute('aria-roledescription', localize('editor', "editor"));
        this._domNode.domNode.setAttribute('aria-label', ariaLabelForScreenReaderContent(options, this._keybindingService));
        const tabSize = this._context.viewModel.model.getOptions().tabSize;
        const spaceWidth = options.get(52 /* EditorOption.fontInfo */).spaceWidth;
        this._domNode.domNode.style.tabSize = `${tabSize * spaceWidth}px`;
    }
    onCursorStateChanged(e) {
        this._primarySelection = e.selections[0] ?? new Selection(1, 1, 1, 1);
    }
    prepareRender(ctx) {
        this.writeScreenReaderContent();
    }
    render(ctx) {
        if (!this._screenReaderContentState) {
            return;
        }
        // For correct alignment of the screen reader content, we need to apply the correct font
        applyFontInfo(this._domNode, this._fontInfo);
        const verticalOffsetForPrimaryLineNumber = this._context.viewLayout.getVerticalOffsetForLineNumber(this._primarySelection.positionLineNumber);
        const editorScrollTop = this._context.viewLayout.getCurrentScrollTop();
        const top = verticalOffsetForPrimaryLineNumber - editorScrollTop;
        this._domNode.setTop(top);
        this._domNode.setLeft(this._contentLeft);
        this._domNode.setWidth(this._contentWidth);
        this._domNode.setHeight(this._lineHeight);
        // Setting position within the screen reader content by modifying scroll position
        const textContentBeforeSelection = this._screenReaderContentState.value.substring(0, this._screenReaderContentState.selectionStart);
        const numberOfLinesOfContentBeforeSelection = newlinecount(textContentBeforeSelection);
        this._domNode.domNode.scrollTop = numberOfLinesOfContentBeforeSelection * this._lineHeight;
    }
    setAriaOptions() { }
    writeScreenReaderContent() {
        const focusedElement = getActiveWindow().document.activeElement;
        if (!focusedElement || focusedElement !== this._domNode.domNode) {
            return;
        }
        this._screenReaderContentState = this._getScreenReaderContentState();
        if (!this._screenReaderContentState) {
            return;
        }
        if (this._domNode.domNode.textContent !== this._screenReaderContentState.value) {
            this._domNode.domNode.textContent = this._screenReaderContentState.value;
        }
        this._setSelectionOfScreenReaderContent(this._screenReaderContentState.selectionStart, this._screenReaderContentState.selectionEnd);
    }
    get screenReaderContentState() {
        return this._screenReaderContentState;
    }
    _getScreenReaderContentState() {
        if (!this._accessibilityService.isScreenReaderOptimized()) {
            return;
        }
        const simpleModel = {
            getLineCount: () => {
                return this._context.viewModel.getLineCount();
            },
            getLineMaxColumn: (lineNumber) => {
                return this._context.viewModel.getLineMaxColumn(lineNumber);
            },
            getValueInRange: (range, eol) => {
                return this._context.viewModel.getValueInRange(range, eol);
            },
            getValueLengthInRange: (range, eol) => {
                return this._context.viewModel.getValueLengthInRange(range, eol);
            },
            modifyPosition: (position, offset) => {
                return this._context.viewModel.modifyPosition(position, offset);
            }
        };
        return PagedScreenReaderStrategy.fromEditorSelection(simpleModel, this._primarySelection, this._accessibilityPageSize, this._accessibilityService.getAccessibilitySupport() === 0 /* AccessibilitySupport.Unknown */);
    }
    _setSelectionOfScreenReaderContent(selectionOffsetStart, selectionOffsetEnd) {
        const activeDocument = getActiveWindow().document;
        const activeDocumentSelection = activeDocument.getSelection();
        if (!activeDocumentSelection) {
            return;
        }
        const textContent = this._domNode.domNode.firstChild;
        if (!textContent) {
            return;
        }
        const range = new globalThis.Range();
        range.setStart(textContent, selectionOffsetStart);
        range.setEnd(textContent, selectionOffsetEnd);
        activeDocumentSelection.removeAllRanges();
        activeDocumentSelection.addRange(range);
    }
};
ScreenReaderSupport = __decorate([
    __param(2, IKeybindingService),
    __param(3, IAccessibilityService),
    __metadata("design:paramtypes", [FastDomNode,
        ViewContext, Object, Object])
], ScreenReaderSupport);
export { ScreenReaderSupport };
