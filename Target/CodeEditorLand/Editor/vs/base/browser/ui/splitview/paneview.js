import { isFirefox } from '../../browser.js';
import { DataTransfers } from '../../dnd.js';
import { $, addDisposableListener, append, clearNode, EventHelper, EventType, getWindow, isHTMLElement, trackFocus } from '../../dom.js';
import { DomEmitter } from '../../event.js';
import { StandardKeyboardEvent } from '../../keyboardEvent.js';
import { Gesture, EventType as TouchEventType } from '../../touch.js';
import { Color, RGBA } from '../../../common/color.js';
import { Emitter, Event } from '../../../common/event.js';
import { Disposable, DisposableStore } from '../../../common/lifecycle.js';
import './paneview.css';
import { localize } from '../../../../nls.js';
import { Sizing, SplitView } from './splitview.js';
export class Pane extends Disposable {
    static { this.HEADER_SIZE = 22; }
    get ariaHeaderLabel() {
        return this._ariaHeaderLabel;
    }
    set ariaHeaderLabel(newLabel) {
        this._ariaHeaderLabel = newLabel;
        this.header.setAttribute('aria-label', this.ariaHeaderLabel);
    }
    get draggableElement() {
        return this.header;
    }
    get dropTargetElement() {
        return this.element;
    }
    get dropBackground() {
        return this.styles.dropBackground;
    }
    get minimumBodySize() {
        return this._minimumBodySize;
    }
    set minimumBodySize(size) {
        this._minimumBodySize = size;
        this._onDidChange.fire(undefined);
    }
    get maximumBodySize() {
        return this._maximumBodySize;
    }
    set maximumBodySize(size) {
        this._maximumBodySize = size;
        this._onDidChange.fire(undefined);
    }
    get headerSize() {
        return this.headerVisible ? Pane.HEADER_SIZE : 0;
    }
    get minimumSize() {
        const headerSize = this.headerSize;
        const expanded = !this.headerVisible || this.isExpanded();
        const minimumBodySize = expanded ? this.minimumBodySize : 0;
        return headerSize + minimumBodySize;
    }
    get maximumSize() {
        const headerSize = this.headerSize;
        const expanded = !this.headerVisible || this.isExpanded();
        const maximumBodySize = expanded ? this.maximumBodySize : 0;
        return headerSize + maximumBodySize;
    }
    constructor(options) {
        super();
        this.expandedSize = undefined;
        this._headerVisible = true;
        this._collapsible = true;
        this._bodyRendered = false;
        this.styles = {
            dropBackground: undefined,
            headerBackground: undefined,
            headerBorder: undefined,
            headerForeground: undefined,
            leftBorder: undefined
        };
        this.animationTimer = undefined;
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this._onDidChangeExpansionState = this._register(new Emitter());
        this.onDidChangeExpansionState = this._onDidChangeExpansionState.event;
        this.orthogonalSize = 0;
        this._expanded = typeof options.expanded === 'undefined' ? true : !!options.expanded;
        this._orientation = typeof options.orientation === 'undefined' ? 0 : options.orientation;
        this._ariaHeaderLabel = localize('viewSection', "{0} Section", options.title);
        this._minimumBodySize = typeof options.minimumBodySize === 'number' ? options.minimumBodySize : this._orientation === 1 ? 200 : 120;
        this._maximumBodySize = typeof options.maximumBodySize === 'number' ? options.maximumBodySize : Number.POSITIVE_INFINITY;
        this.element = $('.pane');
    }
    isExpanded() {
        return this._expanded;
    }
    setExpanded(expanded) {
        if (!expanded && !this.collapsible) {
            return false;
        }
        if (this._expanded === !!expanded) {
            return false;
        }
        this.element?.classList.toggle('expanded', expanded);
        this._expanded = !!expanded;
        this.updateHeader();
        if (expanded) {
            if (!this._bodyRendered) {
                this.renderBody(this.body);
                this._bodyRendered = true;
            }
            if (typeof this.animationTimer === 'number') {
                getWindow(this.element).clearTimeout(this.animationTimer);
            }
            append(this.element, this.body);
        }
        else {
            this.animationTimer = getWindow(this.element).setTimeout(() => {
                this.body.remove();
            }, 200);
        }
        this._onDidChangeExpansionState.fire(expanded);
        this._onDidChange.fire(expanded ? this.expandedSize : undefined);
        return true;
    }
    get headerVisible() {
        return this._headerVisible;
    }
    set headerVisible(visible) {
        if (this._headerVisible === !!visible) {
            return;
        }
        this._headerVisible = !!visible;
        this.updateHeader();
        this._onDidChange.fire(undefined);
    }
    get collapsible() {
        return this._collapsible;
    }
    set collapsible(collapsible) {
        if (this._collapsible === !!collapsible) {
            return;
        }
        this._collapsible = !!collapsible;
        this.updateHeader();
    }
    get orientation() {
        return this._orientation;
    }
    set orientation(orientation) {
        if (this._orientation === orientation) {
            return;
        }
        this._orientation = orientation;
        if (this.element) {
            this.element.classList.toggle('horizontal', this.orientation === 1);
            this.element.classList.toggle('vertical', this.orientation === 0);
        }
        if (this.header) {
            this.updateHeader();
        }
    }
    render() {
        this.element.classList.toggle('expanded', this.isExpanded());
        this.element.classList.toggle('horizontal', this.orientation === 1);
        this.element.classList.toggle('vertical', this.orientation === 0);
        this.header = $('.pane-header');
        append(this.element, this.header);
        this.header.setAttribute('tabindex', '0');
        this.header.setAttribute('role', 'button');
        this.header.setAttribute('aria-label', this.ariaHeaderLabel);
        this.renderHeader(this.header);
        const focusTracker = trackFocus(this.header);
        this._register(focusTracker);
        this._register(focusTracker.onDidFocus(() => this.header.classList.add('focused'), null));
        this._register(focusTracker.onDidBlur(() => this.header.classList.remove('focused'), null));
        this.updateHeader();
        const eventDisposables = this._register(new DisposableStore());
        const onKeyDown = this._register(new DomEmitter(this.header, 'keydown'));
        const onHeaderKeyDown = Event.map(onKeyDown.event, e => new StandardKeyboardEvent(e), eventDisposables);
        this._register(Event.filter(onHeaderKeyDown, e => e.keyCode === 3 || e.keyCode === 10, eventDisposables)(() => this.setExpanded(!this.isExpanded()), null));
        this._register(Event.filter(onHeaderKeyDown, e => e.keyCode === 15, eventDisposables)(() => this.setExpanded(false), null));
        this._register(Event.filter(onHeaderKeyDown, e => e.keyCode === 17, eventDisposables)(() => this.setExpanded(true), null));
        this._register(Gesture.addTarget(this.header));
        [EventType.CLICK, TouchEventType.Tap].forEach(eventType => {
            this._register(addDisposableListener(this.header, eventType, e => {
                if (!e.defaultPrevented) {
                    this.setExpanded(!this.isExpanded());
                }
            }));
        });
        this.body = append(this.element, $('.pane-body'));
        if (!this._bodyRendered && this.isExpanded()) {
            this.renderBody(this.body);
            this._bodyRendered = true;
        }
        if (!this.isExpanded()) {
            this.body.remove();
        }
    }
    layout(size) {
        const headerSize = this.headerVisible ? Pane.HEADER_SIZE : 0;
        const width = this._orientation === 0 ? this.orthogonalSize : size;
        const height = this._orientation === 0 ? size - headerSize : this.orthogonalSize - headerSize;
        if (this.isExpanded()) {
            this.body.classList.toggle('wide', width >= 600);
            this.layoutBody(height, width);
            this.expandedSize = size;
        }
    }
    style(styles) {
        this.styles = styles;
        if (!this.header) {
            return;
        }
        this.updateHeader();
    }
    updateHeader() {
        const expanded = !this.headerVisible || this.isExpanded();
        if (this.collapsible) {
            this.header.setAttribute('tabindex', '0');
            this.header.setAttribute('role', 'button');
        }
        else {
            this.header.removeAttribute('tabindex');
            this.header.removeAttribute('role');
        }
        this.header.style.lineHeight = `${this.headerSize}px`;
        this.header.classList.toggle('hidden', !this.headerVisible);
        this.header.classList.toggle('expanded', expanded);
        this.header.classList.toggle('not-collapsible', !this.collapsible);
        this.header.setAttribute('aria-expanded', String(expanded));
        this.header.style.color = this.collapsible ? this.styles.headerForeground ?? '' : '';
        this.header.style.backgroundColor = (this.collapsible ? this.styles.headerBackground : 'transparent') ?? '';
        this.header.style.borderTop = this.styles.headerBorder && this.orientation === 0 ? `1px solid ${this.styles.headerBorder}` : '';
        this.element.style.borderLeft = this.styles.leftBorder && this.orientation === 1 ? `1px solid ${this.styles.leftBorder}` : '';
    }
}
class PaneDraggable extends Disposable {
    static { this.DefaultDragOverBackgroundColor = new Color(new RGBA(128, 128, 128, 0.5)); }
    constructor(pane, dnd, context) {
        super();
        this.pane = pane;
        this.dnd = dnd;
        this.context = context;
        this.dragOverCounter = 0;
        this._onDidDrop = this._register(new Emitter());
        this.onDidDrop = this._onDidDrop.event;
        pane.draggableElement.draggable = true;
        this._register(addDisposableListener(pane.draggableElement, 'dragstart', e => this.onDragStart(e)));
        this._register(addDisposableListener(pane.dropTargetElement, 'dragenter', e => this.onDragEnter(e)));
        this._register(addDisposableListener(pane.dropTargetElement, 'dragleave', e => this.onDragLeave(e)));
        this._register(addDisposableListener(pane.dropTargetElement, 'dragend', e => this.onDragEnd(e)));
        this._register(addDisposableListener(pane.dropTargetElement, 'drop', e => this.onDrop(e)));
    }
    onDragStart(e) {
        if (!this.dnd.canDrag(this.pane) || !e.dataTransfer) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        e.dataTransfer.effectAllowed = 'move';
        if (isFirefox) {
            e.dataTransfer?.setData(DataTransfers.TEXT, this.pane.draggableElement.textContent || '');
        }
        const dragImage = append(this.pane.element.ownerDocument.body, $('.monaco-drag-image', {}, this.pane.draggableElement.textContent || ''));
        e.dataTransfer.setDragImage(dragImage, -10, -10);
        setTimeout(() => dragImage.remove(), 0);
        this.context.draggable = this;
    }
    onDragEnter(e) {
        if (!this.context.draggable || this.context.draggable === this) {
            return;
        }
        if (!this.dnd.canDrop(this.context.draggable.pane, this.pane)) {
            return;
        }
        this.dragOverCounter++;
        this.render();
    }
    onDragLeave(e) {
        if (!this.context.draggable || this.context.draggable === this) {
            return;
        }
        if (!this.dnd.canDrop(this.context.draggable.pane, this.pane)) {
            return;
        }
        this.dragOverCounter--;
        if (this.dragOverCounter === 0) {
            this.render();
        }
    }
    onDragEnd(e) {
        if (!this.context.draggable) {
            return;
        }
        this.dragOverCounter = 0;
        this.render();
        this.context.draggable = null;
    }
    onDrop(e) {
        if (!this.context.draggable) {
            return;
        }
        EventHelper.stop(e);
        this.dragOverCounter = 0;
        this.render();
        if (this.dnd.canDrop(this.context.draggable.pane, this.pane) && this.context.draggable !== this) {
            this._onDidDrop.fire({ from: this.context.draggable.pane, to: this.pane });
        }
        this.context.draggable = null;
    }
    render() {
        let backgroundColor = null;
        if (this.dragOverCounter > 0) {
            backgroundColor = this.pane.dropBackground ?? PaneDraggable.DefaultDragOverBackgroundColor.toString();
        }
        this.pane.dropTargetElement.style.backgroundColor = backgroundColor || '';
    }
}
export class DefaultPaneDndController {
    canDrag(pane) {
        return true;
    }
    canDrop(pane, overPane) {
        return true;
    }
}
export class PaneView extends Disposable {
    constructor(container, options = {}) {
        super();
        this.dndContext = { draggable: null };
        this.paneItems = [];
        this.orthogonalSize = 0;
        this.size = 0;
        this.animationTimer = undefined;
        this._onDidDrop = this._register(new Emitter());
        this.onDidDrop = this._onDidDrop.event;
        this.dnd = options.dnd;
        this.orientation = options.orientation ?? 0;
        this.element = append(container, $('.monaco-pane-view'));
        this.splitview = this._register(new SplitView(this.element, { orientation: this.orientation }));
        this.onDidSashReset = this.splitview.onDidSashReset;
        this.onDidSashChange = this.splitview.onDidSashChange;
        this.onDidScroll = this.splitview.onDidScroll;
        const eventDisposables = this._register(new DisposableStore());
        const onKeyDown = this._register(new DomEmitter(this.element, 'keydown'));
        const onHeaderKeyDown = Event.map(Event.filter(onKeyDown.event, e => isHTMLElement(e.target) && e.target.classList.contains('pane-header'), eventDisposables), e => new StandardKeyboardEvent(e), eventDisposables);
        this._register(Event.filter(onHeaderKeyDown, e => e.keyCode === 16, eventDisposables)(() => this.focusPrevious()));
        this._register(Event.filter(onHeaderKeyDown, e => e.keyCode === 18, eventDisposables)(() => this.focusNext()));
    }
    addPane(pane, size, index = this.splitview.length) {
        const disposables = new DisposableStore();
        pane.onDidChangeExpansionState(this.setupAnimation, this, disposables);
        const paneItem = { pane: pane, disposable: disposables };
        this.paneItems.splice(index, 0, paneItem);
        pane.orientation = this.orientation;
        pane.orthogonalSize = this.orthogonalSize;
        this.splitview.addView(pane, size, index);
        if (this.dnd) {
            const draggable = new PaneDraggable(pane, this.dnd, this.dndContext);
            disposables.add(draggable);
            disposables.add(draggable.onDidDrop(this._onDidDrop.fire, this._onDidDrop));
        }
    }
    removePane(pane) {
        const index = this.paneItems.findIndex(item => item.pane === pane);
        if (index === -1) {
            return;
        }
        this.splitview.removeView(index, pane.isExpanded() ? Sizing.Distribute : undefined);
        const paneItem = this.paneItems.splice(index, 1)[0];
        paneItem.disposable.dispose();
    }
    movePane(from, to) {
        const fromIndex = this.paneItems.findIndex(item => item.pane === from);
        const toIndex = this.paneItems.findIndex(item => item.pane === to);
        if (fromIndex === -1 || toIndex === -1) {
            return;
        }
        const [paneItem] = this.paneItems.splice(fromIndex, 1);
        this.paneItems.splice(toIndex, 0, paneItem);
        this.splitview.moveView(fromIndex, toIndex);
    }
    resizePane(pane, size) {
        const index = this.paneItems.findIndex(item => item.pane === pane);
        if (index === -1) {
            return;
        }
        this.splitview.resizeView(index, size);
    }
    getPaneSize(pane) {
        const index = this.paneItems.findIndex(item => item.pane === pane);
        if (index === -1) {
            return -1;
        }
        return this.splitview.getViewSize(index);
    }
    layout(height, width) {
        this.orthogonalSize = this.orientation === 0 ? width : height;
        this.size = this.orientation === 1 ? width : height;
        for (const paneItem of this.paneItems) {
            paneItem.pane.orthogonalSize = this.orthogonalSize;
        }
        this.splitview.layout(this.size);
    }
    setBoundarySashes(sashes) {
        this.boundarySashes = sashes;
        this.updateSplitviewOrthogonalSashes(sashes);
    }
    updateSplitviewOrthogonalSashes(sashes) {
        if (this.orientation === 0) {
            this.splitview.orthogonalStartSash = sashes?.left;
            this.splitview.orthogonalEndSash = sashes?.right;
        }
        else {
            this.splitview.orthogonalEndSash = sashes?.bottom;
        }
    }
    flipOrientation(height, width) {
        this.orientation = this.orientation === 0 ? 1 : 0;
        const paneSizes = this.paneItems.map(pane => this.getPaneSize(pane.pane));
        this.splitview.dispose();
        clearNode(this.element);
        this.splitview = this._register(new SplitView(this.element, { orientation: this.orientation }));
        this.updateSplitviewOrthogonalSashes(this.boundarySashes);
        const newOrthogonalSize = this.orientation === 0 ? width : height;
        const newSize = this.orientation === 1 ? width : height;
        this.paneItems.forEach((pane, index) => {
            pane.pane.orthogonalSize = newOrthogonalSize;
            pane.pane.orientation = this.orientation;
            const viewSize = this.size === 0 ? 0 : (newSize * paneSizes[index]) / this.size;
            this.splitview.addView(pane.pane, viewSize, index);
        });
        this.size = newSize;
        this.orthogonalSize = newOrthogonalSize;
        this.splitview.layout(this.size);
    }
    setupAnimation() {
        if (typeof this.animationTimer === 'number') {
            getWindow(this.element).clearTimeout(this.animationTimer);
        }
        this.element.classList.add('animated');
        this.animationTimer = getWindow(this.element).setTimeout(() => {
            this.animationTimer = undefined;
            this.element.classList.remove('animated');
        }, 200);
    }
    getPaneHeaderElements() {
        return [...this.element.querySelectorAll('.pane-header')];
    }
    focusPrevious() {
        const headers = this.getPaneHeaderElements();
        const index = headers.indexOf(this.element.ownerDocument.activeElement);
        if (index === -1) {
            return;
        }
        headers[Math.max(index - 1, 0)].focus();
    }
    focusNext() {
        const headers = this.getPaneHeaderElements();
        const index = headers.indexOf(this.element.ownerDocument.activeElement);
        if (index === -1) {
            return;
        }
        headers[Math.min(index + 1, headers.length - 1)].focus();
    }
    dispose() {
        super.dispose();
        this.paneItems.forEach(i => i.disposable.dispose());
    }
}
