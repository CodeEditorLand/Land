/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { URI } from '../../../base/common/uri.js';
import { ApiCommand, ApiCommandArgument, ApiCommandResult } from './extHostCommands.js';
export class ExtHostInteractive {
    constructor(mainContext, _extHostNotebooks, _textDocumentsAndEditors, _commands, _logService) {
        this._extHostNotebooks = _extHostNotebooks;
        this._textDocumentsAndEditors = _textDocumentsAndEditors;
        this._commands = _commands;
        const openApiCommand = new ApiCommand('interactive.open', '_interactive.open', 'Open interactive window and return notebook editor and input URI', [
            new ApiCommandArgument('showOptions', 'Show Options', v => true, v => v),
            new ApiCommandArgument('resource', 'Interactive resource Uri', v => true, v => v),
            new ApiCommandArgument('controllerId', 'Notebook controller Id', v => true, v => v),
            new ApiCommandArgument('title', 'Interactive editor title', v => true, v => v)
        ], new ApiCommandResult('Notebook and input URI', (v) => {
            _logService.debug('[ExtHostInteractive] open iw with notebook editor id', v.notebookEditorId);
            if (v.notebookEditorId !== undefined) {
                const editor = this._extHostNotebooks.getEditorById(v.notebookEditorId);
                _logService.debug('[ExtHostInteractive] notebook editor found', editor.id);
                return { notebookUri: URI.revive(v.notebookUri), inputUri: URI.revive(v.inputUri), notebookEditor: editor.apiEditor };
            }
            _logService.debug('[ExtHostInteractive] notebook editor not found, uris for the interactive document', v.notebookUri, v.inputUri);
            return { notebookUri: URI.revive(v.notebookUri), inputUri: URI.revive(v.inputUri) };
        }));
        this._commands.registerApiCommand(openApiCommand);
    }
    $willAddInteractiveDocument(uri, eol, languageId, notebookUri) {
        this._textDocumentsAndEditors.acceptDocumentsAndEditorsDelta({
            addedDocuments: [{
                    EOL: eol,
                    lines: [''],
                    languageId: languageId,
                    uri: uri,
                    isDirty: false,
                    versionId: 1,
                }]
        });
    }
    $willRemoveInteractiveDocument(uri, notebookUri) {
        this._textDocumentsAndEditors.acceptDocumentsAndEditorsDelta({
            removedDocuments: [uri]
        });
    }
}
