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
import './media/suggest.css';
import * as dom from '../../../../base/browser/dom.js';
import { List } from '../../../../base/browser/ui/list/listWidget.js';
import { ResizableHTMLElement } from '../../../../base/browser/ui/resizable/resizable.js';
import { SimpleSuggestWidgetItemRenderer } from './simpleSuggestWidgetRenderer.js';
import { TimeoutTimer } from '../../../../base/common/async.js';
import { Emitter } from '../../../../base/common/event.js';
import { MutableDisposable, Disposable } from '../../../../base/common/lifecycle.js';
import { clamp } from '../../../../base/common/numbers.js';
import { localize } from '../../../../nls.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { SuggestWidgetStatus } from '../../../../editor/contrib/suggest/browser/suggestWidgetStatus.js';
const $ = dom.$;
let SimpleSuggestWidget = class SimpleSuggestWidget extends Disposable {
    get list() { return this._list; }
    constructor(_container, _persistedSize, _getFontInfo, options, instantiationService) {
        super();
        this._container = _container;
        this._persistedSize = _persistedSize;
        this._getFontInfo = _getFontInfo;
        this._state = 0;
        this._forceRenderingAbove = false;
        this._pendingLayout = this._register(new MutableDisposable());
        this._showTimeout = this._register(new TimeoutTimer());
        this._onDidSelect = this._register(new Emitter());
        this.onDidSelect = this._onDidSelect.event;
        this._onDidHide = this._register(new Emitter());
        this.onDidHide = this._onDidHide.event;
        this._onDidShow = this._register(new Emitter());
        this.onDidShow = this._onDidShow.event;
        this.element = this._register(new ResizableHTMLElement());
        this.element.domNode.classList.add('workbench-suggest-widget');
        this._container.appendChild(this.element.domNode);
        class ResizeState {
            constructor(persistedSize, currentSize, persistHeight = false, persistWidth = false) {
                this.persistedSize = persistedSize;
                this.currentSize = currentSize;
                this.persistHeight = persistHeight;
                this.persistWidth = persistWidth;
            }
        }
        let state;
        this._register(this.element.onDidWillResize(() => {
            state = new ResizeState(this._persistedSize.restore(), this.element.size);
        }));
        this._register(this.element.onDidResize(e => {
            this._resize(e.dimension.width, e.dimension.height);
            if (state) {
                state.persistHeight = state.persistHeight || !!e.north || !!e.south;
                state.persistWidth = state.persistWidth || !!e.east || !!e.west;
            }
            if (!e.done) {
                return;
            }
            if (state) {
                const { itemHeight, defaultSize } = this._getLayoutInfo();
                const threshold = Math.round(itemHeight / 2);
                let { width, height } = this.element.size;
                if (!state.persistHeight || Math.abs(state.currentSize.height - height) <= threshold) {
                    height = state.persistedSize?.height ?? defaultSize.height;
                }
                if (!state.persistWidth || Math.abs(state.currentSize.width - width) <= threshold) {
                    width = state.persistedSize?.width ?? defaultSize.width;
                }
                this._persistedSize.store(new dom.Dimension(width, height));
            }
            state = undefined;
        }));
        const renderer = new SimpleSuggestWidgetItemRenderer(_getFontInfo);
        this._register(renderer);
        this._listElement = dom.append(this.element.domNode, $('.tree'));
        this._list = this._register(new List('SuggestWidget', this._listElement, {
            getHeight: (_element) => this._getLayoutInfo().itemHeight,
            getTemplateId: (_element) => 'suggestion'
        }, [renderer], {
            alwaysConsumeMouseWheel: true,
            useShadows: false,
            mouseSupport: false,
            multipleSelectionSupport: false,
            accessibilityProvider: {
                getRole: () => 'option',
                getWidgetAriaLabel: () => localize('suggest', "Suggest"),
                getWidgetRole: () => 'listbox',
                getAriaLabel: (item) => {
                    let label = item.completion.label;
                    if (typeof item.completion.label !== 'string') {
                        const { detail, description } = item.completion.label;
                        if (detail && description) {
                            label = localize('label.full', '{0}{1}, {2}', label, detail, description);
                        }
                        else if (detail) {
                            label = localize('label.detail', '{0}{1}', label, detail);
                        }
                        else if (description) {
                            label = localize('label.desc', '{0}, {1}', label, description);
                        }
                    }
                    const { detail } = item.completion;
                    return localize('ariaCurrenttSuggestionReadDetails', '{0}, docs: {1}', label, detail);
                },
            }
        }));
        if (options.statusBarMenuId) {
            this._status = this._register(instantiationService.createInstance(SuggestWidgetStatus, this.element.domNode, options.statusBarMenuId));
            this.element.domNode.classList.toggle('with-status-bar', true);
        }
        this._register(this._list.onMouseDown(e => this._onListMouseDownOrTap(e)));
        this._register(this._list.onTap(e => this._onListMouseDownOrTap(e)));
        this._register(this._list.onDidChangeSelection(e => this._onListSelection(e)));
    }
    setCompletionModel(completionModel) {
        this._completionModel = completionModel;
    }
    hasCompletions() {
        return this._completionModel?.items.length !== 0;
    }
    showSuggestions(selectionIndex, isFrozen, isAuto, cursorPosition) {
        this._cursorPosition = cursorPosition;
        if (isFrozen && this._state !== 2 && this._state !== 0) {
            this._setState(4);
            return;
        }
        const visibleCount = this._completionModel?.items.length ?? 0;
        const isEmpty = visibleCount === 0;
        if (isEmpty) {
            this._setState(isAuto ? 0 : 2);
            this._completionModel = undefined;
            return;
        }
        try {
            this._list.splice(0, this._list.length, this._completionModel?.items ?? []);
            this._setState(isFrozen ? 4 : 3);
            this._list.reveal(selectionIndex, 0);
            this._list.setFocus([selectionIndex]);
        }
        finally {
        }
        this._pendingLayout.value = dom.runAtThisOrScheduleAtNextAnimationFrame(dom.getWindow(this.element.domNode), () => {
            this._pendingLayout.clear();
            this._layout(this.element.size);
        });
    }
    setLineContext(lineContext) {
        if (this._completionModel) {
            this._completionModel.lineContext = lineContext;
        }
    }
    _setState(state) {
        if (this._state === state) {
            return;
        }
        this._state = state;
        this.element.domNode.classList.toggle('frozen', state === 4);
        this.element.domNode.classList.remove('message');
        switch (state) {
            case 0:
                dom.hide(this._listElement);
                if (this._status) {
                    dom.hide(this._status?.element);
                }
                this._status?.hide();
                this._showTimeout.cancel();
                this.element.domNode.classList.remove('visible');
                this._list.splice(0, this._list.length);
                this._cappedHeight = undefined;
                break;
            case 1:
                this.element.domNode.classList.add('message');
                dom.hide(this._listElement);
                if (this._status) {
                    dom.hide(this._status?.element);
                }
                this._show();
                break;
            case 2:
                this.element.domNode.classList.add('message');
                dom.hide(this._listElement);
                if (this._status) {
                    dom.hide(this._status?.element);
                }
                this._show();
                break;
            case 3:
                dom.show(this._listElement);
                if (this._status) {
                    dom.show(this._status?.element);
                }
                this._show();
                break;
            case 4:
                dom.show(this._listElement);
                if (this._status) {
                    dom.show(this._status?.element);
                }
                this._show();
                break;
            case 5:
                dom.show(this._listElement);
                if (this._status) {
                    dom.show(this._status?.element);
                }
                this._show();
                break;
        }
    }
    _show() {
        this._status?.show();
        dom.show(this.element.domNode);
        this._layout(this._persistedSize.restore());
        this._showTimeout.cancelAndSet(() => {
            this.element.domNode.classList.add('visible');
            this._onDidShow.fire(this);
        }, 100);
    }
    hide() {
        this._pendingLayout.clear();
        this._setState(0);
        this._onDidHide.fire(this);
        dom.hide(this.element.domNode);
        this.element.clearSashHoverState();
        const dim = this._persistedSize.restore();
        const minPersistedHeight = Math.ceil(this._getLayoutInfo().itemHeight * 4.3);
        if (dim && dim.height < minPersistedHeight) {
            this._persistedSize.store(dim.with(undefined, minPersistedHeight));
        }
    }
    _layout(size) {
        if (!this._cursorPosition) {
            return;
        }
        const bodyBox = dom.getClientArea(this._container.ownerDocument.body);
        const info = this._getLayoutInfo();
        if (!size) {
            size = info.defaultSize;
        }
        let height = size.height;
        let width = size.width;
        if (this._status) {
            this._status.element.style.lineHeight = `${info.itemHeight}px`;
        }
        const maxWidth = bodyBox.width - info.borderHeight - 2 * info.horizontalPadding;
        if (width > maxWidth) {
            width = maxWidth;
        }
        const preferredWidth = this._completionModel ? this._completionModel.stats.pLabelLen * info.typicalHalfwidthCharacterWidth : width;
        const fullHeight = info.statusBarHeight + this._list.contentHeight + info.borderHeight;
        const minHeight = info.itemHeight + info.statusBarHeight;
        const editorBox = dom.getDomNodePagePosition(this._container);
        const cursorBox = this._cursorPosition;
        const cursorBottom = editorBox.top + cursorBox.top + cursorBox.height;
        const maxHeightBelow = Math.min(bodyBox.height - cursorBottom - info.verticalPadding, fullHeight);
        const availableSpaceAbove = editorBox.top + cursorBox.top - info.verticalPadding;
        const maxHeightAbove = Math.min(availableSpaceAbove, fullHeight);
        let maxHeight = Math.min(Math.max(maxHeightAbove, maxHeightBelow) + info.borderHeight, fullHeight);
        if (height === this._cappedHeight?.capped) {
            height = this._cappedHeight.wanted;
        }
        if (height < minHeight) {
            height = minHeight;
        }
        if (height > maxHeight) {
            height = maxHeight;
        }
        const forceRenderingAboveRequiredSpace = 150;
        if (height > maxHeightBelow || (this._forceRenderingAbove && availableSpaceAbove > forceRenderingAboveRequiredSpace)) {
            this._preference = 0;
            this.element.enableSashes(true, true, false, false);
            maxHeight = maxHeightAbove;
        }
        else {
            this._preference = 1;
            this.element.enableSashes(false, true, true, false);
            maxHeight = maxHeightBelow;
        }
        this.element.preferredSize = new dom.Dimension(preferredWidth, info.defaultSize.height);
        this.element.maxSize = new dom.Dimension(maxWidth, maxHeight);
        this.element.minSize = new dom.Dimension(220, minHeight);
        this._cappedHeight = height === fullHeight
            ? { wanted: this._cappedHeight?.wanted ?? size.height, capped: height }
            : undefined;
        this.element.domNode.style.left = `${this._cursorPosition.left}px`;
        if (this._preference === 0) {
            this.element.domNode.style.top = `${this._cursorPosition.top - height - info.borderHeight}px`;
        }
        else {
            this.element.domNode.style.top = `${this._cursorPosition.top + this._cursorPosition.height}px`;
        }
        this._resize(width, height);
    }
    _resize(width, height) {
        const { width: maxWidth, height: maxHeight } = this.element.maxSize;
        width = Math.min(maxWidth, width);
        if (maxHeight) {
            height = Math.min(maxHeight, height);
        }
        const { statusBarHeight } = this._getLayoutInfo();
        this._list.layout(height - statusBarHeight, width);
        this._listElement.style.height = `${height - statusBarHeight}px`;
        this._listElement.style.width = `${width}px`;
        this._listElement.style.height = `${height}px`;
        this.element.layout(height, width);
    }
    _getLayoutInfo() {
        const fontInfo = this._getFontInfo();
        const itemHeight = clamp(Math.ceil(fontInfo.lineHeight), 8, 1000);
        const statusBarHeight = 0;
        const borderWidth = 1;
        const borderHeight = 2 * borderWidth;
        return {
            itemHeight,
            statusBarHeight,
            borderWidth,
            borderHeight,
            typicalHalfwidthCharacterWidth: 10,
            verticalPadding: 22,
            horizontalPadding: 14,
            defaultSize: new dom.Dimension(430, statusBarHeight + 12 * itemHeight + borderHeight)
        };
    }
    _onListMouseDownOrTap(e) {
        if (typeof e.element === 'undefined' || typeof e.index === 'undefined') {
            return;
        }
        e.browserEvent.preventDefault();
        e.browserEvent.stopPropagation();
        this._select(e.element, e.index);
    }
    _onListSelection(e) {
        if (e.elements.length) {
            this._select(e.elements[0], e.indexes[0]);
        }
    }
    _select(item, index) {
        const completionModel = this._completionModel;
        if (completionModel) {
            this._onDidSelect.fire({ item, index, model: completionModel });
        }
    }
    selectNext() {
        this._list.focusNext(1, true);
        const focus = this._list.getFocus();
        if (focus.length > 0) {
            this._list.reveal(focus[0]);
        }
        return true;
    }
    selectNextPage() {
        this._list.focusNextPage();
        const focus = this._list.getFocus();
        if (focus.length > 0) {
            this._list.reveal(focus[0]);
        }
        return true;
    }
    selectPrevious() {
        this._list.focusPrevious(1, true);
        const focus = this._list.getFocus();
        if (focus.length > 0) {
            this._list.reveal(focus[0]);
        }
        return true;
    }
    selectPreviousPage() {
        this._list.focusPreviousPage();
        const focus = this._list.getFocus();
        if (focus.length > 0) {
            this._list.reveal(focus[0]);
        }
        return true;
    }
    getFocusedItem() {
        if (this._completionModel) {
            return {
                item: this._list.getFocusedElements()[0],
                index: this._list.getFocus()[0],
                model: this._completionModel
            };
        }
        return undefined;
    }
    forceRenderingAbove() {
        if (!this._forceRenderingAbove) {
            this._forceRenderingAbove = true;
            this._layout(this._persistedSize.restore());
        }
    }
    stopForceRenderingAbove() {
        this._forceRenderingAbove = false;
    }
};
SimpleSuggestWidget = __decorate([
    __param(4, IInstantiationService),
    __metadata("design:paramtypes", [HTMLElement, Object, Function, Object, Object])
], SimpleSuggestWidget);
export { SimpleSuggestWidget };
