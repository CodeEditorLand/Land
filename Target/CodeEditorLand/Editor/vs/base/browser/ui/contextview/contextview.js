import { BrowserFeatures } from '../../canIUse.js';
import * as DOM from '../../dom.js';
import { Disposable, DisposableStore, toDisposable } from '../../../common/lifecycle.js';
import * as platform from '../../../common/platform.js';
import { Range } from '../../../common/range.js';
import './contextview.css';
export function isAnchor(obj) {
    const anchor = obj;
    return !!anchor && typeof anchor.x === 'number' && typeof anchor.y === 'number';
}
export var LayoutAnchorMode;
(function (LayoutAnchorMode) {
    LayoutAnchorMode[LayoutAnchorMode["AVOID"] = 0] = "AVOID";
    LayoutAnchorMode[LayoutAnchorMode["ALIGN"] = 1] = "ALIGN";
})(LayoutAnchorMode || (LayoutAnchorMode = {}));
export function layout(viewportSize, viewSize, anchor) {
    const layoutAfterAnchorBoundary = anchor.mode === LayoutAnchorMode.ALIGN ? anchor.offset : anchor.offset + anchor.size;
    const layoutBeforeAnchorBoundary = anchor.mode === LayoutAnchorMode.ALIGN ? anchor.offset + anchor.size : anchor.offset;
    if (anchor.position === 0) {
        if (viewSize <= viewportSize - layoutAfterAnchorBoundary) {
            return layoutAfterAnchorBoundary;
        }
        if (viewSize <= layoutBeforeAnchorBoundary) {
            return layoutBeforeAnchorBoundary - viewSize;
        }
        return Math.max(viewportSize - viewSize, 0);
    }
    else {
        if (viewSize <= layoutBeforeAnchorBoundary) {
            return layoutBeforeAnchorBoundary - viewSize;
        }
        if (viewSize <= viewportSize - layoutAfterAnchorBoundary) {
            return layoutAfterAnchorBoundary;
        }
        return 0;
    }
}
export class ContextView extends Disposable {
    static { this.BUBBLE_UP_EVENTS = ['click', 'keydown', 'focus', 'blur']; }
    static { this.BUBBLE_DOWN_EVENTS = ['click']; }
    constructor(container, domPosition) {
        super();
        this.container = null;
        this.useFixedPosition = false;
        this.useShadowDOM = false;
        this.delegate = null;
        this.toDisposeOnClean = Disposable.None;
        this.toDisposeOnSetContainer = Disposable.None;
        this.shadowRoot = null;
        this.shadowRootHostElement = null;
        this.view = DOM.$('.context-view');
        DOM.hide(this.view);
        this.setContainer(container, domPosition);
        this._register(toDisposable(() => this.setContainer(null, 1)));
    }
    setContainer(container, domPosition) {
        this.useFixedPosition = domPosition !== 1;
        const usedShadowDOM = this.useShadowDOM;
        this.useShadowDOM = domPosition === 3;
        if (container === this.container && usedShadowDOM === this.useShadowDOM) {
            return;
        }
        if (this.container) {
            this.toDisposeOnSetContainer.dispose();
            this.view.remove();
            if (this.shadowRoot) {
                this.shadowRoot = null;
                this.shadowRootHostElement?.remove();
                this.shadowRootHostElement = null;
            }
            this.container = null;
        }
        if (container) {
            this.container = container;
            if (this.useShadowDOM) {
                this.shadowRootHostElement = DOM.$('.shadow-root-host');
                this.container.appendChild(this.shadowRootHostElement);
                this.shadowRoot = this.shadowRootHostElement.attachShadow({ mode: 'open' });
                const style = document.createElement('style');
                style.textContent = SHADOW_ROOT_CSS;
                this.shadowRoot.appendChild(style);
                this.shadowRoot.appendChild(this.view);
                this.shadowRoot.appendChild(DOM.$('slot'));
            }
            else {
                this.container.appendChild(this.view);
            }
            const toDisposeOnSetContainer = new DisposableStore();
            ContextView.BUBBLE_UP_EVENTS.forEach(event => {
                toDisposeOnSetContainer.add(DOM.addStandardDisposableListener(this.container, event, e => {
                    this.onDOMEvent(e, false);
                }));
            });
            ContextView.BUBBLE_DOWN_EVENTS.forEach(event => {
                toDisposeOnSetContainer.add(DOM.addStandardDisposableListener(this.container, event, e => {
                    this.onDOMEvent(e, true);
                }, true));
            });
            this.toDisposeOnSetContainer = toDisposeOnSetContainer;
        }
    }
    show(delegate) {
        if (this.isVisible()) {
            this.hide();
        }
        DOM.clearNode(this.view);
        this.view.className = 'context-view monaco-component';
        this.view.style.top = '0px';
        this.view.style.left = '0px';
        this.view.style.zIndex = `${2575 + (delegate.layer ?? 0)}`;
        this.view.style.position = this.useFixedPosition ? 'fixed' : 'absolute';
        DOM.show(this.view);
        this.toDisposeOnClean = delegate.render(this.view) || Disposable.None;
        this.delegate = delegate;
        this.doLayout();
        this.delegate.focus?.();
    }
    getViewElement() {
        return this.view;
    }
    layout() {
        if (!this.isVisible()) {
            return;
        }
        if (this.delegate.canRelayout === false && !(platform.isIOS && BrowserFeatures.pointerEvents)) {
            this.hide();
            return;
        }
        this.delegate?.layout?.();
        this.doLayout();
    }
    doLayout() {
        if (!this.isVisible()) {
            return;
        }
        const anchor = this.delegate.getAnchor();
        let around;
        if (DOM.isHTMLElement(anchor)) {
            const elementPosition = DOM.getDomNodePagePosition(anchor);
            const zoom = DOM.getDomNodeZoomLevel(anchor);
            around = {
                top: elementPosition.top * zoom,
                left: elementPosition.left * zoom,
                width: elementPosition.width * zoom,
                height: elementPosition.height * zoom
            };
        }
        else if (isAnchor(anchor)) {
            around = {
                top: anchor.y,
                left: anchor.x,
                width: anchor.width || 1,
                height: anchor.height || 2
            };
        }
        else {
            around = {
                top: anchor.posy,
                left: anchor.posx,
                width: 2,
                height: 2
            };
        }
        const viewSizeWidth = DOM.getTotalWidth(this.view);
        const viewSizeHeight = DOM.getTotalHeight(this.view);
        const anchorPosition = this.delegate.anchorPosition || 0;
        const anchorAlignment = this.delegate.anchorAlignment || 0;
        const anchorAxisAlignment = this.delegate.anchorAxisAlignment || 0;
        let top;
        let left;
        const activeWindow = DOM.getActiveWindow();
        if (anchorAxisAlignment === 0) {
            const verticalAnchor = { offset: around.top - activeWindow.pageYOffset, size: around.height, position: anchorPosition === 0 ? 0 : 1 };
            const horizontalAnchor = { offset: around.left, size: around.width, position: anchorAlignment === 0 ? 0 : 1, mode: LayoutAnchorMode.ALIGN };
            top = layout(activeWindow.innerHeight, viewSizeHeight, verticalAnchor) + activeWindow.pageYOffset;
            if (Range.intersects({ start: top, end: top + viewSizeHeight }, { start: verticalAnchor.offset, end: verticalAnchor.offset + verticalAnchor.size })) {
                horizontalAnchor.mode = LayoutAnchorMode.AVOID;
            }
            left = layout(activeWindow.innerWidth, viewSizeWidth, horizontalAnchor);
        }
        else {
            const horizontalAnchor = { offset: around.left, size: around.width, position: anchorAlignment === 0 ? 0 : 1 };
            const verticalAnchor = { offset: around.top, size: around.height, position: anchorPosition === 0 ? 0 : 1, mode: LayoutAnchorMode.ALIGN };
            left = layout(activeWindow.innerWidth, viewSizeWidth, horizontalAnchor);
            if (Range.intersects({ start: left, end: left + viewSizeWidth }, { start: horizontalAnchor.offset, end: horizontalAnchor.offset + horizontalAnchor.size })) {
                verticalAnchor.mode = LayoutAnchorMode.AVOID;
            }
            top = layout(activeWindow.innerHeight, viewSizeHeight, verticalAnchor) + activeWindow.pageYOffset;
        }
        this.view.classList.remove('top', 'bottom', 'left', 'right');
        this.view.classList.add(anchorPosition === 0 ? 'bottom' : 'top');
        this.view.classList.add(anchorAlignment === 0 ? 'left' : 'right');
        this.view.classList.toggle('fixed', this.useFixedPosition);
        const containerPosition = DOM.getDomNodePagePosition(this.container);
        this.view.style.top = `${top - (this.useFixedPosition ? DOM.getDomNodePagePosition(this.view).top : containerPosition.top)}px`;
        this.view.style.left = `${left - (this.useFixedPosition ? DOM.getDomNodePagePosition(this.view).left : containerPosition.left)}px`;
        this.view.style.width = 'initial';
    }
    hide(data) {
        const delegate = this.delegate;
        this.delegate = null;
        if (delegate?.onHide) {
            delegate.onHide(data);
        }
        this.toDisposeOnClean.dispose();
        DOM.hide(this.view);
    }
    isVisible() {
        return !!this.delegate;
    }
    onDOMEvent(e, onCapture) {
        if (this.delegate) {
            if (this.delegate.onDOMEvent) {
                this.delegate.onDOMEvent(e, DOM.getWindow(e).document.activeElement);
            }
            else if (onCapture && !DOM.isAncestor(e.target, this.container)) {
                this.hide();
            }
        }
    }
    dispose() {
        this.hide();
        super.dispose();
    }
}
const SHADOW_ROOT_CSS = `
	:host {
		all: initial; /* 1st rule so subsequent properties are reset. */
	}

	.codicon[class*='codicon-'] {
		font: normal normal normal 16px/1 codicon;
		display: inline-block;
		text-decoration: none;
		text-rendering: auto;
		text-align: center;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
	}

	:host {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "HelveticaNeue-Light", system-ui, "Ubuntu", "Droid Sans", sans-serif;
	}

	:host-context(.mac) { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
	:host-context(.mac:lang(zh-Hans)) { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", sans-serif; }
	:host-context(.mac:lang(zh-Hant)) { font-family: -apple-system, BlinkMacSystemFont, "PingFang TC", sans-serif; }
	:host-context(.mac:lang(ja)) { font-family: -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic Pro", sans-serif; }
	:host-context(.mac:lang(ko)) { font-family: -apple-system, BlinkMacSystemFont, "Nanum Gothic", "Apple SD Gothic Neo", "AppleGothic", sans-serif; }

	:host-context(.windows) { font-family: "Segoe WPC", "Segoe UI", sans-serif; }
	:host-context(.windows:lang(zh-Hans)) { font-family: "Segoe WPC", "Segoe UI", "Microsoft YaHei", sans-serif; }
	:host-context(.windows:lang(zh-Hant)) { font-family: "Segoe WPC", "Segoe UI", "Microsoft Jhenghei", sans-serif; }
	:host-context(.windows:lang(ja)) { font-family: "Segoe WPC", "Segoe UI", "Yu Gothic UI", "Meiryo UI", sans-serif; }
	:host-context(.windows:lang(ko)) { font-family: "Segoe WPC", "Segoe UI", "Malgun Gothic", "Dotom", sans-serif; }

	:host-context(.linux) { font-family: system-ui, "Ubuntu", "Droid Sans", sans-serif; }
	:host-context(.linux:lang(zh-Hans)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans SC", "Source Han Sans CN", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(zh-Hant)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans TC", "Source Han Sans TW", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(ja)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans J", "Source Han Sans JP", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(ko)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans K", "Source Han Sans JR", "Source Han Sans", "UnDotum", "FBaekmuk Gulim", sans-serif; }
`;
