import { IDisposable, Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { FileSystemProviderCapabilities, FileType, IFileChange, IFileDeleteOptions, IFileOverwriteOptions, IFileSystemProviderWithFileReadWriteCapability, IStat, IWatchOptions } from '../../../../platform/files/common/files.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare class SettingsFileSystemProvider extends Disposable implements IFileSystemProviderWithFileReadWriteCapability {
    private readonly preferencesService;
    private readonly logService;
    static readonly SCHEMA = "vscode";
    protected readonly _onDidChangeFile: Emitter<readonly IFileChange[]>;
    readonly onDidChangeFile: Event<readonly IFileChange[]>;
    constructor(preferencesService: IPreferencesService, logService: ILogService);
    readonly capabilities: FileSystemProviderCapabilities;
    readFile(uri: URI): Promise<Uint8Array>;
    stat(uri: URI): Promise<IStat>;
    readonly onDidChangeCapabilities: Event<any>;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    mkdir(resource: URI): Promise<void>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    writeFile(): Promise<void>;
    private getSchemaContent;
}
