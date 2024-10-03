import { Event } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { ISaveOptions, IRevertOptions, SaveReason, SaveSource } from '../../../common/editor.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { VSBufferReadable, VSBufferReadableStream } from '../../../../base/common/buffer.js';
export declare const enum WorkingCopyCapabilities {
    None = 0,
    Untitled = 2,
    Scratchpad = 4
}
export interface IWorkingCopyBackup {
    meta?: IWorkingCopyBackupMeta;
    content?: VSBufferReadable | VSBufferReadableStream;
}
export interface IWorkingCopyBackupMeta {
    [key: string]: unknown;
    typeId?: never;
}
export declare const NO_TYPE_ID = "";
export interface IWorkingCopyIdentifier {
    readonly typeId: string;
    readonly resource: URI;
}
export interface IWorkingCopySaveEvent {
    readonly reason?: SaveReason;
    readonly source?: SaveSource;
}
export interface IWorkingCopy extends IWorkingCopyIdentifier {
    readonly name: string;
    readonly capabilities: WorkingCopyCapabilities;
    readonly onDidChangeDirty: Event<void>;
    readonly onDidChangeContent: Event<void>;
    readonly onDidSave: Event<IWorkingCopySaveEvent>;
    isDirty(): boolean;
    isModified(): boolean;
    readonly backupDelay?: number;
    backup(token: CancellationToken): Promise<IWorkingCopyBackup>;
    save(options?: ISaveOptions): Promise<boolean>;
    revert(options?: IRevertOptions): Promise<void>;
}
