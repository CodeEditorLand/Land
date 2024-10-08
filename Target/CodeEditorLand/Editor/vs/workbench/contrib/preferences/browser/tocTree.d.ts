import { ITreeElement, ITreeNode, ITreeRenderer } from '../../../../base/browser/ui/tree/tree.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IListService, WorkbenchObjectTree } from '../../../../platform/list/browser/listService.js';
import { ISettingsEditorViewState, SearchResultModel, SettingsTreeElement, SettingsTreeGroupElement } from './settingsTreeModels.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
export declare class TOCTreeModel {
    private _viewState;
    private environmentService;
    private _currentSearchModel;
    private _settingsTreeRoot;
    constructor(_viewState: ISettingsEditorViewState, environmentService: IWorkbenchEnvironmentService);
    get settingsTreeRoot(): SettingsTreeGroupElement;
    set settingsTreeRoot(value: SettingsTreeGroupElement);
    get currentSearchModel(): SearchResultModel | null;
    set currentSearchModel(model: SearchResultModel | null);
    get children(): SettingsTreeElement[];
    update(): void;
    private updateGroupCount;
    private getGroupCount;
}
interface ITOCEntryTemplate {
    labelElement: HTMLElement;
    countElement: HTMLElement;
    elementDisposables: DisposableStore;
}
export declare class TOCRenderer implements ITreeRenderer<SettingsTreeGroupElement, never, ITOCEntryTemplate> {
    private readonly _hoverService;
    templateId: string;
    constructor(_hoverService: IHoverService);
    renderTemplate(container: HTMLElement): ITOCEntryTemplate;
    renderElement(node: ITreeNode<SettingsTreeGroupElement>, index: number, template: ITOCEntryTemplate): void;
    disposeTemplate(templateData: ITOCEntryTemplate): void;
}
export declare function createTOCIterator(model: TOCTreeModel | SettingsTreeGroupElement, tree: TOCTree): Iterable<ITreeElement<SettingsTreeGroupElement>>;
export declare class TOCTree extends WorkbenchObjectTree<SettingsTreeGroupElement> {
    constructor(container: HTMLElement, viewState: ISettingsEditorViewState, contextKeyService: IContextKeyService, listService: IListService, configurationService: IConfigurationService, hoverService: IHoverService, instantiationService: IInstantiationService);
}
export {};
