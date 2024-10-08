import { DragMouseEvent } from '../../../base/browser/mouseEvent.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { URI } from '../../../base/common/uri.js';
import { IBaseTextResourceEditorInput } from '../../editor/common/editor.js';
import { ServicesAccessor } from '../../instantiation/common/instantiation.js';
export declare const CodeDataTransfers: {
    EDITORS: string;
    FILES: string;
};
export interface IDraggedResourceEditorInput extends IBaseTextResourceEditorInput {
    resource: URI | undefined;
    /**
     * A hint that the source of the dragged editor input
     * might not be the application but some external tool.
     */
    isExternal?: boolean;
    /**
     * Whether we probe for the dropped editor to be a workspace
     * (i.e. code-workspace file or even a folder), allowing to
     * open it as workspace instead of opening as editor.
     */
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
    /**
     * Registers a drag and drop contribution.
     */
    register(contribution: IDragAndDropContribution): void;
    /**
     * Returns all registered drag and drop contributions.
     */
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
/**
 * A singleton to store transfer data during drag & drop operations that are only valid within the application.
 */
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
/**
 * A helper to get access to Electrons `webUtils.getPathForFile` function
 * in a safe way without crashing the application when running in the web.
 */
export declare function getPathForFile(file: File): string | undefined;
export {};
