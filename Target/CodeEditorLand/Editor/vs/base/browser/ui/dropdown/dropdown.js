import { $, addDisposableListener, append, EventHelper, EventType, isMouseEvent } from '../../dom.js';
import { StandardKeyboardEvent } from '../../keyboardEvent.js';
import { EventType as GestureEventType, Gesture } from '../../touch.js';
import { getBaseLayerHoverDelegate } from '../hover/hoverDelegate2.js';
import { getDefaultHoverDelegate } from '../hover/hoverDelegateFactory.js';
import { ActionRunner } from '../../../common/actions.js';
import { Emitter } from '../../../common/event.js';
import './dropdown.css';
class BaseDropdown extends ActionRunner {
    constructor(container, options) {
        super();
        this._onDidChangeVisibility = this._register(new Emitter());
        this.onDidChangeVisibility = this._onDidChangeVisibility.event;
        this._element = append(container, $('.monaco-dropdown'));
        this._label = append(this._element, $('.dropdown-label'));
        let labelRenderer = options.labelRenderer;
        if (!labelRenderer) {
            labelRenderer = (container) => {
                container.textContent = options.label || '';
                return null;
            };
        }
        for (const event of [EventType.CLICK, EventType.MOUSE_DOWN, GestureEventType.Tap]) {
            this._register(addDisposableListener(this.element, event, e => EventHelper.stop(e, true)));
        }
        for (const event of [EventType.MOUSE_DOWN, GestureEventType.Tap]) {
            this._register(addDisposableListener(this._label, event, e => {
                if (isMouseEvent(e) && (e.detail > 1 || e.button !== 0)) {
                    return;
                }
                if (this.visible) {
                    this.hide();
                }
                else {
                    this.show();
                }
            }));
        }
        this._register(addDisposableListener(this._label, EventType.KEY_UP, e => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(3) || event.equals(10)) {
                EventHelper.stop(e, true);
                if (this.visible) {
                    this.hide();
                }
                else {
                    this.show();
                }
            }
        }));
        const cleanupFn = labelRenderer(this._label);
        if (cleanupFn) {
            this._register(cleanupFn);
        }
        this._register(Gesture.addTarget(this._label));
    }
    get element() {
        return this._element;
    }
    get label() {
        return this._label;
    }
    set tooltip(tooltip) {
        if (this._label) {
            if (!this.hover && tooltip !== '') {
                this.hover = this._register(getBaseLayerHoverDelegate().setupManagedHover(getDefaultHoverDelegate('mouse'), this._label, tooltip));
            }
            else if (this.hover) {
                this.hover.update(tooltip);
            }
        }
    }
    show() {
        if (!this.visible) {
            this.visible = true;
            this._onDidChangeVisibility.fire(true);
        }
    }
    hide() {
        if (this.visible) {
            this.visible = false;
            this._onDidChangeVisibility.fire(false);
        }
    }
    isVisible() {
        return !!this.visible;
    }
    onEvent(_e, activeElement) {
        this.hide();
    }
    dispose() {
        super.dispose();
        this.hide();
        if (this.boxContainer) {
            this.boxContainer.remove();
            this.boxContainer = undefined;
        }
        if (this.contents) {
            this.contents.remove();
            this.contents = undefined;
        }
        if (this._label) {
            this._label.remove();
            this._label = undefined;
        }
    }
}
export class DropdownMenu extends BaseDropdown {
    constructor(container, _options) {
        super(container, _options);
        this._options = _options;
        this._actions = [];
        this.actions = _options.actions || [];
    }
    set menuOptions(options) {
        this._menuOptions = options;
    }
    get menuOptions() {
        return this._menuOptions;
    }
    get actions() {
        if (this._options.actionProvider) {
            return this._options.actionProvider.getActions();
        }
        return this._actions;
    }
    set actions(actions) {
        this._actions = actions;
    }
    show() {
        super.show();
        this.element.classList.add('active');
        this._options.contextMenuProvider.showContextMenu({
            getAnchor: () => this.element,
            getActions: () => this.actions,
            getActionsContext: () => this.menuOptions ? this.menuOptions.context : null,
            getActionViewItem: (action, options) => this.menuOptions && this.menuOptions.actionViewItemProvider ? this.menuOptions.actionViewItemProvider(action, options) : undefined,
            getKeyBinding: action => this.menuOptions && this.menuOptions.getKeyBinding ? this.menuOptions.getKeyBinding(action) : undefined,
            getMenuClassName: () => this._options.menuClassName || '',
            onHide: () => this.onHide(),
            actionRunner: this.menuOptions ? this.menuOptions.actionRunner : undefined,
            anchorAlignment: this.menuOptions ? this.menuOptions.anchorAlignment : 0,
            domForShadowRoot: this._options.menuAsChild ? this.element : undefined,
            skipTelemetry: this._options.skipTelemetry
        });
    }
    hide() {
        super.hide();
    }
    onHide() {
        this.hide();
        this.element.classList.remove('active');
    }
}
