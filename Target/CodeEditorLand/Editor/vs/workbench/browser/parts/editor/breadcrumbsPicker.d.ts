import { Emitter, Event } from '../../../../base/common/event.js';
import { FuzzyScore } from '../../../../base/common/filters.js';
import { IDisposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import './media/breadcrumbscontrol.css';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileStat } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { WorkbenchDataTree, WorkbenchAsyncDataTree } from '../../../../platform/list/browser/listService.js';
import { IWorkspace, IWorkspaceContextService, IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { OutlineElement2, FileElement } from './breadcrumbsModel.js';
import { ITreeSorter } from '../../../../base/browser/ui/tree/tree.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IOutline } from '../../../services/outline/browser/outline.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
interface ILayoutInfo {
    maxHeight: number;
    width: number;
    arrowSize: number;
    arrowOffset: number;
    inputHeight: number;
}
type Tree<I, E> = WorkbenchDataTree<I, E, FuzzyScore> | WorkbenchAsyncDataTree<I, E, FuzzyScore>;
export interface SelectEvent {
    target: any;
    browserEvent: UIEvent;
}
export declare abstract class BreadcrumbsPicker {
    protected resource: URI;
    protected readonly _instantiationService: IInstantiationService;
    protected readonly _themeService: IThemeService;
    protected readonly _configurationService: IConfigurationService;
    protected readonly _disposables: DisposableStore;
    protected readonly _domNode: HTMLDivElement;
    protected _arrow: HTMLDivElement;
    protected _treeContainer: HTMLDivElement;
    protected _tree: Tree<any, any>;
    protected _fakeEvent: UIEvent;
    protected _layoutInfo: ILayoutInfo;
    protected readonly _onWillPickElement: Emitter<void>;
    readonly onWillPickElement: Event<void>;
    private readonly _previewDispoables;
    constructor(parent: HTMLElement, resource: URI, _instantiationService: IInstantiationService, _themeService: IThemeService, _configurationService: IConfigurationService);
    dispose(): void;
    show(input: any, maxHeight: number, width: number, arrowSize: number, arrowOffset: number): Promise<void>;
    protected _layout(): void;
    restoreViewState(): void;
    protected abstract _setInput(element: FileElement | OutlineElement2): Promise<void>;
    protected abstract _createTree(container: HTMLElement, input: any): Tree<any, any>;
    protected abstract _previewElement(element: any): IDisposable;
    protected abstract _revealElement(element: any, options: IEditorOptions, sideBySide: boolean): Promise<boolean>;
}
export declare class FileSorter implements ITreeSorter<IFileStat | IWorkspaceFolder> {
    compare(a: IFileStat | IWorkspaceFolder, b: IFileStat | IWorkspaceFolder): number;
}
export declare class BreadcrumbsFilePicker extends BreadcrumbsPicker {
    private readonly _workspaceService;
    private readonly _editorService;
    constructor(parent: HTMLElement, resource: URI, instantiationService: IInstantiationService, themeService: IThemeService, configService: IConfigurationService, _workspaceService: IWorkspaceContextService, _editorService: IEditorService);
    protected _createTree(container: HTMLElement): WorkbenchAsyncDataTree<IWorkspace | URI, IWorkspaceFolder | IFileStat, FuzzyScore>;
    protected _setInput(element: FileElement | OutlineElement2): Promise<void>;
    protected _previewElement(_element: any): IDisposable;
    protected _revealElement(element: IFileStat | IWorkspaceFolder, options: IEditorOptions, sideBySide: boolean): Promise<boolean>;
}
export declare class BreadcrumbsOutlinePicker extends BreadcrumbsPicker {
    protected _createTree(container: HTMLElement, input: OutlineElement2): WorkbenchDataTree<IOutline<any>, any, FuzzyScore>;
    protected _setInput(input: OutlineElement2): Promise<void>;
    protected _previewElement(element: any): IDisposable;
    protected _revealElement(element: any, options: IEditorOptions, sideBySide: boolean): Promise<boolean>;
}
export {};
