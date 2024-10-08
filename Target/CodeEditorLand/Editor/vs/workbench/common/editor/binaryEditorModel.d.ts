import { EditorModel } from './editorModel.js';
import { URI } from '../../../base/common/uri.js';
import { IFileService } from '../../../platform/files/common/files.js';
/**
 * An editor model that just represents a resource that can be loaded.
 */
export declare class BinaryEditorModel extends EditorModel {
    readonly resource: URI;
    private readonly name;
    private readonly fileService;
    private readonly mime;
    private size;
    private etag;
    constructor(resource: URI, name: string, fileService: IFileService);
    /**
     * The name of the binary resource.
     */
    getName(): string;
    /**
     * The size of the binary resource if known.
     */
    getSize(): number | undefined;
    /**
     * The mime of the binary resource if known.
     */
    getMime(): string;
    /**
     * The etag of the binary resource if known.
     */
    getETag(): string | undefined;
    resolve(): Promise<void>;
}
