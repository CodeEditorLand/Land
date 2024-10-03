export interface ITreeViewsDnDService<T> {
    readonly _serviceBrand: undefined;
    removeDragOperationTransfer(uuid: string | undefined): Promise<T | undefined> | undefined;
    addDragOperationTransfer(uuid: string, transferPromise: Promise<T | undefined>): void;
}
export declare class TreeViewsDnDService<T> implements ITreeViewsDnDService<T> {
    _serviceBrand: undefined;
    private _dragOperations;
    removeDragOperationTransfer(uuid: string | undefined): Promise<T | undefined> | undefined;
    addDragOperationTransfer(uuid: string, transferPromise: Promise<T | undefined>): void;
}
export declare class DraggedTreeItemsIdentifier {
    readonly identifier: string;
    constructor(identifier: string);
}
