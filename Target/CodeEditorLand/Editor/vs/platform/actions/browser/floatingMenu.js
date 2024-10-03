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
import { $, append, clearNode } from '../../../base/browser/dom.js';
import { Widget } from '../../../base/browser/ui/widget.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable, DisposableStore, toDisposable } from '../../../base/common/lifecycle.js';
import { createAndFillInActionBarActions } from './menuEntryActionViewItem.js';
import { IMenuService, MenuId } from '../common/actions.js';
import { IContextKeyService } from '../../contextkey/common/contextkey.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { asCssVariable, asCssVariableWithDefault, buttonBackground, buttonForeground, contrastBorder, editorBackground, editorForeground } from '../../theme/common/colorRegistry.js';
export class FloatingClickWidget extends Widget {
    constructor(label) {
        super();
        this.label = label;
        this._onClick = this._register(new Emitter());
        this.onClick = this._onClick.event;
        this._domNode = $('.floating-click-widget');
        this._domNode.style.padding = '6px 11px';
        this._domNode.style.borderRadius = '2px';
        this._domNode.style.cursor = 'pointer';
        this._domNode.style.zIndex = '1';
    }
    getDomNode() {
        return this._domNode;
    }
    render() {
        clearNode(this._domNode);
        this._domNode.style.backgroundColor = asCssVariableWithDefault(buttonBackground, asCssVariable(editorBackground));
        this._domNode.style.color = asCssVariableWithDefault(buttonForeground, asCssVariable(editorForeground));
        this._domNode.style.border = `1px solid ${asCssVariable(contrastBorder)}`;
        append(this._domNode, $('')).textContent = this.label;
        this.onclick(this._domNode, () => this._onClick.fire());
    }
}
let AbstractFloatingClickMenu = class AbstractFloatingClickMenu extends Disposable {
    constructor(menuId, menuService, contextKeyService) {
        super();
        this.renderEmitter = new Emitter();
        this.onDidRender = this.renderEmitter.event;
        this.menu = this._register(menuService.createMenu(menuId, contextKeyService));
    }
    render() {
        const menuDisposables = this._register(new DisposableStore());
        const renderMenuAsFloatingClickBtn = () => {
            menuDisposables.clear();
            if (!this.isVisible()) {
                return;
            }
            const actions = [];
            createAndFillInActionBarActions(this.menu, { renderShortTitle: true, shouldForwardArgs: true }, actions);
            if (actions.length === 0) {
                return;
            }
            const [first] = actions;
            const widget = this.createWidget(first, menuDisposables);
            menuDisposables.add(widget);
            menuDisposables.add(widget.onClick(() => first.run(this.getActionArg())));
            widget.render();
        };
        this._register(this.menu.onDidChange(renderMenuAsFloatingClickBtn));
        renderMenuAsFloatingClickBtn();
    }
    getActionArg() {
        return undefined;
    }
    isVisible() {
        return true;
    }
};
AbstractFloatingClickMenu = __decorate([
    __param(1, IMenuService),
    __param(2, IContextKeyService),
    __metadata("design:paramtypes", [MenuId, Object, Object])
], AbstractFloatingClickMenu);
export { AbstractFloatingClickMenu };
let FloatingClickMenu = class FloatingClickMenu extends AbstractFloatingClickMenu {
    constructor(options, instantiationService, menuService, contextKeyService) {
        super(options.menuId, menuService, contextKeyService);
        this.options = options;
        this.instantiationService = instantiationService;
        this.render();
    }
    createWidget(action, disposable) {
        const w = this.instantiationService.createInstance(FloatingClickWidget, action.label);
        const node = w.getDomNode();
        this.options.container.appendChild(node);
        disposable.add(toDisposable(() => node.remove()));
        return w;
    }
    getActionArg() {
        return this.options.getActionArg();
    }
};
FloatingClickMenu = __decorate([
    __param(1, IInstantiationService),
    __param(2, IMenuService),
    __param(3, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], FloatingClickMenu);
export { FloatingClickMenu };
