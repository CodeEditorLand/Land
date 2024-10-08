import { Event } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileOpenOptions, IFileChange, IFileSystemProvider, IStat, IWatchOptions } from '../../../../platform/files/common/files.js';
import { IDebugService, IDebugSession } from '../common/debug.js';
export declare class DebugMemoryFileSystemProvider implements IFileSystemProvider {
    private readonly debugService;
    private memoryFdCounter;
    private readonly fdMemory;
    private readonly changeEmitter;
    /** @inheritdoc */
    readonly onDidChangeCapabilities: Event<any>;
    /** @inheritdoc */
    readonly onDidChangeFile: Event<readonly IFileChange[]>;
    /** @inheritdoc */
    readonly capabilities: number;
    constructor(debugService: IDebugService);
    watch(resource: URI, opts: IWatchOptions): import("../../../../base/common/lifecycle.js").IDisposable;
    /** @inheritdoc */
    stat(file: URI): Promise<IStat>;
    /** @inheritdoc */
    mkdir(): never;
    /** @inheritdoc */
    readdir(): never;
    /** @inheritdoc */
    delete(): never;
    /** @inheritdoc */
    rename(): never;
    /** @inheritdoc */
    open(resource: URI, _opts: IFileOpenOptions): Promise<number>;
    /** @inheritdoc */
    close(fd: number): Promise<void>;
    /** @inheritdoc */
    writeFile(resource: URI, content: Uint8Array): Promise<void>;
    /** @inheritdoc */
    readFile(resource: URI): Promise<Uint8Array>;
    /** @inheritdoc */
    read(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    /** @inheritdoc */
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
