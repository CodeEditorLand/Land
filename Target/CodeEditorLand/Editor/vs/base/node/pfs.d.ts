import * as fs from 'fs';
export declare enum RimRafMode {
    UNLINK = 0,
    MOVE = 1
}
declare function rimraf(path: string, mode: RimRafMode.UNLINK): Promise<void>;
declare function rimraf(path: string, mode: RimRafMode.MOVE, moveToPath?: string): Promise<void>;
declare function rimraf(path: string, mode?: RimRafMode, moveToPath?: string): Promise<void>;
export declare function rimrafSync(path: string): void;
export interface IDirent {
    name: string;
    isFile(): boolean;
    isDirectory(): boolean;
    isSymbolicLink(): boolean;
}
declare function readdir(path: string): Promise<string[]>;
declare function readdir(path: string, options: {
    withFileTypes: true;
}): Promise<IDirent[]>;
export declare function readdirSync(path: string): string[];
declare function readDirsInDir(dirPath: string): Promise<string[]>;
export declare function whenDeleted(path: string, intervalMs?: number): Promise<void>;
export declare namespace SymlinkSupport {
    interface IStats {
        stat: fs.Stats;
        symbolicLink?: {
            dangling: boolean;
        };
    }
    function stat(path: string): Promise<IStats>;
    function existsFile(path: string): Promise<boolean>;
    function existsDirectory(path: string): Promise<boolean>;
}
declare function writeFile(path: string, data: string, options?: IWriteFileOptions): Promise<void>;
declare function writeFile(path: string, data: Buffer, options?: IWriteFileOptions): Promise<void>;
declare function writeFile(path: string, data: Uint8Array, options?: IWriteFileOptions): Promise<void>;
declare function writeFile(path: string, data: string | Buffer | Uint8Array, options?: IWriteFileOptions): Promise<void>;
interface IWriteFileOptions {
    mode?: number;
    flag?: string;
}
export declare function configureFlushOnWrite(enabled: boolean): void;
export declare function writeFileSync(path: string, data: string | Buffer, options?: IWriteFileOptions): void;
declare function rename(source: string, target: string, windowsRetryTimeout?: number | false): Promise<void>;
declare function copy(source: string, target: string, options: {
    preserveSymlinks: boolean;
}): Promise<void>;
export declare const Promises: {
    readonly read: (fd: number, buffer: Uint8Array, offset: number, length: number, position: number | null) => Promise<{
        bytesRead: number;
        buffer: Uint8Array;
    }>;
    readonly write: (fd: number, buffer: Uint8Array, offset: number | undefined | null, length: number | undefined | null, position: number | undefined | null) => Promise<{
        bytesWritten: number;
        buffer: Uint8Array;
    }>;
    readonly fdatasync: typeof fs.fdatasync.__promisify__;
    readonly open: typeof fs.open.__promisify__;
    readonly close: typeof fs.close.__promisify__;
    readonly realpath: typeof fs.realpath.__promisify__;
    exists(path: string): Promise<boolean>;
    readonly readdir: typeof readdir;
    readonly readDirsInDir: typeof readDirsInDir;
    readonly writeFile: typeof writeFile;
    readonly rm: typeof rimraf;
    readonly rename: typeof rename;
    readonly copy: typeof copy;
};
export {};
