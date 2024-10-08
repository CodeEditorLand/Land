import Severity from '../../../base/common/severity.js';
import type * as vscode from 'vscode';
import { IMainContext } from './extHost.protocol.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.js';
export declare class ExtHostMessageService {
    private readonly _logService;
    private _proxy;
    constructor(mainContext: IMainContext, _logService: ILogService);
    showMessage(extension: IExtensionDescription, severity: Severity, message: string, optionsOrFirstItem: vscode.MessageOptions | string | undefined, rest: string[]): Promise<string | undefined>;
    showMessage(extension: IExtensionDescription, severity: Severity, message: string, optionsOrFirstItem: vscode.MessageOptions | vscode.MessageItem | undefined, rest: vscode.MessageItem[]): Promise<vscode.MessageItem | undefined>;
    showMessage(extension: IExtensionDescription, severity: Severity, message: string, optionsOrFirstItem: vscode.MessageOptions | vscode.MessageItem | string | undefined, rest: Array<vscode.MessageItem | string>): Promise<string | vscode.MessageItem | undefined>;
}
