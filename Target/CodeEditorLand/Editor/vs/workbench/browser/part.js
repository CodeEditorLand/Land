import './media/part.css';
import { Component } from '../common/component.js';
import { Dimension, size, getActiveDocument, prepend } from '../../base/browser/dom.js';
import { Emitter } from '../../base/common/event.js';
import { assertIsDefined } from '../../base/common/types.js';
import { toDisposable } from '../../base/common/lifecycle.js';
export class Part extends Component {
    get dimension() { return this._dimension; }
    get contentPosition() { return this._contentPosition; }
    constructor(id, options, themeService, storageService, layoutService) {
        super(id, themeService, storageService);
        this.options = options;
        this.layoutService = layoutService;
        this._onDidVisibilityChange = this._register(new Emitter());
        this.onDidVisibilityChange = this._onDidVisibilityChange.event;
        this._onDidChange = this._register(new Emitter());
        this._register(layoutService.registerPart(this));
    }
    onThemeChange(theme) {
        if (this.parent) {
            super.onThemeChange(theme);
        }
    }
    create(parent, options) {
        this.parent = parent;
        this.titleArea = this.createTitleArea(parent, options);
        this.contentArea = this.createContentArea(parent, options);
        this.partLayout = new PartLayout(this.options, this.contentArea);
        this.updateStyles();
    }
    getContainer() {
        return this.parent;
    }
    createTitleArea(parent, options) {
        return undefined;
    }
    getTitleArea() {
        return this.titleArea;
    }
    createContentArea(parent, options) {
        return undefined;
    }
    getContentArea() {
        return this.contentArea;
    }
    setHeaderArea(headerContainer) {
        if (this.headerArea) {
            throw new Error('Header already exists');
        }
        if (!this.parent || !this.titleArea) {
            return;
        }
        prepend(this.parent, headerContainer);
        headerContainer.classList.add('header-or-footer');
        headerContainer.classList.add('header');
        this.headerArea = headerContainer;
        this.partLayout?.setHeaderVisibility(true);
        this.relayout();
    }
    setFooterArea(footerContainer) {
        if (this.footerArea) {
            throw new Error('Footer already exists');
        }
        if (!this.parent || !this.titleArea) {
            return;
        }
        this.parent.appendChild(footerContainer);
        footerContainer.classList.add('header-or-footer');
        footerContainer.classList.add('footer');
        this.footerArea = footerContainer;
        this.partLayout?.setFooterVisibility(true);
        this.relayout();
    }
    removeHeaderArea() {
        if (this.headerArea) {
            this.headerArea.remove();
            this.headerArea = undefined;
            this.partLayout?.setHeaderVisibility(false);
            this.relayout();
        }
    }
    removeFooterArea() {
        if (this.footerArea) {
            this.footerArea.remove();
            this.footerArea = undefined;
            this.partLayout?.setFooterVisibility(false);
            this.relayout();
        }
    }
    relayout() {
        if (this.dimension && this.contentPosition) {
            this.layout(this.dimension.width, this.dimension.height, this.contentPosition.top, this.contentPosition.left);
        }
    }
    layoutContents(width, height) {
        const partLayout = assertIsDefined(this.partLayout);
        return partLayout.layout(width, height);
    }
    get onDidChange() { return this._onDidChange.event; }
    layout(width, height, top, left) {
        this._dimension = new Dimension(width, height);
        this._contentPosition = { top, left };
    }
    setVisible(visible) {
        this._onDidVisibilityChange.fire(visible);
    }
}
class PartLayout {
    static { this.HEADER_HEIGHT = 35; }
    static { this.TITLE_HEIGHT = 35; }
    static { this.Footer_HEIGHT = 35; }
    constructor(options, contentArea) {
        this.options = options;
        this.contentArea = contentArea;
        this.headerVisible = false;
        this.footerVisible = false;
    }
    layout(width, height) {
        let titleSize;
        if (this.options.hasTitle) {
            titleSize = new Dimension(width, Math.min(height, PartLayout.TITLE_HEIGHT));
        }
        else {
            titleSize = Dimension.None;
        }
        let headerSize;
        if (this.headerVisible) {
            headerSize = new Dimension(width, Math.min(height, PartLayout.HEADER_HEIGHT));
        }
        else {
            headerSize = Dimension.None;
        }
        let footerSize;
        if (this.footerVisible) {
            footerSize = new Dimension(width, Math.min(height, PartLayout.Footer_HEIGHT));
        }
        else {
            footerSize = Dimension.None;
        }
        let contentWidth = width;
        if (this.options && typeof this.options.borderWidth === 'function') {
            contentWidth -= this.options.borderWidth();
        }
        const contentSize = new Dimension(contentWidth, height - titleSize.height - headerSize.height - footerSize.height);
        if (this.contentArea) {
            size(this.contentArea, contentSize.width, contentSize.height);
        }
        return { headerSize, titleSize, contentSize, footerSize };
    }
    setFooterVisibility(visible) {
        this.footerVisible = visible;
    }
    setHeaderVisibility(visible) {
        this.headerVisible = visible;
    }
}
export class MultiWindowParts extends Component {
    constructor() {
        super(...arguments);
        this._parts = new Set();
    }
    get parts() { return Array.from(this._parts); }
    registerPart(part) {
        this._parts.add(part);
        return toDisposable(() => this.unregisterPart(part));
    }
    unregisterPart(part) {
        this._parts.delete(part);
    }
    getPart(container) {
        return this.getPartByDocument(container.ownerDocument);
    }
    getPartByDocument(document) {
        if (this._parts.size > 1) {
            for (const part of this._parts) {
                if (part.element?.ownerDocument === document) {
                    return part;
                }
            }
        }
        return this.mainPart;
    }
    get activePart() {
        return this.getPartByDocument(getActiveDocument());
    }
}
