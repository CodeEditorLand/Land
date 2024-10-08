import './notebookDiff.css';
import { IListMouseEvent, IListRenderer, IListVirtualDelegate } from '../../../../../base/browser/ui/list/list.js';
import { IListOptions, IListStyles, IStyleController, MouseController } from '../../../../../base/browser/ui/list/listWidget.js';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { IListService, IWorkbenchListOptions, WorkbenchList } from '../../../../../platform/list/browser/listService.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { DiffElementPlaceholderViewModel, IDiffElementViewModelBase, NotebookDocumentMetadataViewModel, SideBySideDiffElementViewModel, SingleSideDiffElementViewModel } from './diffElementViewModel.js';
import { CellDiffPlaceholderRenderTemplate, CellDiffSideBySideRenderTemplate, CellDiffSingleSideRenderTemplate, INotebookTextDiffEditor, NotebookDocumentDiffElementRenderTemplate } from './notebookDiffEditorBrowser.js';
import { IMenuService } from '../../../../../platform/actions/common/actions.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { IMouseWheelEvent } from '../../../../../base/browser/mouseEvent.js';
import { IAccessibilityService } from '../../../../../platform/accessibility/common/accessibility.js';
export declare class NotebookCellTextDiffListDelegate implements IListVirtualDelegate<IDiffElementViewModelBase> {
    private readonly configurationService;
    private readonly lineHeight;
    constructor(targetWindow: Window, configurationService: IConfigurationService);
    getHeight(element: IDiffElementViewModelBase): number;
    hasDynamicHeight(element: IDiffElementViewModelBase): boolean;
    getTemplateId(element: IDiffElementViewModelBase): string;
}
export declare class CellDiffPlaceholderRenderer implements IListRenderer<DiffElementPlaceholderViewModel, CellDiffPlaceholderRenderTemplate> {
    readonly notebookEditor: INotebookTextDiffEditor;
    protected readonly instantiationService: IInstantiationService;
    static readonly TEMPLATE_ID = "cell_diff_placeholder";
    constructor(notebookEditor: INotebookTextDiffEditor, instantiationService: IInstantiationService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): CellDiffPlaceholderRenderTemplate;
    renderElement(element: DiffElementPlaceholderViewModel, index: number, templateData: CellDiffPlaceholderRenderTemplate, height: number | undefined): void;
    disposeTemplate(templateData: CellDiffPlaceholderRenderTemplate): void;
    disposeElement(element: DiffElementPlaceholderViewModel, index: number, templateData: CellDiffPlaceholderRenderTemplate): void;
}
export declare class NotebookDocumentMetadataDiffRenderer implements IListRenderer<NotebookDocumentMetadataViewModel, NotebookDocumentDiffElementRenderTemplate> {
    readonly notebookEditor: INotebookTextDiffEditor;
    protected readonly instantiationService: IInstantiationService;
    protected readonly contextMenuService: IContextMenuService;
    protected readonly keybindingService: IKeybindingService;
    protected readonly menuService: IMenuService;
    protected readonly contextKeyService: IContextKeyService;
    protected readonly notificationService: INotificationService;
    protected readonly themeService: IThemeService;
    protected readonly accessibilityService: IAccessibilityService;
    static readonly TEMPLATE_ID = "notebook_metadata_diff_side_by_side";
    constructor(notebookEditor: INotebookTextDiffEditor, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, menuService: IMenuService, contextKeyService: IContextKeyService, notificationService: INotificationService, themeService: IThemeService, accessibilityService: IAccessibilityService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): NotebookDocumentDiffElementRenderTemplate;
    private _buildSourceEditor;
    renderElement(element: NotebookDocumentMetadataViewModel, index: number, templateData: NotebookDocumentDiffElementRenderTemplate, height: number | undefined): void;
    disposeTemplate(templateData: NotebookDocumentDiffElementRenderTemplate): void;
    disposeElement(element: NotebookDocumentMetadataViewModel, index: number, templateData: NotebookDocumentDiffElementRenderTemplate): void;
}
export declare class CellDiffSingleSideRenderer implements IListRenderer<SingleSideDiffElementViewModel, CellDiffSingleSideRenderTemplate | CellDiffSideBySideRenderTemplate> {
    readonly notebookEditor: INotebookTextDiffEditor;
    protected readonly instantiationService: IInstantiationService;
    static readonly TEMPLATE_ID = "cell_diff_single";
    constructor(notebookEditor: INotebookTextDiffEditor, instantiationService: IInstantiationService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): CellDiffSingleSideRenderTemplate;
    private _buildSourceEditor;
    renderElement(element: SingleSideDiffElementViewModel, index: number, templateData: CellDiffSingleSideRenderTemplate, height: number | undefined): void;
    disposeTemplate(templateData: CellDiffSingleSideRenderTemplate): void;
    disposeElement(element: SingleSideDiffElementViewModel, index: number, templateData: CellDiffSingleSideRenderTemplate): void;
}
export declare class CellDiffSideBySideRenderer implements IListRenderer<SideBySideDiffElementViewModel, CellDiffSideBySideRenderTemplate> {
    readonly notebookEditor: INotebookTextDiffEditor;
    protected readonly instantiationService: IInstantiationService;
    protected readonly contextMenuService: IContextMenuService;
    protected readonly keybindingService: IKeybindingService;
    protected readonly menuService: IMenuService;
    protected readonly contextKeyService: IContextKeyService;
    protected readonly notificationService: INotificationService;
    protected readonly themeService: IThemeService;
    protected readonly accessibilityService: IAccessibilityService;
    static readonly TEMPLATE_ID = "cell_diff_side_by_side";
    constructor(notebookEditor: INotebookTextDiffEditor, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, menuService: IMenuService, contextKeyService: IContextKeyService, notificationService: INotificationService, themeService: IThemeService, accessibilityService: IAccessibilityService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): CellDiffSideBySideRenderTemplate;
    private _buildSourceEditor;
    renderElement(element: SideBySideDiffElementViewModel, index: number, templateData: CellDiffSideBySideRenderTemplate, height: number | undefined): void;
    disposeTemplate(templateData: CellDiffSideBySideRenderTemplate): void;
    disposeElement(element: SideBySideDiffElementViewModel, index: number, templateData: CellDiffSideBySideRenderTemplate): void;
}
export declare class NotebookMouseController<T> extends MouseController<T> {
    protected onViewPointer(e: IListMouseEvent<T>): void;
}
export declare class NotebookTextDiffList extends WorkbenchList<IDiffElementViewModelBase> implements IDisposable, IStyleController {
    private styleElement?;
    get rowsContainer(): HTMLElement;
    constructor(listUser: string, container: HTMLElement, delegate: IListVirtualDelegate<IDiffElementViewModelBase>, renderers: IListRenderer<IDiffElementViewModelBase, CellDiffSingleSideRenderTemplate | CellDiffSideBySideRenderTemplate | CellDiffPlaceholderRenderTemplate | NotebookDocumentDiffElementRenderTemplate>[], contextKeyService: IContextKeyService, options: IWorkbenchListOptions<IDiffElementViewModelBase>, listService: IListService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    protected createMouseController(options: IListOptions<IDiffElementViewModelBase>): MouseController<IDiffElementViewModelBase>;
    getCellViewScrollTop(element: IDiffElementViewModelBase): number;
    getScrollHeight(): number;
    triggerScrollFromMouseWheelEvent(browserEvent: IMouseWheelEvent): void;
    delegateVerticalScrollbarPointerDown(browserEvent: PointerEvent): void;
    clear(): void;
    updateElementHeight2(element: IDiffElementViewModelBase, size: number): void;
    style(styles: IListStyles): void;
}
