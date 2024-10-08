import type * as vscode from 'vscode';
import { TerminalShellExecutionCommandLineConfidence } from './extHostTypes.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { type ExtHostTerminalShellIntegrationShape, type MainThreadTerminalShellIntegrationShape } from './extHost.protocol.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { IExtHostTerminalService } from './extHostTerminalService.js';
import { Emitter, type Event } from '../../../base/common/event.js';
import { type UriComponents } from '../../../base/common/uri.js';
export interface IExtHostTerminalShellIntegration extends ExtHostTerminalShellIntegrationShape {
    readonly _serviceBrand: undefined;
    readonly onDidChangeTerminalShellIntegration: Event<vscode.TerminalShellIntegrationChangeEvent>;
    readonly onDidStartTerminalShellExecution: Event<vscode.TerminalShellExecutionStartEvent>;
    readonly onDidEndTerminalShellExecution: Event<vscode.TerminalShellExecutionEndEvent>;
}
export declare const IExtHostTerminalShellIntegration: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostTerminalShellIntegration>;
export declare class ExtHostTerminalShellIntegration extends Disposable implements IExtHostTerminalShellIntegration {
    private readonly _extHostTerminalService;
    readonly _serviceBrand: undefined;
    protected _proxy: MainThreadTerminalShellIntegrationShape;
    private _activeShellIntegrations;
    protected readonly _onDidChangeTerminalShellIntegration: Emitter<vscode.TerminalShellIntegrationChangeEvent>;
    readonly onDidChangeTerminalShellIntegration: Event<vscode.TerminalShellIntegrationChangeEvent>;
    protected readonly _onDidStartTerminalShellExecution: Emitter<vscode.TerminalShellExecutionStartEvent>;
    readonly onDidStartTerminalShellExecution: Event<vscode.TerminalShellExecutionStartEvent>;
    protected readonly _onDidEndTerminalShellExecution: Emitter<vscode.TerminalShellExecutionEndEvent>;
    readonly onDidEndTerminalShellExecution: Event<vscode.TerminalShellExecutionEndEvent>;
    constructor(extHostRpc: IExtHostRpcService, _extHostTerminalService: IExtHostTerminalService);
    $shellIntegrationChange(instanceId: number): void;
    $shellExecutionStart(instanceId: number, commandLineValue: string, commandLineConfidence: TerminalShellExecutionCommandLineConfidence, isTrusted: boolean, cwd: UriComponents | undefined): void;
    $shellExecutionEnd(instanceId: number, commandLineValue: string, commandLineConfidence: TerminalShellExecutionCommandLineConfidence, isTrusted: boolean, exitCode: number | undefined): void;
    $shellExecutionData(instanceId: number, data: string): void;
    $cwdChange(instanceId: number, cwd: UriComponents | undefined): void;
    $closeTerminal(instanceId: number): void;
}
