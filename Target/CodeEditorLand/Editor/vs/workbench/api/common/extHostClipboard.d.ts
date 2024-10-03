import { IMainContext } from './extHost.protocol.js';
import type * as vscode from 'vscode';
export declare class ExtHostClipboard {
    readonly value: vscode.Clipboard;
    constructor(mainContext: IMainContext);
}
