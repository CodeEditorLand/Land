import { IDragAndDropData } from '../../base/browser/dnd.js';
import { DragMouseEvent } from '../../base/browser/mouseEvent.js';
import { IListDragAndDrop } from '../../base/browser/ui/list/list.js';
import { ListViewTargetSector } from '../../base/browser/ui/list/listView.js';
import { ITreeDragOverReaction } from '../../base/browser/ui/tree/tree.js';
import { VSDataTransfer } from '../../base/common/dataTransfer.js';
import { Disposable, IDisposable } from '../../base/common/lifecycle.js';
import { URI } from '../../base/common/uri.js';
import { IDraggedResourceEditorInput, IResourceStat } from '../../platform/dnd/browser/dnd.js';
import { IFileService } from '../../platform/files/common/files.js';
import { IInstantiationService, ServicesAccessor } from '../../platform/instantiation/common/instantiation.js';
import { IWorkspaceContextService } from '../../platform/workspace/common/workspace.js';
import { IWorkspacesService } from '../../platform/workspaces/common/workspaces.js';
import { GroupIdentifier, IEditorIdentifier } from '../common/editor.js';
import { IEditorGroup } from '../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../services/editor/common/editorService.js';
import { IHostService } from '../services/host/browser/host.js';
import { IWorkspaceEditingService } from '../services/workspaces/common/workspaceEditing.js';
import { IEditorOptions } from '../../platform/editor/common/editor.js';
export declare class DraggedEditorIdentifier {
    readonly identifier: IEditorIdentifier;
    constructor(identifier: IEditorIdentifier);
}
export declare class DraggedEditorGroupIdentifier {
    readonly identifier: GroupIdentifier;
    constructor(identifier: GroupIdentifier);
}
export declare function extractTreeDropData(dataTransfer: VSDataTransfer): Promise<Array<IDraggedResourceEditorInput>>;
export interface IResourcesDropHandlerOptions {
    /**
     * Whether we probe for the dropped resource to be a workspace
     * (i.e. code-workspace file or even a folder), allowing to
     * open it as workspace instead of opening as editor.
     */
    readonly allowWorkspaceOpen: boolean;
}
/**
 * Shared function across some components to handle drag & drop of resources.
 * E.g. of folders and workspace files to open them in the window instead of
 * the editor or to handle dirty editors being dropped between instances of Code.
 */
export declare class ResourcesDropHandler {
    private readonly options;
    private readonly fileService;
    private readonly workspacesService;
    private readonly editorService;
    private readonly workspaceEditingService;
    private readonly hostService;
    private readonly contextService;
    private readonly instantiationService;
    constructor(options: IResourcesDropHandlerOptions, fileService: IFileService, workspacesService: IWorkspacesService, editorService: IEditorService, workspaceEditingService: IWorkspaceEditingService, hostService: IHostService, contextService: IWorkspaceContextService, instantiationService: IInstantiationService);
    handleDrop(event: DragEvent, targetWindow: Window, resolveTargetGroup?: () => IEditorGroup | undefined, afterDrop?: (targetGroup: IEditorGroup | undefined) => void, options?: IEditorOptions): Promise<void>;
    private handleWorkspaceDrop;
}
export declare function fillEditorsDragData(accessor: ServicesAccessor, resources: URI[], event: DragMouseEvent | DragEvent, options?: {
    disableStandardTransfer: boolean;
}): void;
export declare function fillEditorsDragData(accessor: ServicesAccessor, resources: IResourceStat[], event: DragMouseEvent | DragEvent, options?: {
    disableStandardTransfer: boolean;
}): void;
export declare function fillEditorsDragData(accessor: ServicesAccessor, editors: IEditorIdentifier[], event: DragMouseEvent | DragEvent, options?: {
    disableStandardTransfer: boolean;
}): void;
export type Before2D = {
    readonly verticallyBefore: boolean;
    readonly horizontallyBefore: boolean;
};
export interface ICompositeDragAndDrop {
    drop(data: IDragAndDropData, target: string | undefined, originalEvent: DragEvent, before?: Before2D): void;
    onDragOver(data: IDragAndDropData, target: string | undefined, originalEvent: DragEvent): boolean;
    onDragEnter(data: IDragAndDropData, target: string | undefined, originalEvent: DragEvent): boolean;
}
export interface ICompositeDragAndDropObserverCallbacks {
    onDragEnter?: (e: IDraggedCompositeData) => void;
    onDragLeave?: (e: IDraggedCompositeData) => void;
    onDrop?: (e: IDraggedCompositeData) => void;
    onDragOver?: (e: IDraggedCompositeData) => void;
    onDragStart?: (e: IDraggedCompositeData) => void;
    onDragEnd?: (e: IDraggedCompositeData) => void;
}
export declare class CompositeDragAndDropData implements IDragAndDropData {
    private type;
    private id;
    constructor(type: 'view' | 'composite', id: string);
    update(dataTransfer: DataTransfer): void;
    getData(): {
        type: 'view' | 'composite';
        id: string;
    };
}
export interface IDraggedCompositeData {
    readonly eventData: DragEvent;
    readonly dragAndDropData: CompositeDragAndDropData;
}
export declare class DraggedCompositeIdentifier {
    private compositeId;
    constructor(compositeId: string);
    get id(): string;
}
export declare class DraggedViewIdentifier {
    private viewId;
    constructor(viewId: string);
    get id(): string;
}
export type ViewType = 'composite' | 'view';
export declare class CompositeDragAndDropObserver extends Disposable {
    private static instance;
    static get INSTANCE(): CompositeDragAndDropObserver;
    private readonly transferData;
    private readonly onDragStart;
    private readonly onDragEnd;
    private constructor();
    private readDragData;
    private writeDragData;
    registerTarget(element: HTMLElement, callbacks: ICompositeDragAndDropObserverCallbacks): IDisposable;
    registerDraggable(element: HTMLElement, draggedItemProvider: () => {
        type: ViewType;
        id: string;
    }, callbacks: ICompositeDragAndDropObserverCallbacks): IDisposable;
}
export declare function toggleDropEffect(dataTransfer: DataTransfer | null, dropEffect: 'none' | 'copy' | 'link' | 'move', shouldHaveIt: boolean): void;
export declare class ResourceListDnDHandler<T> implements IListDragAndDrop<T> {
    private readonly toResource;
    private readonly instantiationService;
    constructor(toResource: (e: T) => URI | null, instantiationService: IInstantiationService);
    getDragURI(element: T): string | null;
    getDragLabel(elements: T[]): string | undefined;
    onDragStart(data: IDragAndDropData, originalEvent: DragEvent): void;
    onDragOver(data: IDragAndDropData, targetElement: T, targetIndex: number, targetSector: ListViewTargetSector | undefined, originalEvent: DragEvent): boolean | ITreeDragOverReaction;
    drop(data: IDragAndDropData, targetElement: T, targetIndex: number, targetSector: ListViewTargetSector | undefined, originalEvent: DragEvent): void;
    dispose(): void;
}
/**
 * Returns whether the workbench is currently dragged over in any of
 * the opened windows (main windows and auxiliary windows).
 */
export declare function isWindowDraggedOver(): boolean;
