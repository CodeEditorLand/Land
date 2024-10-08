import { VSBuffer, VSBufferReadableStream, VSBufferWriteableStream } from '../../../../base/common/buffer.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { StoredValue } from './storedValue.js';
import { HydratedTestResult, ITestResult } from './testResult.js';
import { ISerializedTestResults } from './testTypes.js';
export declare const RETAIN_MAX_RESULTS = 128;
export interface ITestResultStorage {
    _serviceBrand: undefined;
    /**
     * Retrieves the list of stored test results.
     */
    read(): Promise<HydratedTestResult[]>;
    /**
     * Persists the list of test results.
     */
    persist(results: ReadonlyArray<ITestResult>): Promise<void>;
}
export declare const ITestResultStorage: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<unknown>;
export declare abstract class BaseTestResultStorage extends Disposable implements ITestResultStorage {
    private readonly uriIdentityService;
    private readonly storageService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    protected readonly stored: StoredValue<readonly {
        rev: number;
        id: string;
        bytes: number;
    }[]>;
    constructor(uriIdentityService: IUriIdentityService, storageService: IStorageService, logService: ILogService);
    /**
     * @override
     */
    read(): Promise<HydratedTestResult[]>;
    /**
     * @override
     */
    getResultOutputWriter(resultId: string): import("../../../../base/common/stream.js").WriteableStream<VSBuffer>;
    /**
     * @override
     */
    persist(results: ReadonlyArray<ITestResult>): Promise<void>;
    /**
     * Reads serialized results for the test. Is allowed to throw.
     */
    protected abstract readForResultId(id: string): Promise<ISerializedTestResults | undefined>;
    /**
     * Reads output as a stream for the test.
     */
    protected abstract readOutputForResultId(id: string): Promise<VSBufferReadableStream>;
    /**
     * Reads an output range for the test.
     */
    protected abstract readOutputRangeForResultId(id: string, offset: number, length: number): Promise<VSBuffer>;
    /**
     * Deletes serialized results for the test.
     */
    protected abstract deleteForResultId(id: string): Promise<unknown>;
    /**
     * Stores test results by ID.
     */
    protected abstract storeForResultId(id: string, data: ISerializedTestResults): Promise<unknown>;
    /**
     * Reads serialized results for the test. Is allowed to throw.
     */
    protected abstract storeOutputForResultId(id: string, input: VSBufferWriteableStream): Promise<void>;
}
export declare class InMemoryResultStorage extends BaseTestResultStorage {
    readonly cache: Map<string, ISerializedTestResults>;
    protected readForResultId(id: string): Promise<ISerializedTestResults | undefined>;
    protected storeForResultId(id: string, contents: ISerializedTestResults): Promise<void>;
    protected deleteForResultId(id: string): Promise<void>;
    protected readOutputForResultId(id: string): Promise<VSBufferReadableStream>;
    protected storeOutputForResultId(id: string, input: VSBufferWriteableStream): Promise<void>;
    protected readOutputRangeForResultId(id: string, offset: number, length: number): Promise<VSBuffer>;
}
export declare class TestResultStorage extends BaseTestResultStorage {
    private readonly fileService;
    private readonly directory;
    constructor(uriIdentityService: IUriIdentityService, storageService: IStorageService, logService: ILogService, workspaceContext: IWorkspaceContextService, fileService: IFileService, environmentService: IEnvironmentService);
    protected readForResultId(id: string): Promise<any>;
    protected storeForResultId(id: string, contents: ISerializedTestResults): Promise<import("../../../../platform/files/common/files.js").IFileStatWithMetadata>;
    protected deleteForResultId(id: string): Promise<void | undefined>;
    protected readOutputRangeForResultId(id: string, offset: number, length: number): Promise<VSBuffer>;
    protected readOutputForResultId(id: string): Promise<VSBufferReadableStream>;
    protected storeOutputForResultId(id: string, input: VSBufferWriteableStream): Promise<void>;
    /**
     * @inheritdoc
     */
    persist(results: ReadonlyArray<ITestResult>): Promise<void>;
    /**
     * Cleans up orphaned files. For instance, output can get orphaned if it's
     * written but the editor is closed before the test run is complete.
     */
    private cleanupDereferenced;
    private getResultJsonPath;
    private getResultOutputPath;
}
