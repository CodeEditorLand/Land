import { DragMouseEvent } from '../../../base/browser/mouseEvent.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { URI } from '../../../base/common/uri.js';
import { IBaseTextResourceEditorInput } from '../../editor/common/editor.js';
import { ServicesAccessor } from '../../instantiation/common/instantiation.js';
export interface FileAdditionalNativeProperties {
    readonly path?: string;
}
export declare const CodeDataTransfers: {
    EDITORS: string;
    FILES: string;
};
export interface IDraggedResourceEditorInput extends IBaseTextResourceEditorInput {
    resource: URI | undefined;
    isExternal?: boolean;
    allowWorkspaceOpen?: boolean;
}
export declare function extractEditorsDropData(e: DragEvent): Array<IDraggedResourceEditorInput>;
export declare function extractEditorsAndFilesDropData(accessor: ServicesAccessor, e: DragEvent): Promise<Array<IDraggedResourceEditorInput>>;
export declare function createDraggedEditorInputFromRawResourcesData(rawResourcesData: string | undefined): IDraggedResourceEditorInput[];
interface IFileTransferData {
    resource: URI;
    isDirectory?: boolean;
    contents?: VSBuffer;
}
export declare function extractFileListData(accessor: ServicesAccessor, files: FileList): Promise<IFileTransferData[]>;
export declare function containsDragType(event: DragEvent, ...dragTypesToFind: string[]): boolean;
export interface IResourceStat {
    resource: URI;
    isDirectory?: boolean;
}
export interface IDragAndDropContributionRegistry {
    register(contribution: IDragAndDropContribution): void;
    getAll(): IterableIterator<IDragAndDropContribution>;
}
interface IDragAndDropContribution {
    readonly dataFormatKey: string;
    getEditorInputs(data: string): IDraggedResourceEditorInput[];
    setData(resources: IResourceStat[], event: DragMouseEvent | DragEvent): void;
}
export declare const Extensions: {
    DragAndDropContribution: string;
};
export declare class LocalSelectionTransfer<T> {
    private static readonly INSTANCE;
    private data?;
    private proto?;
    private constructor();
    static getInstance<T>(): LocalSelectionTransfer<T>;
    hasData(proto: T): boolean;
    clearData(proto: T): void;
    getData(proto: T): T[] | undefined;
    setData(data: T[], proto: T): void;
}
export {};
