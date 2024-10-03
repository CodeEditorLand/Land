import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ExtHostDocuments } from './extHostDocuments.js';
import type * as vscode from 'vscode';
import { ExtHostCommentsShape, IMainContext } from './extHost.protocol.js';
import { ExtHostCommands } from './extHostCommands.js';
interface ExtHostComments {
    createCommentController(extension: IExtensionDescription, id: string, label: string): vscode.CommentController;
}
export declare function createExtHostComments(mainContext: IMainContext, commands: ExtHostCommands, documents: ExtHostDocuments): ExtHostCommentsShape & ExtHostComments;
export {};
