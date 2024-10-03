import { IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
export declare const IUndoRedoService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUndoRedoService>;
export declare const enum UndoRedoElementType {
    Resource = 0,
    Workspace = 1
}
export interface IResourceUndoRedoElement {
    readonly type: UndoRedoElementType.Resource;
    readonly resource: URI;
    readonly label: string;
    readonly code: string;
    readonly confirmBeforeUndo?: boolean;
    undo(): Promise<void> | void;
    redo(): Promise<void> | void;
}
export interface IWorkspaceUndoRedoElement {
    readonly type: UndoRedoElementType.Workspace;
    readonly resources: readonly URI[];
    readonly label: string;
    readonly code: string;
    readonly confirmBeforeUndo?: boolean;
    undo(): Promise<void> | void;
    redo(): Promise<void> | void;
    split?(): IResourceUndoRedoElement[];
    prepareUndoRedo?(): Promise<IDisposable> | IDisposable | void;
}
export type IUndoRedoElement = IResourceUndoRedoElement | IWorkspaceUndoRedoElement;
export interface IPastFutureElements {
    past: IUndoRedoElement[];
    future: IUndoRedoElement[];
}
export interface UriComparisonKeyComputer {
    getComparisonKey(uri: URI): string;
}
export declare class ResourceEditStackSnapshot {
    readonly resource: URI;
    readonly elements: number[];
    constructor(resource: URI, elements: number[]);
}
export declare class UndoRedoGroup {
    private static _ID;
    readonly id: number;
    private order;
    constructor();
    nextOrder(): number;
    static None: UndoRedoGroup;
}
export declare class UndoRedoSource {
    private static _ID;
    readonly id: number;
    private order;
    constructor();
    nextOrder(): number;
    static None: UndoRedoSource;
}
export interface IUndoRedoService {
    readonly _serviceBrand: undefined;
    registerUriComparisonKeyComputer(scheme: string, uriComparisonKeyComputer: UriComparisonKeyComputer): IDisposable;
    getUriComparisonKey(resource: URI): string;
    pushElement(element: IUndoRedoElement, group?: UndoRedoGroup, source?: UndoRedoSource): void;
    getLastElement(resource: URI): IUndoRedoElement | null;
    getElements(resource: URI): IPastFutureElements;
    setElementsValidFlag(resource: URI, isValid: boolean, filter: (element: IUndoRedoElement) => boolean): void;
    removeElements(resource: URI): void;
    createSnapshot(resource: URI): ResourceEditStackSnapshot;
    restoreSnapshot(snapshot: ResourceEditStackSnapshot): void;
    canUndo(resource: URI | UndoRedoSource): boolean;
    undo(resource: URI | UndoRedoSource): Promise<void> | void;
    canRedo(resource: URI | UndoRedoSource): boolean;
    redo(resource: URI | UndoRedoSource): Promise<void> | void;
}
