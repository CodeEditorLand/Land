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
var WatchExpressionsRenderer_1;
import { ElementsDragAndDropData } from '../../../../base/browser/ui/list/listView.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { localize } from '../../../../nls.js';
import { createAndFillInContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { Action2, IMenuService, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService, IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { WorkbenchAsyncDataTree } from '../../../../platform/list/browser/listService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ViewAction, ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { CONTEXT_CAN_VIEW_MEMORY, CONTEXT_VARIABLE_IS_READONLY, CONTEXT_WATCH_EXPRESSIONS_EXIST, CONTEXT_WATCH_EXPRESSIONS_FOCUSED, CONTEXT_WATCH_ITEM_TYPE, IDebugService, WATCH_VIEW_ID } from '../common/debug.js';
import { Expression, Variable, VisualizedExpression } from '../common/debugModel.js';
import { AbstractExpressionDataSource, AbstractExpressionsRenderer, renderViewTree } from './baseDebugView.js';
import { DebugExpressionRenderer } from './debugExpressionRenderer.js';
import { watchExpressionsAdd, watchExpressionsRemoveAll } from './debugIcons.js';
import { VariablesRenderer, VisualizedVariableRenderer } from './variablesView.js';
const MAX_VALUE_RENDER_LENGTH_IN_VIEWLET = 1024;
let ignoreViewUpdates = false;
let useCachedEvaluation = false;
let WatchExpressionsView = class WatchExpressionsView extends ViewPane {
    constructor(options, contextMenuService, debugService, keybindingService, instantiationService, viewDescriptorService, configurationService, contextKeyService, openerService, themeService, telemetryService, hoverService, menuService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
        this.debugService = debugService;
        this.needsRefresh = false;
        this.menu = menuService.createMenu(MenuId.DebugWatchContext, contextKeyService);
        this._register(this.menu);
        this.watchExpressionsUpdatedScheduler = new RunOnceScheduler(() => {
            this.needsRefresh = false;
            this.tree.updateChildren();
        }, 50);
        this.watchExpressionsExist = CONTEXT_WATCH_EXPRESSIONS_EXIST.bindTo(contextKeyService);
        this.variableReadonly = CONTEXT_VARIABLE_IS_READONLY.bindTo(contextKeyService);
        this.watchExpressionsExist.set(this.debugService.getModel().getWatchExpressions().length > 0);
        this.watchItemType = CONTEXT_WATCH_ITEM_TYPE.bindTo(contextKeyService);
        this.expressionRenderer = instantiationService.createInstance(DebugExpressionRenderer);
    }
    renderBody(container) {
        super.renderBody(container);
        this.element.classList.add('debug-pane');
        container.classList.add('debug-watch');
        const treeContainer = renderViewTree(container);
        const expressionsRenderer = this.instantiationService.createInstance(WatchExpressionsRenderer, this.expressionRenderer);
        this.tree = this.instantiationService.createInstance(WorkbenchAsyncDataTree, 'WatchExpressions', treeContainer, new WatchExpressionsDelegate(), [
            expressionsRenderer,
            this.instantiationService.createInstance(VariablesRenderer, this.expressionRenderer),
            this.instantiationService.createInstance(VisualizedVariableRenderer, this.expressionRenderer),
        ], this.instantiationService.createInstance(WatchExpressionsDataSource), {
            accessibilityProvider: new WatchExpressionsAccessibilityProvider(),
            identityProvider: { getId: (element) => element.getId() },
            keyboardNavigationLabelProvider: {
                getKeyboardNavigationLabel: (e) => {
                    if (e === this.debugService.getViewModel().getSelectedExpression()?.expression) {
                        return undefined;
                    }
                    return e.name;
                }
            },
            dnd: new WatchExpressionsDragAndDrop(this.debugService),
            overrideStyles: this.getLocationBasedColors().listOverrideStyles
        });
        this.tree.setInput(this.debugService);
        CONTEXT_WATCH_EXPRESSIONS_FOCUSED.bindTo(this.tree.contextKeyService);
        this._register(VisualizedVariableRenderer.rendererOnVisualizationRange(this.debugService.getViewModel(), this.tree));
        this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
        this._register(this.tree.onMouseDblClick(e => this.onMouseDblClick(e)));
        this._register(this.debugService.getModel().onDidChangeWatchExpressions(async (we) => {
            this.watchExpressionsExist.set(this.debugService.getModel().getWatchExpressions().length > 0);
            if (!this.isBodyVisible()) {
                this.needsRefresh = true;
            }
            else {
                if (we && !we.name) {
                    useCachedEvaluation = true;
                }
                await this.tree.updateChildren();
                useCachedEvaluation = false;
                if (we instanceof Expression) {
                    this.tree.reveal(we);
                }
            }
        }));
        this._register(this.debugService.getViewModel().onDidFocusStackFrame(() => {
            if (!this.isBodyVisible()) {
                this.needsRefresh = true;
                return;
            }
            if (!this.watchExpressionsUpdatedScheduler.isScheduled()) {
                this.watchExpressionsUpdatedScheduler.schedule();
            }
        }));
        this._register(this.debugService.getViewModel().onWillUpdateViews(() => {
            if (!ignoreViewUpdates) {
                this.tree.updateChildren();
            }
        }));
        this._register(this.onDidChangeBodyVisibility(visible => {
            if (visible && this.needsRefresh) {
                this.watchExpressionsUpdatedScheduler.schedule();
            }
        }));
        let horizontalScrolling;
        this._register(this.debugService.getViewModel().onDidSelectExpression(e => {
            const expression = e?.expression;
            if (expression && this.tree.hasNode(expression)) {
                horizontalScrolling = this.tree.options.horizontalScrolling;
                if (horizontalScrolling) {
                    this.tree.updateOptions({ horizontalScrolling: false });
                }
                if (expression.name) {
                    this.tree.rerender(expression);
                }
            }
            else if (!expression && horizontalScrolling !== undefined) {
                this.tree.updateOptions({ horizontalScrolling: horizontalScrolling });
                horizontalScrolling = undefined;
            }
        }));
        this._register(this.debugService.getViewModel().onDidEvaluateLazyExpression(async (e) => {
            if (e instanceof Variable && this.tree.hasNode(e)) {
                await this.tree.updateChildren(e, false, true);
                await this.tree.expand(e);
            }
        }));
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        this.tree.layout(height, width);
    }
    focus() {
        super.focus();
        this.tree.domFocus();
    }
    collapseAll() {
        this.tree.collapseAll();
    }
    onMouseDblClick(e) {
        if (e.browserEvent.target.className.indexOf('twistie') >= 0) {
            return;
        }
        const element = e.element;
        const selectedExpression = this.debugService.getViewModel().getSelectedExpression();
        if ((element instanceof Expression && element !== selectedExpression?.expression) || (element instanceof VisualizedExpression && element.treeItem.canEdit)) {
            this.debugService.getViewModel().setSelectedExpression(element, false);
        }
        else if (!element) {
            this.debugService.addWatchExpression();
        }
    }
    onContextMenu(e) {
        const element = e.element;
        const selection = this.tree.getSelection();
        this.watchItemType.set(element instanceof Expression ? 'expression' : element instanceof Variable ? 'variable' : undefined);
        const actions = [];
        const attributes = element instanceof Variable ? element.presentationHint?.attributes : undefined;
        this.variableReadonly.set(!!attributes && attributes.indexOf('readOnly') >= 0 || !!element?.presentationHint?.lazy);
        createAndFillInContextMenuActions(this.menu, { arg: element, shouldForwardArgs: true }, actions);
        this.contextMenuService.showContextMenu({
            getAnchor: () => e.anchor,
            getActions: () => actions,
            getActionsContext: () => element && selection.includes(element) ? selection : element ? [element] : [],
        });
    }
};
WatchExpressionsView = __decorate([
    __param(1, IContextMenuService),
    __param(2, IDebugService),
    __param(3, IKeybindingService),
    __param(4, IInstantiationService),
    __param(5, IViewDescriptorService),
    __param(6, IConfigurationService),
    __param(7, IContextKeyService),
    __param(8, IOpenerService),
    __param(9, IThemeService),
    __param(10, ITelemetryService),
    __param(11, IHoverService),
    __param(12, IMenuService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], WatchExpressionsView);
export { WatchExpressionsView };
class WatchExpressionsDelegate {
    getHeight(_element) {
        return 22;
    }
    getTemplateId(element) {
        if (element instanceof Expression) {
            return WatchExpressionsRenderer.ID;
        }
        if (element instanceof VisualizedExpression) {
            return VisualizedVariableRenderer.ID;
        }
        return VariablesRenderer.ID;
    }
}
function isDebugService(element) {
    return typeof element.getConfigurationManager === 'function';
}
class WatchExpressionsDataSource extends AbstractExpressionDataSource {
    hasChildren(element) {
        return isDebugService(element) || element.hasChildren;
    }
    doGetChildren(element) {
        if (isDebugService(element)) {
            const debugService = element;
            const watchExpressions = debugService.getModel().getWatchExpressions();
            const viewModel = debugService.getViewModel();
            return Promise.all(watchExpressions.map(we => !!we.name && !useCachedEvaluation
                ? we.evaluate(viewModel.focusedSession, viewModel.focusedStackFrame, 'watch').then(() => we)
                : Promise.resolve(we)));
        }
        return element.getChildren();
    }
}
let WatchExpressionsRenderer = class WatchExpressionsRenderer extends AbstractExpressionsRenderer {
    static { WatchExpressionsRenderer_1 = this; }
    static { this.ID = 'watchexpression'; }
    constructor(expressionRenderer, menuService, contextKeyService, debugService, contextViewService, hoverService, configurationService) {
        super(debugService, contextViewService, hoverService);
        this.expressionRenderer = expressionRenderer;
        this.menuService = menuService;
        this.contextKeyService = contextKeyService;
        this.configurationService = configurationService;
    }
    get templateId() {
        return WatchExpressionsRenderer_1.ID;
    }
    renderElement(node, index, data) {
        data.elementDisposable.clear();
        data.elementDisposable.add(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('debug.showVariableTypes')) {
                super.renderExpressionElement(node.element, node, data);
            }
        }));
        super.renderExpressionElement(node.element, node, data);
    }
    renderExpression(expression, data, highlights) {
        let text;
        data.type.textContent = '';
        const showType = this.configurationService.getValue('debug').showVariableTypes;
        if (showType && expression.type) {
            text = typeof expression.value === 'string' ? `${expression.name}: ` : expression.name;
            data.type.textContent = expression.type + ' =';
        }
        else {
            text = typeof expression.value === 'string' ? `${expression.name} =` : expression.name;
        }
        let title;
        if (expression.type) {
            if (showType) {
                title = `${expression.name}`;
            }
            else {
                title = expression.type === expression.value ?
                    expression.type :
                    `${expression.type}`;
            }
        }
        else {
            title = expression.value;
        }
        data.label.set(text, highlights, title);
        data.elementDisposable.add(this.expressionRenderer.renderValue(data.value, expression, {
            showChanged: true,
            maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET,
            colorize: true,
            session: expression.getSession(),
        }));
    }
    getInputBoxOptions(expression, settingValue) {
        if (settingValue) {
            return {
                initialValue: expression.value,
                ariaLabel: localize('typeNewValue', "Type new value"),
                onFinish: async (value, success) => {
                    if (success && value) {
                        const focusedFrame = this.debugService.getViewModel().focusedStackFrame;
                        if (focusedFrame && (expression instanceof Variable || expression instanceof Expression)) {
                            await expression.setExpression(value, focusedFrame);
                            this.debugService.getViewModel().updateViews();
                        }
                    }
                }
            };
        }
        return {
            initialValue: expression.name ? expression.name : '',
            ariaLabel: localize('watchExpressionInputAriaLabel', "Type watch expression"),
            placeholder: localize('watchExpressionPlaceholder', "Expression to watch"),
            onFinish: (value, success) => {
                if (success && value) {
                    this.debugService.renameWatchExpression(expression.getId(), value);
                    ignoreViewUpdates = true;
                    this.debugService.getViewModel().updateViews();
                    ignoreViewUpdates = false;
                }
                else if (!expression.name) {
                    this.debugService.removeWatchExpressions(expression.getId());
                }
            }
        };
    }
    renderActionBar(actionBar, expression) {
        const contextKeyService = getContextForWatchExpressionMenu(this.contextKeyService, expression);
        const context = expression;
        const menu = this.menuService.getMenuActions(MenuId.DebugWatchContext, contextKeyService, { arg: context, shouldForwardArgs: false });
        const primary = [];
        createAndFillInContextMenuActions(menu, { primary, secondary: [] }, 'inline');
        actionBar.clear();
        actionBar.context = context;
        actionBar.push(primary, { icon: true, label: false });
    }
};
WatchExpressionsRenderer = WatchExpressionsRenderer_1 = __decorate([
    __param(1, IMenuService),
    __param(2, IContextKeyService),
    __param(3, IDebugService),
    __param(4, IContextViewService),
    __param(5, IHoverService),
    __param(6, IConfigurationService),
    __metadata("design:paramtypes", [DebugExpressionRenderer, Object, Object, Object, Object, Object, Object])
], WatchExpressionsRenderer);
export { WatchExpressionsRenderer };
function getContextForWatchExpressionMenu(parentContext, expression) {
    return parentContext.createOverlay([
        [CONTEXT_CAN_VIEW_MEMORY.key, expression.memoryReference !== undefined],
        [CONTEXT_WATCH_ITEM_TYPE.key, 'expression']
    ]);
}
class WatchExpressionsAccessibilityProvider {
    getWidgetAriaLabel() {
        return localize({ comment: ['Debug is a noun in this context, not a verb.'], key: 'watchAriaTreeLabel' }, "Debug Watch Expressions");
    }
    getAriaLabel(element) {
        if (element instanceof Expression) {
            return localize('watchExpressionAriaLabel', "{0}, value {1}", element.name, element.value);
        }
        return localize('watchVariableAriaLabel', "{0}, value {1}", element.name, element.value);
    }
}
class WatchExpressionsDragAndDrop {
    constructor(debugService) {
        this.debugService = debugService;
    }
    onDragOver(data, targetElement, targetIndex, targetSector, originalEvent) {
        if (!(data instanceof ElementsDragAndDropData)) {
            return false;
        }
        const expressions = data.elements;
        if (!(expressions.length > 0 && expressions[0] instanceof Expression)) {
            return false;
        }
        let dropEffectPosition = undefined;
        if (targetIndex === undefined) {
            dropEffectPosition = "drop-target-after";
            targetIndex = -1;
        }
        else {
            switch (targetSector) {
                case 0:
                case 1:
                    dropEffectPosition = "drop-target-before";
                    break;
                case 2:
                case 3:
                    dropEffectPosition = "drop-target-after";
                    break;
            }
        }
        return { accept: true, effect: { type: 1, position: dropEffectPosition }, feedback: [targetIndex] };
    }
    getDragURI(element) {
        if (!(element instanceof Expression) || element === this.debugService.getViewModel().getSelectedExpression()?.expression) {
            return null;
        }
        return element.getId();
    }
    getDragLabel(elements) {
        if (elements.length === 1) {
            return elements[0].name;
        }
        return undefined;
    }
    drop(data, targetElement, targetIndex, targetSector, originalEvent) {
        if (!(data instanceof ElementsDragAndDropData)) {
            return;
        }
        const draggedElement = data.elements[0];
        if (!(draggedElement instanceof Expression)) {
            throw new Error('Invalid dragged element');
        }
        const watches = this.debugService.getModel().getWatchExpressions();
        const sourcePosition = watches.indexOf(draggedElement);
        let targetPosition;
        if (targetElement instanceof Expression) {
            targetPosition = watches.indexOf(targetElement);
            switch (targetSector) {
                case 3:
                case 2:
                    targetPosition++;
                    break;
            }
            if (sourcePosition < targetPosition) {
                targetPosition--;
            }
        }
        else {
            targetPosition = watches.length - 1;
        }
        this.debugService.moveWatchExpression(draggedElement.getId(), targetPosition);
    }
    dispose() { }
}
registerAction2(class Collapse extends ViewAction {
    constructor() {
        super({
            id: 'watch.collapse',
            viewId: WATCH_VIEW_ID,
            title: localize('collapse', "Collapse All"),
            f1: false,
            icon: Codicon.collapseAll,
            precondition: CONTEXT_WATCH_EXPRESSIONS_EXIST,
            menu: {
                id: MenuId.ViewTitle,
                order: 30,
                group: 'navigation',
                when: ContextKeyExpr.equals('view', WATCH_VIEW_ID)
            }
        });
    }
    runInView(_accessor, view) {
        view.collapseAll();
    }
});
export const ADD_WATCH_ID = 'workbench.debug.viewlet.action.addWatchExpression';
export const ADD_WATCH_LABEL = localize('addWatchExpression', "Add Expression");
registerAction2(class AddWatchExpressionAction extends Action2 {
    constructor() {
        super({
            id: ADD_WATCH_ID,
            title: ADD_WATCH_LABEL,
            f1: false,
            icon: watchExpressionsAdd,
            menu: {
                id: MenuId.ViewTitle,
                group: 'navigation',
                when: ContextKeyExpr.equals('view', WATCH_VIEW_ID)
            }
        });
    }
    run(accessor) {
        const debugService = accessor.get(IDebugService);
        debugService.addWatchExpression();
    }
});
export const REMOVE_WATCH_EXPRESSIONS_COMMAND_ID = 'workbench.debug.viewlet.action.removeAllWatchExpressions';
export const REMOVE_WATCH_EXPRESSIONS_LABEL = localize('removeAllWatchExpressions', "Remove All Expressions");
registerAction2(class RemoveAllWatchExpressionsAction extends Action2 {
    constructor() {
        super({
            id: REMOVE_WATCH_EXPRESSIONS_COMMAND_ID,
            title: REMOVE_WATCH_EXPRESSIONS_LABEL,
            f1: false,
            icon: watchExpressionsRemoveAll,
            precondition: CONTEXT_WATCH_EXPRESSIONS_EXIST,
            menu: {
                id: MenuId.ViewTitle,
                order: 20,
                group: 'navigation',
                when: ContextKeyExpr.equals('view', WATCH_VIEW_ID)
            }
        });
    }
    run(accessor) {
        const debugService = accessor.get(IDebugService);
        debugService.removeWatchExpressions();
    }
});
