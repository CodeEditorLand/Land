import { CancellationToken } from '../common/cancellation.js';
export declare const CorruptZipMessage: string;
export interface IExtractOptions {
    overwrite?: boolean;
    /**
     * Source path within the ZIP archive. Only the files contained in this
     * path will be extracted.
     */
    sourcePath?: string;
}
export type ExtractErrorType = 'CorruptZip' | 'Incomplete';
export declare class ExtractError extends Error {
    readonly type?: ExtractErrorType;
    constructor(type: ExtractErrorType | undefined, cause: Error);
}
export interface IFile {
    path: string;
    contents?: Buffer | string;
    localPath?: string;
}
export declare function zip(zipPath: string, files: IFile[]): Promise<string>;
export declare function extract(zipPath: string, targetPath: string, options: IExtractOptions | undefined, token: CancellationToken): Promise<void>;
export declare function buffer(zipPath: string, filePath: string): Promise<Buffer>;
