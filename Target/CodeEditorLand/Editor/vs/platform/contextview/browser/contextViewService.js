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
import { ContextView } from '../../../base/browser/ui/contextview/contextview.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ILayoutService } from '../../layout/browser/layoutService.js';
import { getWindow } from '../../../base/browser/dom.js';
let ContextViewHandler = class ContextViewHandler extends Disposable {
    constructor(layoutService) {
        super();
        this.layoutService = layoutService;
        this.contextView = this._register(new ContextView(this.layoutService.mainContainer, 1));
        this.layout();
        this._register(layoutService.onDidLayoutContainer(() => this.layout()));
    }
    showContextView(delegate, container, shadowRoot) {
        let domPosition;
        if (container) {
            if (container === this.layoutService.getContainer(getWindow(container))) {
                domPosition = 1;
            }
            else if (shadowRoot) {
                domPosition = 3;
            }
            else {
                domPosition = 2;
            }
        }
        else {
            domPosition = 1;
        }
        this.contextView.setContainer(container ?? this.layoutService.activeContainer, domPosition);
        this.contextView.show(delegate);
        const openContextView = {
            close: () => {
                if (this.openContextView === openContextView) {
                    this.hideContextView();
                }
            }
        };
        this.openContextView = openContextView;
        return openContextView;
    }
    layout() {
        this.contextView.layout();
    }
    hideContextView(data) {
        this.contextView.hide(data);
        this.openContextView = undefined;
    }
};
ContextViewHandler = __decorate([
    __param(0, ILayoutService),
    __metadata("design:paramtypes", [Object])
], ContextViewHandler);
export { ContextViewHandler };
export class ContextViewService extends ContextViewHandler {
    getContextViewElement() {
        return this.contextView.getViewElement();
    }
}
