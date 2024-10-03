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
import * as dom from '../../../../base/browser/dom.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { TokenizationRegistry } from '../../../common/languages.js';
import { HoverOperation } from './hoverOperation.js';
import { HoverParticipantRegistry, HoverRangeAnchor } from './hoverTypes.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ContentHoverWidget } from './contentHoverWidget.js';
import { ContentHoverComputer } from './contentHoverComputer.js';
import { ContentHoverResult } from './contentHoverTypes.js';
import { Emitter } from '../../../../base/common/event.js';
import { RenderedContentHover } from './contentHoverRendered.js';
import { isMousePositionWithinElement } from './hoverUtils.js';
let ContentHoverWidgetWrapper = class ContentHoverWidgetWrapper extends Disposable {
    constructor(_editor, _instantiationService, _keybindingService) {
        super();
        this._editor = _editor;
        this._instantiationService = _instantiationService;
        this._keybindingService = _keybindingService;
        this._currentResult = null;
        this._onContentsChanged = this._register(new Emitter());
        this.onContentsChanged = this._onContentsChanged.event;
        this._contentHoverWidget = this._register(this._instantiationService.createInstance(ContentHoverWidget, this._editor));
        this._participants = this._initializeHoverParticipants();
        this._hoverOperation = this._register(new HoverOperation(this._editor, new ContentHoverComputer(this._editor, this._participants)));
        this._registerListeners();
    }
    _initializeHoverParticipants() {
        const participants = [];
        for (const participant of HoverParticipantRegistry.getAll()) {
            const participantInstance = this._instantiationService.createInstance(participant, this._editor);
            participants.push(participantInstance);
        }
        participants.sort((p1, p2) => p1.hoverOrdinal - p2.hoverOrdinal);
        this._register(this._contentHoverWidget.onDidResize(() => {
            this._participants.forEach(participant => participant.handleResize?.());
        }));
        return participants;
    }
    _registerListeners() {
        this._register(this._hoverOperation.onResult((result) => {
            const messages = (result.hasLoadingMessage ? this._addLoadingMessage(result) : result.value);
            this._withResult(new ContentHoverResult(messages, result.isComplete, result.options));
        }));
        const contentHoverWidgetNode = this._contentHoverWidget.getDomNode();
        this._register(dom.addStandardDisposableListener(contentHoverWidgetNode, 'keydown', (e) => {
            if (e.equals(9)) {
                this.hide();
            }
        }));
        this._register(dom.addStandardDisposableListener(contentHoverWidgetNode, 'mouseleave', (e) => {
            this._onMouseLeave(e);
        }));
        this._register(TokenizationRegistry.onDidChange(() => {
            if (this._contentHoverWidget.position && this._currentResult) {
                this._setCurrentResult(this._currentResult);
            }
        }));
    }
    _startShowingOrUpdateHover(anchor, mode, source, focus, mouseEvent) {
        const contentHoverIsVisible = this._contentHoverWidget.position && this._currentResult;
        if (!contentHoverIsVisible) {
            if (anchor) {
                this._startHoverOperationIfNecessary(anchor, mode, source, focus, false);
                return true;
            }
            return false;
        }
        const isHoverSticky = this._editor.getOption(62).sticky;
        const isMouseGettingCloser = mouseEvent && this._contentHoverWidget.isMouseGettingCloser(mouseEvent.event.posx, mouseEvent.event.posy);
        const isHoverStickyAndIsMouseGettingCloser = isHoverSticky && isMouseGettingCloser;
        if (isHoverStickyAndIsMouseGettingCloser) {
            if (anchor) {
                this._startHoverOperationIfNecessary(anchor, mode, source, focus, true);
            }
            return true;
        }
        if (!anchor) {
            this._setCurrentResult(null);
            return false;
        }
        const currentAnchorEqualsPreviousAnchor = this._currentResult && this._currentResult.options.anchor.equals(anchor);
        if (currentAnchorEqualsPreviousAnchor) {
            return true;
        }
        const currentAnchorCompatibleWithPreviousAnchor = this._currentResult && anchor.canAdoptVisibleHover(this._currentResult.options.anchor, this._contentHoverWidget.position);
        if (!currentAnchorCompatibleWithPreviousAnchor) {
            this._setCurrentResult(null);
            this._startHoverOperationIfNecessary(anchor, mode, source, focus, false);
            return true;
        }
        if (this._currentResult) {
            this._setCurrentResult(this._currentResult.filter(anchor));
        }
        this._startHoverOperationIfNecessary(anchor, mode, source, focus, false);
        return true;
    }
    _startHoverOperationIfNecessary(anchor, mode, source, shouldFocus, insistOnKeepingHoverVisible) {
        const currentAnchorEqualToPreviousHover = this._hoverOperation.options && this._hoverOperation.options.anchor.equals(anchor);
        if (currentAnchorEqualToPreviousHover) {
            return;
        }
        this._hoverOperation.cancel();
        const contentHoverComputerOptions = {
            anchor,
            source,
            shouldFocus,
            insistOnKeepingHoverVisible
        };
        this._hoverOperation.start(mode, contentHoverComputerOptions);
    }
    _setCurrentResult(hoverResult) {
        let currentHoverResult = hoverResult;
        const currentResultEqualToPreviousResult = this._currentResult === currentHoverResult;
        if (currentResultEqualToPreviousResult) {
            return;
        }
        const currentHoverResultIsEmpty = currentHoverResult && currentHoverResult.hoverParts.length === 0;
        if (currentHoverResultIsEmpty) {
            currentHoverResult = null;
        }
        this._currentResult = currentHoverResult;
        if (this._currentResult) {
            this._showHover(this._currentResult);
        }
        else {
            this._hideHover();
        }
    }
    _addLoadingMessage(hoverResult) {
        for (const participant of this._participants) {
            if (!participant.createLoadingMessage) {
                continue;
            }
            const loadingMessage = participant.createLoadingMessage(hoverResult.options.anchor);
            if (!loadingMessage) {
                continue;
            }
            return hoverResult.value.slice(0).concat([loadingMessage]);
        }
        return hoverResult.value;
    }
    _withResult(hoverResult) {
        const previousHoverIsVisibleWithCompleteResult = this._contentHoverWidget.position && this._currentResult && this._currentResult.isComplete;
        if (!previousHoverIsVisibleWithCompleteResult) {
            this._setCurrentResult(hoverResult);
        }
        const isCurrentHoverResultComplete = hoverResult.isComplete;
        if (!isCurrentHoverResultComplete) {
            return;
        }
        const currentHoverResultIsEmpty = hoverResult.hoverParts.length === 0;
        const insistOnKeepingPreviousHoverVisible = hoverResult.options.insistOnKeepingHoverVisible;
        const shouldKeepPreviousHoverVisible = currentHoverResultIsEmpty && insistOnKeepingPreviousHoverVisible;
        if (shouldKeepPreviousHoverVisible) {
            return;
        }
        this._setCurrentResult(hoverResult);
    }
    _showHover(hoverResult) {
        const context = this._getHoverContext();
        this._renderedContentHover = new RenderedContentHover(this._editor, hoverResult, this._participants, context, this._keybindingService);
        if (this._renderedContentHover.domNodeHasChildren) {
            this._contentHoverWidget.show(this._renderedContentHover);
        }
        else {
            this._renderedContentHover.dispose();
        }
    }
    _hideHover() {
        this._contentHoverWidget.hide();
    }
    _getHoverContext() {
        const hide = () => {
            this.hide();
        };
        const onContentsChanged = () => {
            this._onContentsChanged.fire();
            this._contentHoverWidget.onContentsChanged();
        };
        const setMinimumDimensions = (dimensions) => {
            this._contentHoverWidget.setMinimumDimensions(dimensions);
        };
        return { hide, onContentsChanged, setMinimumDimensions };
    }
    showsOrWillShow(mouseEvent) {
        const isContentWidgetResizing = this._contentHoverWidget.isResizing;
        if (isContentWidgetResizing) {
            return true;
        }
        const anchorCandidates = this._findHoverAnchorCandidates(mouseEvent);
        const anchorCandidatesExist = anchorCandidates.length > 0;
        if (!anchorCandidatesExist) {
            return this._startShowingOrUpdateHover(null, 0, 0, false, mouseEvent);
        }
        const anchor = anchorCandidates[0];
        return this._startShowingOrUpdateHover(anchor, 0, 0, false, mouseEvent);
    }
    _findHoverAnchorCandidates(mouseEvent) {
        const anchorCandidates = [];
        for (const participant of this._participants) {
            if (!participant.suggestHoverAnchor) {
                continue;
            }
            const anchor = participant.suggestHoverAnchor(mouseEvent);
            if (!anchor) {
                continue;
            }
            anchorCandidates.push(anchor);
        }
        const target = mouseEvent.target;
        switch (target.type) {
            case 6: {
                anchorCandidates.push(new HoverRangeAnchor(0, target.range, mouseEvent.event.posx, mouseEvent.event.posy));
                break;
            }
            case 7: {
                const epsilon = this._editor.getOption(52).typicalHalfwidthCharacterWidth / 2;
                const mouseIsWithinLinesAndCloseToHover = !target.detail.isAfterLines
                    && typeof target.detail.horizontalDistanceToText === 'number'
                    && target.detail.horizontalDistanceToText < epsilon;
                if (!mouseIsWithinLinesAndCloseToHover) {
                    break;
                }
                anchorCandidates.push(new HoverRangeAnchor(0, target.range, mouseEvent.event.posx, mouseEvent.event.posy));
                break;
            }
        }
        anchorCandidates.sort((a, b) => b.priority - a.priority);
        return anchorCandidates;
    }
    _onMouseLeave(e) {
        const editorDomNode = this._editor.getDomNode();
        const isMousePositionOutsideOfEditor = !editorDomNode || !isMousePositionWithinElement(editorDomNode, e.x, e.y);
        if (isMousePositionOutsideOfEditor) {
            this.hide();
        }
    }
    startShowingAtRange(range, mode, source, focus) {
        this._startShowingOrUpdateHover(new HoverRangeAnchor(0, range, undefined, undefined), mode, source, focus, null);
    }
    getWidgetContent() {
        const node = this._contentHoverWidget.getDomNode();
        if (!node.textContent) {
            return undefined;
        }
        return node.textContent;
    }
    async updateHoverVerbosityLevel(action, index, focus) {
        this._renderedContentHover?.updateHoverVerbosityLevel(action, index, focus);
    }
    doesHoverAtIndexSupportVerbosityAction(index, action) {
        return this._renderedContentHover?.doesHoverAtIndexSupportVerbosityAction(index, action) ?? false;
    }
    getAccessibleWidgetContent() {
        return this._renderedContentHover?.getAccessibleWidgetContent();
    }
    getAccessibleWidgetContentAtIndex(index) {
        return this._renderedContentHover?.getAccessibleWidgetContentAtIndex(index);
    }
    focusedHoverPartIndex() {
        return this._renderedContentHover?.focusedHoverPartIndex ?? -1;
    }
    containsNode(node) {
        return (node ? this._contentHoverWidget.getDomNode().contains(node) : false);
    }
    focus() {
        this._contentHoverWidget.focus();
    }
    focusHoverPartWithIndex(index) {
        this._renderedContentHover?.focusHoverPartWithIndex(index);
    }
    scrollUp() {
        this._contentHoverWidget.scrollUp();
    }
    scrollDown() {
        this._contentHoverWidget.scrollDown();
    }
    scrollLeft() {
        this._contentHoverWidget.scrollLeft();
    }
    scrollRight() {
        this._contentHoverWidget.scrollRight();
    }
    pageUp() {
        this._contentHoverWidget.pageUp();
    }
    pageDown() {
        this._contentHoverWidget.pageDown();
    }
    goToTop() {
        this._contentHoverWidget.goToTop();
    }
    goToBottom() {
        this._contentHoverWidget.goToBottom();
    }
    hide() {
        this._hoverOperation.cancel();
        this._setCurrentResult(null);
    }
    getDomNode() {
        return this._contentHoverWidget.getDomNode();
    }
    get isColorPickerVisible() {
        return this._renderedContentHover?.isColorPickerVisible() ?? false;
    }
    get isVisibleFromKeyboard() {
        return this._contentHoverWidget.isVisibleFromKeyboard;
    }
    get isVisible() {
        return this._contentHoverWidget.isVisible;
    }
    get isFocused() {
        return this._contentHoverWidget.isFocused;
    }
    get isResizing() {
        return this._contentHoverWidget.isResizing;
    }
    get widget() {
        return this._contentHoverWidget;
    }
};
ContentHoverWidgetWrapper = __decorate([
    __param(1, IInstantiationService),
    __param(2, IKeybindingService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ContentHoverWidgetWrapper);
export { ContentHoverWidgetWrapper };
