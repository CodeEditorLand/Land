import { IExtHostRpcService } from '../common/extHostRpcService.js';
import { BaseExtHostTerminalService, ITerminalInternalOptions } from '../common/extHostTerminalService.js';
import type * as vscode from 'vscode';
import { IExtHostCommands } from '../common/extHostCommands.js';
export declare class ExtHostTerminalService extends BaseExtHostTerminalService {
    constructor(extHostCommands: IExtHostCommands, extHostRpc: IExtHostRpcService);
    createTerminal(name?: string, shellPath?: string, shellArgs?: string[] | string): vscode.Terminal;
    createTerminalFromOptions(options: vscode.TerminalOptions, internalOptions?: ITerminalInternalOptions): vscode.Terminal;
}
