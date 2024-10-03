import { IListVirtualDelegate } from '../../../../../../base/browser/ui/list/list.js';
import { IListAccessibilityProvider } from '../../../../../../base/browser/ui/list/listWidget.js';
import { ITreeNode, ITreeRenderer } from '../../../../../../base/browser/ui/tree/tree.js';
import { FuzzyScore } from '../../../../../../base/common/filters.js';
import { DisposableStore } from '../../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { WorkbenchObjectTree } from '../../../../../../platform/list/browser/listService.js';
import { INotebookVariableElement } from './notebookVariablesDataSource.js';
export declare class NotebookVariablesTree extends WorkbenchObjectTree<INotebookVariableElement> {
}
export declare class NotebookVariablesDelegate implements IListVirtualDelegate<INotebookVariableElement> {
    getHeight(element: INotebookVariableElement): number;
    getTemplateId(element: INotebookVariableElement): string;
}
export interface IVariableTemplateData {
    expression: HTMLElement;
    name: HTMLSpanElement;
    value: HTMLSpanElement;
    elementDisposables: DisposableStore;
}
export declare class NotebookVariableRenderer implements ITreeRenderer<INotebookVariableElement, FuzzyScore, IVariableTemplateData> {
    private expressionRenderer;
    static readonly ID = "variableElement";
    get templateId(): string;
    constructor(instantiationService: IInstantiationService);
    renderTemplate(container: HTMLElement): IVariableTemplateData;
    renderElement(element: ITreeNode<INotebookVariableElement, FuzzyScore>, _index: number, data: IVariableTemplateData): void;
    disposeElement(element: ITreeNode<INotebookVariableElement, FuzzyScore>, index: number, templateData: IVariableTemplateData, height: number | undefined): void;
    disposeTemplate(templateData: IVariableTemplateData): void;
}
export declare class NotebookVariableAccessibilityProvider implements IListAccessibilityProvider<INotebookVariableElement> {
    getWidgetAriaLabel(): string;
    getAriaLabel(element: INotebookVariableElement): string;
}
