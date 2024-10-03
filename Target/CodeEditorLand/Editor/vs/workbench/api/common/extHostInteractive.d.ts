import { UriComponents } from '../../../base/common/uri.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { ExtHostInteractiveShape, IMainContext } from './extHost.protocol.js';
import { ExtHostCommands } from './extHostCommands.js';
import { ExtHostDocumentsAndEditors } from './extHostDocumentsAndEditors.js';
import { ExtHostNotebookController } from './extHostNotebook.js';
export declare class ExtHostInteractive implements ExtHostInteractiveShape {
    private _extHostNotebooks;
    private _textDocumentsAndEditors;
    private _commands;
    constructor(mainContext: IMainContext, _extHostNotebooks: ExtHostNotebookController, _textDocumentsAndEditors: ExtHostDocumentsAndEditors, _commands: ExtHostCommands, _logService: ILogService);
    $willAddInteractiveDocument(uri: UriComponents, eol: string, languageId: string, notebookUri: UriComponents): void;
    $willRemoveInteractiveDocument(uri: UriComponents, notebookUri: UriComponents): void;
}
