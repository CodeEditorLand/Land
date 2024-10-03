import { IListRenderer, IListVirtualDelegate } from '../../../../../../base/browser/ui/list/list.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../../../editor/browser/editorBrowser.js';
import { IMenuService } from '../../../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IScopedContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { INotificationService } from '../../../../../../platform/notification/common/notification.js';
import { ICellViewModel, INotebookEditorDelegate } from '../../notebookBrowser.js';
import { CellDragAndDropController } from '../cellParts/cellDnd.js';
import { CellEditorOptions } from '../cellParts/cellEditorOptions.js';
import { CodeCellRenderTemplate, MarkdownCellRenderTemplate } from '../notebookRenderingCommon.js';
import { CodeCellViewModel } from '../../viewModel/codeCellViewModel.js';
import { MarkupCellViewModel } from '../../viewModel/markupCellViewModel.js';
import { CellViewModel } from '../../viewModel/notebookViewModelImpl.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
import { NotebookCellEditorPool } from '../notebookCellEditorPool.js';
export declare class NotebookCellListDelegate extends Disposable implements IListVirtualDelegate<CellViewModel> {
    private readonly configurationService;
    private readonly lineHeight;
    constructor(targetWindow: Window, configurationService: IConfigurationService);
    getHeight(element: CellViewModel): number;
    getDynamicHeight(element: CellViewModel): number | null;
    getTemplateId(element: CellViewModel): string;
}
declare abstract class AbstractCellRenderer {
    protected readonly instantiationService: IInstantiationService;
    protected readonly notebookEditor: INotebookEditorDelegate;
    protected readonly contextMenuService: IContextMenuService;
    protected readonly menuService: IMenuService;
    protected readonly keybindingService: IKeybindingService;
    protected readonly notificationService: INotificationService;
    protected readonly contextKeyServiceProvider: (container: HTMLElement) => IScopedContextKeyService;
    protected dndController: CellDragAndDropController | undefined;
    protected readonly editorOptions: CellEditorOptions;
    constructor(instantiationService: IInstantiationService, notebookEditor: INotebookEditorDelegate, contextMenuService: IContextMenuService, menuService: IMenuService, configurationService: IConfigurationService, keybindingService: IKeybindingService, notificationService: INotificationService, contextKeyServiceProvider: (container: HTMLElement) => IScopedContextKeyService, language: string, dndController: CellDragAndDropController | undefined);
    dispose(): void;
}
export declare class MarkupCellRenderer extends AbstractCellRenderer implements IListRenderer<MarkupCellViewModel, MarkdownCellRenderTemplate> {
    private renderedEditors;
    static readonly TEMPLATE_ID = "markdown_cell";
    private _notebookExecutionStateService;
    constructor(notebookEditor: INotebookEditorDelegate, dndController: CellDragAndDropController, renderedEditors: Map<ICellViewModel, ICodeEditor>, contextKeyServiceProvider: (container: HTMLElement) => IScopedContextKeyService, configurationService: IConfigurationService, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, menuService: IMenuService, keybindingService: IKeybindingService, notificationService: INotificationService, notebookExecutionStateService: INotebookExecutionStateService);
    get templateId(): string;
    renderTemplate(rootContainer: HTMLElement): MarkdownCellRenderTemplate;
    renderElement(element: MarkupCellViewModel, index: number, templateData: MarkdownCellRenderTemplate, height: number | undefined): void;
    disposeTemplate(templateData: MarkdownCellRenderTemplate): void;
    disposeElement(_element: ICellViewModel, _index: number, templateData: MarkdownCellRenderTemplate): void;
}
export declare class CodeCellRenderer extends AbstractCellRenderer implements IListRenderer<CodeCellViewModel, CodeCellRenderTemplate> {
    private renderedEditors;
    private editorPool;
    static readonly TEMPLATE_ID = "code_cell";
    constructor(notebookEditor: INotebookEditorDelegate, renderedEditors: Map<ICellViewModel, ICodeEditor>, editorPool: NotebookCellEditorPool, dndController: CellDragAndDropController, contextKeyServiceProvider: (container: HTMLElement) => IScopedContextKeyService, configurationService: IConfigurationService, contextMenuService: IContextMenuService, menuService: IMenuService, instantiationService: IInstantiationService, keybindingService: IKeybindingService, notificationService: INotificationService);
    get templateId(): string;
    renderTemplate(rootContainer: HTMLElement): CodeCellRenderTemplate;
    renderElement(element: CodeCellViewModel, index: number, templateData: CodeCellRenderTemplate, height: number | undefined): void;
    disposeTemplate(templateData: CodeCellRenderTemplate): void;
    disposeElement(element: ICellViewModel, index: number, templateData: CodeCellRenderTemplate, height: number | undefined): void;
}
export {};
