import { Event } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileOpenOptions, IFileChange, IFileSystemProvider, IStat, IWatchOptions } from '../../../../platform/files/common/files.js';
import { IDebugService, IDebugSession } from '../common/debug.js';
export declare class DebugMemoryFileSystemProvider implements IFileSystemProvider {
    private readonly debugService;
    private memoryFdCounter;
    private readonly fdMemory;
    private readonly changeEmitter;
    readonly onDidChangeCapabilities: Event<any>;
    readonly onDidChangeFile: Event<readonly IFileChange[]>;
    readonly capabilities: number;
    constructor(debugService: IDebugService);
    watch(resource: URI, opts: IWatchOptions): import("../../../../base/common/lifecycle.js").IDisposable;
    stat(file: URI): Promise<IStat>;
    mkdir(): never;
    readdir(): never;
    delete(): never;
    rename(): never;
    open(resource: URI, _opts: IFileOpenOptions): Promise<number>;
    close(fd: number): Promise<void>;
    writeFile(resource: URI, content: Uint8Array): Promise<void>;
    readFile(resource: URI): Promise<Uint8Array>;
    read(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    write(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    protected parseUri(uri: URI): {
        session: IDebugSession;
        offset: {
            fromOffset: number;
            toOffset: number;
        } | undefined;
        readOnly: boolean;
        sessionId: string;
        memoryReference: string;
    };
}
