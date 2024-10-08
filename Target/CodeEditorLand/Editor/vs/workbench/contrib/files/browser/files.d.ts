import { URI } from '../../../../base/common/uri.js';
import { IListService } from '../../../../platform/list/browser/listService.js';
import { ISortOrderConfiguration } from '../common/files.js';
import { IEditorIdentifier } from '../../../common/editor.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ExplorerItem } from '../common/explorerModel.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditableData } from '../../../common/views.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { ResourceFileEdit } from '../../../../editor/browser/services/bulkEditService.js';
import { ProgressLocation } from '../../../../platform/progress/common/progress.js';
export interface IExplorerService {
    readonly _serviceBrand: undefined;
    readonly roots: ExplorerItem[];
    readonly sortOrderConfiguration: ISortOrderConfiguration;
    getContext(respectMultiSelection: boolean, ignoreNestedChildren?: boolean): ExplorerItem[];
    hasViewFocus(): boolean;
    setEditable(stat: ExplorerItem, data: IEditableData | null): Promise<void>;
    getEditable(): {
        stat: ExplorerItem;
        data: IEditableData;
    } | undefined;
    getEditableData(stat: ExplorerItem): IEditableData | undefined;
    isEditable(stat: ExplorerItem | undefined): boolean;
    findClosest(resource: URI): ExplorerItem | null;
    findClosestRoot(resource: URI): ExplorerItem | null;
    refresh(): Promise<void>;
    setToCopy(stats: ExplorerItem[], cut: boolean): Promise<void>;
    isCut(stat: ExplorerItem): boolean;
    applyBulkEdit(edit: ResourceFileEdit[], options: {
        undoLabel: string;
        progressLabel: string;
        confirmBeforeUndo?: boolean;
        progressLocation?: ProgressLocation.Explorer | ProgressLocation.Window;
    }): Promise<void>;
    /**
     * Selects and reveal the file element provided by the given resource if its found in the explorer.
     * Will try to resolve the path in case the explorer is not yet expanded to the file yet.
     */
    select(resource: URI, reveal?: boolean | string): Promise<void>;
    registerView(contextAndRefreshProvider: IExplorerView): void;
}
export declare const IExplorerService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExplorerService>;
export interface IExplorerView {
    autoReveal: boolean | 'force' | 'focusNoScroll';
    getContext(respectMultiSelection: boolean): ExplorerItem[];
    refresh(recursive: boolean, item?: ExplorerItem, cancelEditing?: boolean): Promise<void>;
    selectResource(resource: URI | undefined, reveal?: boolean | string, retry?: number): Promise<void>;
    setTreeInput(): Promise<void>;
    itemsCopied(tats: ExplorerItem[], cut: boolean, previousCut: ExplorerItem[] | undefined): void;
    setEditable(stat: ExplorerItem, isEditing: boolean): Promise<void>;
    isItemVisible(item: ExplorerItem): boolean;
    isItemCollapsed(item: ExplorerItem): boolean;
    hasFocus(): boolean;
    getFocus(): ExplorerItem[];
    focusNext(): void;
    focusLast(): void;
}
export declare function getResourceForCommand(commandArg: unknown, editorService: IEditorService, listService: IListService): URI | undefined;
export declare function getMultiSelectedResources(commandArg: unknown, listService: IListService, editorSerice: IEditorService, editorGroupService: IEditorGroupsService, explorerService: IExplorerService): Array<URI>;
export declare function getOpenEditorsViewMultiSelection(accessor: ServicesAccessor): Array<IEditorIdentifier> | undefined;
