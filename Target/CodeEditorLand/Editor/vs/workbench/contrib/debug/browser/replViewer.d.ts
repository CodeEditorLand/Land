import { CountBadge } from '../../../../base/browser/ui/countBadge/countBadge.js';
import { HighlightedLabel, IHighlight } from '../../../../base/browser/ui/highlightedlabel/highlightedLabel.js';
import { CachedListVirtualDelegate } from '../../../../base/browser/ui/list/list.js';
import { IListAccessibilityProvider } from '../../../../base/browser/ui/list/listWidget.js';
import { IAsyncDataSource, ITreeNode, ITreeRenderer } from '../../../../base/browser/ui/tree/tree.js';
import { FuzzyScore } from '../../../../base/common/filters.js';
import { Disposable, DisposableStore, IDisposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IDebugService, IDebugSession, IExpression, IReplElement, IReplElementSource, IReplOptions } from '../common/debug.js';
import { Variable } from '../common/debugModel.js';
import { RawObjectReplElement, ReplEvaluationInput, ReplEvaluationResult, ReplGroup, ReplOutputElement, ReplVariableElement } from '../common/replModel.js';
import { AbstractExpressionsRenderer, IExpressionTemplateData, IInputBoxOptions } from './baseDebugView.js';
import { DebugExpressionRenderer } from './debugExpressionRenderer.js';
interface IReplEvaluationInputTemplateData {
    label: HighlightedLabel;
}
interface IReplGroupTemplateData {
    label: HTMLElement;
    source: SourceWidget;
    elementDisposable?: IDisposable;
}
interface IReplEvaluationResultTemplateData {
    value: HTMLElement;
    elementStore: DisposableStore;
}
interface IOutputReplElementTemplateData {
    container: HTMLElement;
    count: CountBadge;
    countContainer: HTMLElement;
    value: HTMLElement;
    source: SourceWidget;
    getReplElementSource(): IReplElementSource | undefined;
    elementDisposable: DisposableStore;
}
interface IRawObjectReplTemplateData {
    container: HTMLElement;
    expression: HTMLElement;
    name: HTMLElement;
    value: HTMLElement;
    label: HighlightedLabel;
    elementStore: DisposableStore;
}
export declare class ReplEvaluationInputsRenderer implements ITreeRenderer<ReplEvaluationInput, FuzzyScore, IReplEvaluationInputTemplateData> {
    static readonly ID = "replEvaluationInput";
    get templateId(): string;
    renderTemplate(container: HTMLElement): IReplEvaluationInputTemplateData;
    renderElement(element: ITreeNode<ReplEvaluationInput, FuzzyScore>, index: number, templateData: IReplEvaluationInputTemplateData): void;
    disposeTemplate(templateData: IReplEvaluationInputTemplateData): void;
}
export declare class ReplGroupRenderer implements ITreeRenderer<ReplGroup, FuzzyScore, IReplGroupTemplateData> {
    private readonly expressionRenderer;
    private readonly instaService;
    static readonly ID = "replGroup";
    constructor(expressionRenderer: DebugExpressionRenderer, instaService: IInstantiationService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): IReplGroupTemplateData;
    renderElement(element: ITreeNode<ReplGroup, FuzzyScore>, _index: number, templateData: IReplGroupTemplateData): void;
    disposeTemplate(templateData: IReplGroupTemplateData): void;
}
export declare class ReplEvaluationResultsRenderer implements ITreeRenderer<ReplEvaluationResult | Variable, FuzzyScore, IReplEvaluationResultTemplateData> {
    private readonly expressionRenderer;
    static readonly ID = "replEvaluationResult";
    get templateId(): string;
    constructor(expressionRenderer: DebugExpressionRenderer);
    renderTemplate(container: HTMLElement): IReplEvaluationResultTemplateData;
    renderElement(element: ITreeNode<ReplEvaluationResult | Variable, FuzzyScore>, index: number, templateData: IReplEvaluationResultTemplateData): void;
    disposeTemplate(templateData: IReplEvaluationResultTemplateData): void;
}
export declare class ReplOutputElementRenderer implements ITreeRenderer<ReplOutputElement, FuzzyScore, IOutputReplElementTemplateData> {
    private readonly expressionRenderer;
    private readonly instaService;
    static readonly ID = "outputReplElement";
    constructor(expressionRenderer: DebugExpressionRenderer, instaService: IInstantiationService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): IOutputReplElementTemplateData;
    renderElement({ element }: ITreeNode<ReplOutputElement, FuzzyScore>, index: number, templateData: IOutputReplElementTemplateData): void;
    private setElementCount;
    disposeTemplate(templateData: IOutputReplElementTemplateData): void;
    disposeElement(_element: ITreeNode<ReplOutputElement, FuzzyScore>, _index: number, templateData: IOutputReplElementTemplateData): void;
}
export declare class ReplVariablesRenderer extends AbstractExpressionsRenderer<IExpression | ReplVariableElement> {
    private readonly expressionRenderer;
    static readonly ID = "replVariable";
    get templateId(): string;
    constructor(expressionRenderer: DebugExpressionRenderer, debugService: IDebugService, contextViewService: IContextViewService, hoverService: IHoverService);
    renderElement(node: ITreeNode<IExpression | ReplVariableElement, FuzzyScore>, _index: number, data: IExpressionTemplateData): void;
    protected renderExpression(expression: IExpression | ReplVariableElement, data: IExpressionTemplateData, highlights: IHighlight[]): void;
    protected getInputBoxOptions(expression: IExpression): IInputBoxOptions | undefined;
}
export declare class ReplRawObjectsRenderer implements ITreeRenderer<RawObjectReplElement, FuzzyScore, IRawObjectReplTemplateData> {
    private readonly expressionRenderer;
    static readonly ID = "rawObject";
    constructor(expressionRenderer: DebugExpressionRenderer);
    get templateId(): string;
    renderTemplate(container: HTMLElement): IRawObjectReplTemplateData;
    renderElement(node: ITreeNode<RawObjectReplElement, FuzzyScore>, index: number, templateData: IRawObjectReplTemplateData): void;
    disposeTemplate(templateData: IRawObjectReplTemplateData): void;
}
export declare class ReplDelegate extends CachedListVirtualDelegate<IReplElement> {
    private readonly configurationService;
    private readonly replOptions;
    constructor(configurationService: IConfigurationService, replOptions: IReplOptions);
    getHeight(element: IReplElement): number;
    /**
     * With wordWrap enabled, this is an estimate. With wordWrap disabled, this is the real height that the list will use.
     */
    protected estimateHeight(element: IReplElement, ignoreValueLength?: boolean): number;
    getTemplateId(element: IReplElement): string;
    hasDynamicHeight(element: IReplElement): boolean;
}
export declare class ReplDataSource implements IAsyncDataSource<IDebugSession, IReplElement> {
    hasChildren(element: IReplElement | IDebugSession): boolean;
    getChildren(element: IReplElement | IDebugSession): Promise<IReplElement[]>;
}
export declare class ReplAccessibilityProvider implements IListAccessibilityProvider<IReplElement> {
    getWidgetAriaLabel(): string;
    getAriaLabel(element: IReplElement): string;
}
declare class SourceWidget extends Disposable {
    private readonly hoverService;
    private readonly labelService;
    private readonly el;
    private source?;
    private hover?;
    constructor(container: HTMLElement, editorService: IEditorService, hoverService: IHoverService, labelService: ILabelService);
    setSource(source?: IReplElementSource): void;
}
export {};
