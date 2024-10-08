import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { IHighlight } from '../../../../base/browser/ui/highlightedlabel/highlightedLabel.js';
import { AsyncDataTree } from '../../../../base/browser/ui/tree/asyncDataTree.js';
import { ITreeContextMenuEvent, ITreeNode } from '../../../../base/browser/ui/tree/tree.js';
import { FuzzyScore } from '../../../../base/common/filters.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IMenuService, MenuId } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService, IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IViewletViewOptions } from '../../../browser/parts/views/viewsViewlet.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IDebugService, IExpression, IScope, IViewModel } from '../common/debug.js';
import { IDebugVisualizerService } from '../common/debugVisualizers.js';
import { AbstractExpressionsRenderer, IExpressionTemplateData, IInputBoxOptions } from './baseDebugView.js';
import { DebugExpressionRenderer } from './debugExpressionRenderer.js';
export declare class VariablesView extends ViewPane {
    private readonly debugService;
    private readonly menuService;
    private updateTreeScheduler;
    private needsRefresh;
    private tree;
    private savedViewState;
    private autoExpandedScopes;
    constructor(options: IViewletViewOptions, contextMenuService: IContextMenuService, debugService: IDebugService, keybindingService: IKeybindingService, configurationService: IConfigurationService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, hoverService: IHoverService, menuService: IMenuService);
    protected renderBody(container: HTMLElement): void;
    protected layoutBody(width: number, height: number): void;
    focus(): void;
    collapseAll(): void;
    private onMouseDblClick;
    private canSetExpressionValue;
    private onContextMenu;
}
export declare function openContextMenuForVariableTreeElement(parentContextKeyService: IContextKeyService, menuService: IMenuService, contextMenuService: IContextMenuService, menuId: MenuId, e: ITreeContextMenuEvent<IExpression | IScope>): Promise<void>;
export declare class VisualizedVariableRenderer extends AbstractExpressionsRenderer {
    private readonly expressionRenderer;
    private readonly menuService;
    private readonly contextKeyService;
    static readonly ID = "viz";
    /**
     * Registers a helper that rerenders the tree when visualization is requested
     * or cancelled./
     */
    static rendererOnVisualizationRange(model: IViewModel, tree: AsyncDataTree<any, any, any>): IDisposable;
    constructor(expressionRenderer: DebugExpressionRenderer, debugService: IDebugService, contextViewService: IContextViewService, hoverService: IHoverService, menuService: IMenuService, contextKeyService: IContextKeyService);
    get templateId(): string;
    renderElement(node: ITreeNode<IExpression, FuzzyScore>, index: number, data: IExpressionTemplateData): void;
    protected renderExpression(expression: IExpression, data: IExpressionTemplateData, highlights: IHighlight[]): void;
    protected getInputBoxOptions(expression: IExpression): IInputBoxOptions | undefined;
    protected renderActionBar(actionBar: ActionBar, expression: IExpression, _data: IExpressionTemplateData): void;
}
export declare class VariablesRenderer extends AbstractExpressionsRenderer {
    private readonly expressionRenderer;
    private readonly menuService;
    private readonly contextKeyService;
    private readonly visualization;
    private readonly contextMenuService;
    static readonly ID = "variable";
    constructor(expressionRenderer: DebugExpressionRenderer, menuService: IMenuService, contextKeyService: IContextKeyService, visualization: IDebugVisualizerService, contextMenuService: IContextMenuService, debugService: IDebugService, contextViewService: IContextViewService, hoverService: IHoverService);
    get templateId(): string;
    protected renderExpression(expression: IExpression, data: IExpressionTemplateData, highlights: IHighlight[]): void;
    renderElement(node: ITreeNode<IExpression, FuzzyScore>, index: number, data: IExpressionTemplateData): void;
    protected getInputBoxOptions(expression: IExpression): IInputBoxOptions;
    protected renderActionBar(actionBar: ActionBar, expression: IExpression, data: IExpressionTemplateData): void;
    private pickVisualizer;
    private useVisualizer;
}
export declare const SET_VARIABLE_ID = "debug.setVariable";
export declare const VIEW_MEMORY_ID = "workbench.debug.viewlet.action.viewMemory";
export declare const BREAK_WHEN_VALUE_CHANGES_ID = "debug.breakWhenValueChanges";
export declare const BREAK_WHEN_VALUE_IS_ACCESSED_ID = "debug.breakWhenValueIsAccessed";
export declare const BREAK_WHEN_VALUE_IS_READ_ID = "debug.breakWhenValueIsRead";
