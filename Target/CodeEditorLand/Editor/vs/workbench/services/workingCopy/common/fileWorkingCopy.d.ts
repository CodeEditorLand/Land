import { IDisposable } from '../../../../base/common/lifecycle.js';
import { Event } from '../../../../base/common/event.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { VSBufferReadableStream } from '../../../../base/common/buffer.js';
import { URI } from '../../../../base/common/uri.js';
import { IWorkingCopy } from './workingCopy.js';
export interface IFileWorkingCopyModelFactory<M extends IFileWorkingCopyModel> {
    createModel(resource: URI, contents: VSBufferReadableStream, token: CancellationToken): Promise<M>;
}
export interface IFileWorkingCopyModelConfiguration {
    readonly backupDelay?: number;
}
export declare const enum SnapshotContext {
    Save = 1,
    Backup = 2
}
export interface IFileWorkingCopyModel extends IDisposable {
    readonly onDidChangeContent: Event<unknown>;
    readonly onWillDispose: Event<void>;
    readonly configuration?: IFileWorkingCopyModelConfiguration;
    snapshot(context: SnapshotContext, token: CancellationToken): Promise<VSBufferReadableStream>;
    update(contents: VSBufferReadableStream, token: CancellationToken): Promise<void>;
}
export interface IFileWorkingCopy<M extends IFileWorkingCopyModel> extends IWorkingCopy, IDisposable {
    readonly onDidRevert: Event<void>;
    readonly onWillDispose: Event<void>;
    readonly model: M | undefined;
    resolve(): Promise<void>;
    isResolved(): this is IResolvedFileWorkingCopy<M>;
}
export interface IResolvedFileWorkingCopy<M extends IFileWorkingCopyModel> extends IFileWorkingCopy<M> {
    readonly model: M;
}
