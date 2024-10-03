import { IMarkerData } from '../../../platform/markers/common/markers.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
import type * as vscode from 'vscode';
import { MainThreadDiagnosticsShape, ExtHostDiagnosticsShape, IMainContext } from './extHost.protocol.js';
import { Event, Emitter } from '../../../base/common/event.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { ExtensionIdentifier } from '../../../platform/extensions/common/extensions.js';
import { IExtHostFileSystemInfo } from './extHostFileSystemInfo.js';
import { IExtUri } from '../../../base/common/resources.js';
import { ExtHostDocumentsAndEditors } from './extHostDocumentsAndEditors.js';
export declare class DiagnosticCollection implements vscode.DiagnosticCollection {
    #private;
    private readonly _name;
    private readonly _owner;
    private readonly _maxDiagnosticsTotal;
    private readonly _maxDiagnosticsPerFile;
    private readonly _modelVersionIdProvider;
    private _isDisposed;
    constructor(_name: string, _owner: string, _maxDiagnosticsTotal: number, _maxDiagnosticsPerFile: number, _modelVersionIdProvider: (uri: URI) => number | undefined, extUri: IExtUri, proxy: MainThreadDiagnosticsShape | undefined, onDidChangeDiagnostics: Emitter<readonly vscode.Uri[]>);
    dispose(): void;
    get name(): string;
    set(uri: vscode.Uri, diagnostics: ReadonlyArray<vscode.Diagnostic>): void;
    set(entries: ReadonlyArray<[vscode.Uri, ReadonlyArray<vscode.Diagnostic>]>): void;
    delete(uri: vscode.Uri): void;
    clear(): void;
    forEach(callback: (uri: URI, diagnostics: ReadonlyArray<vscode.Diagnostic>, collection: DiagnosticCollection) => any, thisArg?: any): void;
    [Symbol.iterator](): IterableIterator<[uri: vscode.Uri, diagnostics: readonly vscode.Diagnostic[]]>;
    get(uri: URI): ReadonlyArray<vscode.Diagnostic>;
    has(uri: URI): boolean;
    private _checkDisposed;
    private static _compareIndexedTuplesByUri;
}
export declare class ExtHostDiagnostics implements ExtHostDiagnosticsShape {
    private readonly _logService;
    private readonly _fileSystemInfoService;
    private readonly _extHostDocumentsAndEditors;
    private static _idPool;
    private static readonly _maxDiagnosticsPerFile;
    private static readonly _maxDiagnosticsTotal;
    private readonly _proxy;
    private readonly _collections;
    private readonly _onDidChangeDiagnostics;
    static _mapper(last: readonly vscode.Uri[]): {
        uris: readonly vscode.Uri[];
    };
    readonly onDidChangeDiagnostics: Event<vscode.DiagnosticChangeEvent>;
    constructor(mainContext: IMainContext, _logService: ILogService, _fileSystemInfoService: IExtHostFileSystemInfo, _extHostDocumentsAndEditors: ExtHostDocumentsAndEditors);
    createDiagnosticCollection(extensionId: ExtensionIdentifier, name?: string): vscode.DiagnosticCollection;
    getDiagnostics(resource: vscode.Uri): ReadonlyArray<vscode.Diagnostic>;
    getDiagnostics(): ReadonlyArray<[vscode.Uri, ReadonlyArray<vscode.Diagnostic>]>;
    getDiagnostics(resource?: vscode.Uri): ReadonlyArray<vscode.Diagnostic> | ReadonlyArray<[vscode.Uri, ReadonlyArray<vscode.Diagnostic>]>;
    private _getDiagnostics;
    private _mirrorCollection;
    $acceptMarkersChange(data: [UriComponents, IMarkerData[]][]): void;
}
