import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { HighlightedLabel, IHighlight } from '../../../../base/browser/ui/highlightedlabel/highlightedLabel.js';
import { IInputValidationOptions } from '../../../../base/browser/ui/inputbox/inputBox.js';
import { IAsyncDataSource, ITreeNode, ITreeRenderer } from '../../../../base/browser/ui/tree/tree.js';
import { FuzzyScore } from '../../../../base/common/filters.js';
import { DisposableStore, IDisposable } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IDebugService, IExpression } from '../common/debug.js';
import { IDebugVisualizerService } from '../common/debugVisualizers.js';
import { LinkDetector } from './linkDetector.js';
export interface IRenderValueOptions {
    showChanged?: boolean;
    maxValueLength?: number;
    hover?: false | {
        commands: {
            id: string;
            args: unknown[];
        }[];
        commandService: ICommandService;
    };
    colorize?: boolean;
    linkDetector?: LinkDetector;
}
export interface IVariableTemplateData {
    expression: HTMLElement;
    name: HTMLElement;
    type: HTMLElement;
    value: HTMLElement;
    label: HighlightedLabel;
    lazyButton: HTMLElement;
}
export declare function renderViewTree(container: HTMLElement): HTMLElement;
export interface IInputBoxOptions {
    initialValue: string;
    ariaLabel: string;
    placeholder?: string;
    validationOptions?: IInputValidationOptions;
    onFinish: (value: string, success: boolean) => void;
}
export interface IExpressionTemplateData {
    expression: HTMLElement;
    name: HTMLSpanElement;
    type: HTMLSpanElement;
    value: HTMLSpanElement;
    inputBoxContainer: HTMLElement;
    actionBar?: ActionBar;
    elementDisposable: DisposableStore;
    templateDisposable: IDisposable;
    label: HighlightedLabel;
    lazyButton: HTMLElement;
    currentElement: IExpression | undefined;
}
export declare abstract class AbstractExpressionDataSource<Input, Element extends IExpression> implements IAsyncDataSource<Input, Element> {
    protected debugService: IDebugService;
    protected debugVisualizer: IDebugVisualizerService;
    constructor(debugService: IDebugService, debugVisualizer: IDebugVisualizerService);
    abstract hasChildren(element: Input | Element): boolean;
    getChildren(element: Input | Element): Promise<Element[]>;
    protected abstract doGetChildren(element: Input | Element): Promise<Element[]>;
}
export declare abstract class AbstractExpressionsRenderer<T = IExpression> implements ITreeRenderer<T, FuzzyScore, IExpressionTemplateData> {
    protected debugService: IDebugService;
    private readonly contextViewService;
    protected readonly hoverService: IHoverService;
    constructor(debugService: IDebugService, contextViewService: IContextViewService, hoverService: IHoverService);
    abstract get templateId(): string;
    renderTemplate(container: HTMLElement): IExpressionTemplateData;
    abstract renderElement(node: ITreeNode<T, FuzzyScore>, index: number, data: IExpressionTemplateData): void;
    protected renderExpressionElement(element: IExpression, node: ITreeNode<T, FuzzyScore>, data: IExpressionTemplateData): void;
    renderInputBox(nameElement: HTMLElement, valueElement: HTMLElement, inputBoxContainer: HTMLElement, options: IInputBoxOptions): IDisposable;
    protected abstract renderExpression(expression: T, data: IExpressionTemplateData, highlights: IHighlight[]): void;
    protected abstract getInputBoxOptions(expression: IExpression, settingValue: boolean): IInputBoxOptions | undefined;
    protected renderActionBar?(actionBar: ActionBar, expression: IExpression, data: IExpressionTemplateData): void;
    disposeElement(node: ITreeNode<T, FuzzyScore>, index: number, templateData: IExpressionTemplateData): void;
    disposeTemplate(templateData: IExpressionTemplateData): void;
}
