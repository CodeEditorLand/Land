/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { HighlightedLabel } from '../../../../base/browser/ui/highlightedlabel/highlightedLabel.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { InputBox } from '../../../../base/browser/ui/inputbox/inputBox.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { createMatches } from '../../../../base/common/filters.js';
import { createSingleCallFunction } from '../../../../base/common/functional.js';
import { DisposableStore, dispose, toDisposable } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { localize } from '../../../../nls.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { defaultInputBoxStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { IDebugService } from '../common/debug.js';
import { Variable } from '../common/debugModel.js';
import { IDebugVisualizerService } from '../common/debugVisualizers.js';
const $ = dom.$;
export function renderViewTree(container) {
    const treeContainer = $('.');
    treeContainer.classList.add('debug-view-content');
    container.appendChild(treeContainer);
    return treeContainer;
}
let AbstractExpressionDataSource = class AbstractExpressionDataSource {
    constructor(debugService, debugVisualizer) {
        this.debugService = debugService;
        this.debugVisualizer = debugVisualizer;
    }
    async getChildren(element) {
        const vm = this.debugService.getViewModel();
        const children = await this.doGetChildren(element);
        return Promise.all(children.map(async (r) => {
            const vizOrTree = vm.getVisualizedExpression(r);
            if (typeof vizOrTree === 'string') {
                const viz = await this.debugVisualizer.getVisualizedNodeFor(vizOrTree, r);
                if (viz) {
                    vm.setVisualizedExpression(r, viz);
                    return viz;
                }
            }
            else if (vizOrTree) {
                return vizOrTree;
            }
            return r;
        }));
    }
};
AbstractExpressionDataSource = __decorate([
    __param(0, IDebugService),
    __param(1, IDebugVisualizerService),
    __metadata("design:paramtypes", [Object, Object])
], AbstractExpressionDataSource);
export { AbstractExpressionDataSource };
let AbstractExpressionsRenderer = class AbstractExpressionsRenderer {
    constructor(debugService, contextViewService, hoverService) {
        this.debugService = debugService;
        this.contextViewService = contextViewService;
        this.hoverService = hoverService;
    }
    renderTemplate(container) {
        const templateDisposable = new DisposableStore();
        const expression = dom.append(container, $('.expression'));
        const name = dom.append(expression, $('span.name'));
        const lazyButton = dom.append(expression, $('span.lazy-button'));
        lazyButton.classList.add(...ThemeIcon.asClassNameArray(Codicon.eye));
        templateDisposable.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate('mouse'), lazyButton, localize('debug.lazyButton.tooltip', "Click to expand")));
        const type = dom.append(expression, $('span.type'));
        const value = dom.append(expression, $('span.value'));
        const label = templateDisposable.add(new HighlightedLabel(name));
        const inputBoxContainer = dom.append(expression, $('.inputBoxContainer'));
        let actionBar;
        if (this.renderActionBar) {
            dom.append(expression, $('.span.actionbar-spacer'));
            actionBar = templateDisposable.add(new ActionBar(expression));
        }
        const template = { expression, name, type, value, label, inputBoxContainer, actionBar, elementDisposable: new DisposableStore(), templateDisposable, lazyButton, currentElement: undefined };
        templateDisposable.add(dom.addDisposableListener(lazyButton, dom.EventType.CLICK, () => {
            if (template.currentElement) {
                this.debugService.getViewModel().evaluateLazyExpression(template.currentElement);
            }
        }));
        return template;
    }
    renderExpressionElement(element, node, data) {
        data.currentElement = element;
        this.renderExpression(node.element, data, createMatches(node.filterData));
        if (data.actionBar) {
            this.renderActionBar(data.actionBar, element, data);
        }
        const selectedExpression = this.debugService.getViewModel().getSelectedExpression();
        if (element === selectedExpression?.expression || (element instanceof Variable && element.errorMessage)) {
            const options = this.getInputBoxOptions(element, !!selectedExpression?.settingWatch);
            if (options) {
                data.elementDisposable.add(this.renderInputBox(data.name, data.value, data.inputBoxContainer, options));
            }
        }
    }
    renderInputBox(nameElement, valueElement, inputBoxContainer, options) {
        nameElement.style.display = 'none';
        valueElement.style.display = 'none';
        inputBoxContainer.style.display = 'initial';
        dom.clearNode(inputBoxContainer);
        const inputBox = new InputBox(inputBoxContainer, this.contextViewService, { ...options, inputBoxStyles: defaultInputBoxStyles });
        inputBox.value = options.initialValue;
        inputBox.focus();
        inputBox.select();
        const done = createSingleCallFunction((success, finishEditing) => {
            nameElement.style.display = '';
            valueElement.style.display = '';
            inputBoxContainer.style.display = 'none';
            const value = inputBox.value;
            dispose(toDispose);
            if (finishEditing) {
                this.debugService.getViewModel().setSelectedExpression(undefined, false);
                options.onFinish(value, success);
            }
        });
        const toDispose = [
            inputBox,
            dom.addStandardDisposableListener(inputBox.inputElement, dom.EventType.KEY_DOWN, (e) => {
                const isEscape = e.equals(9 /* KeyCode.Escape */);
                const isEnter = e.equals(3 /* KeyCode.Enter */);
                if (isEscape || isEnter) {
                    e.preventDefault();
                    e.stopPropagation();
                    done(isEnter, true);
                }
            }),
            dom.addDisposableListener(inputBox.inputElement, dom.EventType.BLUR, () => {
                done(true, true);
            }),
            dom.addDisposableListener(inputBox.inputElement, dom.EventType.CLICK, e => {
                // Do not expand / collapse selected elements
                e.preventDefault();
                e.stopPropagation();
            })
        ];
        return toDisposable(() => {
            done(false, false);
        });
    }
    disposeElement(node, index, templateData) {
        templateData.elementDisposable.clear();
    }
    disposeTemplate(templateData) {
        templateData.elementDisposable.dispose();
        templateData.templateDisposable.dispose();
    }
};
AbstractExpressionsRenderer = __decorate([
    __param(0, IDebugService),
    __param(1, IContextViewService),
    __param(2, IHoverService),
    __metadata("design:paramtypes", [Object, Object, Object])
], AbstractExpressionsRenderer);
export { AbstractExpressionsRenderer };
