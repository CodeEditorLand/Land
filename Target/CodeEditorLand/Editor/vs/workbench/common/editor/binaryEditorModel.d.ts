import { EditorModel } from './editorModel.js';
import { URI } from '../../../base/common/uri.js';
import { IFileService } from '../../../platform/files/common/files.js';
export declare class BinaryEditorModel extends EditorModel {
    readonly resource: URI;
    private readonly name;
    private readonly fileService;
    private readonly mime;
    private size;
    private etag;
    constructor(resource: URI, name: string, fileService: IFileService);
    getName(): string;
    getSize(): number | undefined;
    getMime(): string;
    getETag(): string | undefined;
    resolve(): Promise<void>;
}
