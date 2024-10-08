/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import './media/part.css';
import { Component } from '../common/component.js';
import { Dimension, size, getActiveDocument, prepend } from '../../base/browser/dom.js';
import { Emitter } from '../../base/common/event.js';
import { assertIsDefined } from '../../base/common/types.js';
import { toDisposable } from '../../base/common/lifecycle.js';
/**
 * Parts are layed out in the workbench and have their own layout that
 * arranges an optional title and mandatory content area to show content.
 */
export class Part extends Component {
    get dimension() { return this._dimension; }
    get contentPosition() { return this._contentPosition; }
    constructor(id, options, themeService, storageService, layoutService) {
        super(id, themeService, storageService);
        this.options = options;
        this.layoutService = layoutService;
        this._onDidVisibilityChange = this._register(new Emitter());
        this.onDidVisibilityChange = this._onDidVisibilityChange.event;
        //#region ISerializableView
        this._onDidChange = this._register(new Emitter());
        this._register(layoutService.registerPart(this));
    }
    onThemeChange(theme) {
        // only call if our create() method has been called
        if (this.parent) {
            super.onThemeChange(theme);
        }
    }
    /**
     * Note: Clients should not call this method, the workbench calls this
     * method. Calling it otherwise may result in unexpected behavior.
     *
     * Called to create title and content area of the part.
     */
    create(parent, options) {
        this.parent = parent;
        this.titleArea = this.createTitleArea(parent, options);
        this.contentArea = this.createContentArea(parent, options);
        this.partLayout = new PartLayout(this.options, this.contentArea);
        this.updateStyles();
    }
    /**
     * Returns the overall part container.
     */
    getContainer() {
        return this.parent;
    }
    /**
     * Subclasses override to provide a title area implementation.
     */
    createTitleArea(parent, options) {
        return undefined;
    }
    /**
     * Returns the title area container.
     */
    getTitleArea() {
        return this.titleArea;
    }
    /**
     * Subclasses override to provide a content area implementation.
     */
    createContentArea(parent, options) {
        return undefined;
    }
    /**
     * Returns the content area container.
     */
    getContentArea() {
        return this.contentArea;
    }
    /**
     * Sets the header area
     */
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
    /**
     * Sets the footer area
     */
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
    /**
     * removes the header area
     */
    removeHeaderArea() {
        if (this.headerArea) {
            this.headerArea.remove();
            this.headerArea = undefined;
            this.partLayout?.setHeaderVisibility(false);
            this.relayout();
        }
    }
    /**
     * removes the footer area
     */
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
    /**
     * Layout title and content area in the given dimension.
     */
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
        // Title Size: Width (Fill), Height (Variable)
        let titleSize;
        if (this.options.hasTitle) {
            titleSize = new Dimension(width, Math.min(height, PartLayout.TITLE_HEIGHT));
        }
        else {
            titleSize = Dimension.None;
        }
        // Header Size: Width (Fill), Height (Variable)
        let headerSize;
        if (this.headerVisible) {
            headerSize = new Dimension(width, Math.min(height, PartLayout.HEADER_HEIGHT));
        }
        else {
            headerSize = Dimension.None;
        }
        // Footer Size: Width (Fill), Height (Variable)
        let footerSize;
        if (this.footerVisible) {
            footerSize = new Dimension(width, Math.min(height, PartLayout.Footer_HEIGHT));
        }
        else {
            footerSize = Dimension.None;
        }
        let contentWidth = width;
        if (this.options && typeof this.options.borderWidth === 'function') {
            contentWidth -= this.options.borderWidth(); // adjust for border size
        }
        // Content Size: Width (Fill), Height (Variable)
        const contentSize = new Dimension(contentWidth, height - titleSize.height - headerSize.height - footerSize.height);
        // Content
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
