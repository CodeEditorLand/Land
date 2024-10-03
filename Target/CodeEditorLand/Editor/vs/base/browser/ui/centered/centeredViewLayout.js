import { $ } from '../../dom.js';
import { SplitView } from '../splitview/splitview.js';
import { Event } from '../../../common/event.js';
import { DisposableStore } from '../../../common/lifecycle.js';
const defaultState = {
    targetWidth: 900,
    leftMarginRatio: 0.1909,
    rightMarginRatio: 0.1909,
};
const distributeSizing = { type: 'distribute' };
function createEmptyView(background) {
    const element = $('.centered-layout-margin');
    element.style.height = '100%';
    if (background) {
        element.style.backgroundColor = background.toString();
    }
    return {
        element,
        layout: () => undefined,
        minimumSize: 60,
        maximumSize: Number.POSITIVE_INFINITY,
        onDidChange: Event.None
    };
}
function toSplitViewView(view, getHeight) {
    return {
        element: view.element,
        get maximumSize() { return view.maximumWidth; },
        get minimumSize() { return view.minimumWidth; },
        onDidChange: Event.map(view.onDidChange, e => e && e.width),
        layout: (size, offset, ctx) => view.layout(size, getHeight(), ctx?.top ?? 0, (ctx?.left ?? 0) + offset)
    };
}
export class CenteredViewLayout {
    constructor(container, view, state = { ...defaultState }, centeredLayoutFixedWidth = false) {
        this.container = container;
        this.view = view;
        this.state = state;
        this.centeredLayoutFixedWidth = centeredLayoutFixedWidth;
        this.lastLayoutPosition = { width: 0, height: 0, left: 0, top: 0 };
        this.didLayout = false;
        this.splitViewDisposables = new DisposableStore();
        this._boundarySashes = {};
        this.container.appendChild(this.view.element);
        this.container.style.overflow = 'hidden';
    }
    get minimumWidth() { return this.splitView ? this.splitView.minimumSize : this.view.minimumWidth; }
    get maximumWidth() { return this.splitView ? this.splitView.maximumSize : this.view.maximumWidth; }
    get minimumHeight() { return this.view.minimumHeight; }
    get maximumHeight() { return this.view.maximumHeight; }
    get onDidChange() { return this.view.onDidChange; }
    get boundarySashes() { return this._boundarySashes; }
    set boundarySashes(boundarySashes) {
        this._boundarySashes = boundarySashes;
        if (!this.splitView) {
            return;
        }
        this.splitView.orthogonalStartSash = boundarySashes.top;
        this.splitView.orthogonalEndSash = boundarySashes.bottom;
    }
    layout(width, height, top, left) {
        this.lastLayoutPosition = { width, height, top, left };
        if (this.splitView) {
            this.splitView.layout(width, this.lastLayoutPosition);
            if (!this.didLayout || this.centeredLayoutFixedWidth) {
                this.resizeSplitViews();
            }
        }
        else {
            this.view.layout(width, height, top, left);
        }
        this.didLayout = true;
    }
    resizeSplitViews() {
        if (!this.splitView) {
            return;
        }
        if (this.centeredLayoutFixedWidth) {
            const centerViewWidth = Math.min(this.lastLayoutPosition.width, this.state.targetWidth);
            const marginWidthFloat = (this.lastLayoutPosition.width - centerViewWidth) / 2;
            this.splitView.resizeView(0, Math.floor(marginWidthFloat));
            this.splitView.resizeView(1, centerViewWidth);
            this.splitView.resizeView(2, Math.ceil(marginWidthFloat));
        }
        else {
            const leftMargin = this.state.leftMarginRatio * this.lastLayoutPosition.width;
            const rightMargin = this.state.rightMarginRatio * this.lastLayoutPosition.width;
            const center = this.lastLayoutPosition.width - leftMargin - rightMargin;
            this.splitView.resizeView(0, leftMargin);
            this.splitView.resizeView(1, center);
            this.splitView.resizeView(2, rightMargin);
        }
    }
    setFixedWidth(option) {
        this.centeredLayoutFixedWidth = option;
        if (!!this.splitView) {
            this.updateState();
            this.resizeSplitViews();
        }
    }
    updateState() {
        if (!!this.splitView) {
            this.state.targetWidth = this.splitView.getViewSize(1);
            this.state.leftMarginRatio = this.splitView.getViewSize(0) / this.lastLayoutPosition.width;
            this.state.rightMarginRatio = this.splitView.getViewSize(2) / this.lastLayoutPosition.width;
        }
    }
    isActive() {
        return !!this.splitView;
    }
    styles(style) {
        this.style = style;
        if (this.splitView && this.emptyViews) {
            this.splitView.style(this.style);
            this.emptyViews[0].element.style.backgroundColor = this.style.background.toString();
            this.emptyViews[1].element.style.backgroundColor = this.style.background.toString();
        }
    }
    activate(active) {
        if (active === this.isActive()) {
            return;
        }
        if (active) {
            this.view.element.remove();
            this.splitView = new SplitView(this.container, {
                inverseAltBehavior: true,
                orientation: 1,
                styles: this.style
            });
            this.splitView.orthogonalStartSash = this.boundarySashes.top;
            this.splitView.orthogonalEndSash = this.boundarySashes.bottom;
            this.splitViewDisposables.add(this.splitView.onDidSashChange(() => {
                if (!!this.splitView) {
                    this.updateState();
                }
            }));
            this.splitViewDisposables.add(this.splitView.onDidSashReset(() => {
                this.state = { ...defaultState };
                this.resizeSplitViews();
            }));
            this.splitView.layout(this.lastLayoutPosition.width, this.lastLayoutPosition);
            const backgroundColor = this.style ? this.style.background : undefined;
            this.emptyViews = [createEmptyView(backgroundColor), createEmptyView(backgroundColor)];
            this.splitView.addView(this.emptyViews[0], distributeSizing, 0);
            this.splitView.addView(toSplitViewView(this.view, () => this.lastLayoutPosition.height), distributeSizing, 1);
            this.splitView.addView(this.emptyViews[1], distributeSizing, 2);
            this.resizeSplitViews();
        }
        else {
            this.splitView?.el.remove();
            this.splitViewDisposables.clear();
            this.splitView?.dispose();
            this.splitView = undefined;
            this.emptyViews = undefined;
            this.container.appendChild(this.view.element);
            this.view.layout(this.lastLayoutPosition.width, this.lastLayoutPosition.height, this.lastLayoutPosition.top, this.lastLayoutPosition.left);
        }
    }
    isDefault(state) {
        if (this.centeredLayoutFixedWidth) {
            return state.targetWidth === defaultState.targetWidth;
        }
        else {
            return state.leftMarginRatio === defaultState.leftMarginRatio
                && state.rightMarginRatio === defaultState.rightMarginRatio;
        }
    }
    dispose() {
        this.splitViewDisposables.dispose();
        if (this.splitView) {
            this.splitView.dispose();
            this.splitView = undefined;
        }
    }
}
