import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { UriComponents } from '../../../base/common/uri.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { ExtHostNotebookDocumentSaveParticipantShape, MainThreadBulkEditsShape } from './extHost.protocol.js';
import { ExtHostNotebookController } from './extHostNotebook.js';
import { SaveReason } from '../../common/editor.js';
import { NotebookDocumentWillSaveEvent } from 'vscode';
export declare class ExtHostNotebookDocumentSaveParticipant implements ExtHostNotebookDocumentSaveParticipantShape {
    private readonly _logService;
    private readonly _notebooksAndEditors;
    private readonly _mainThreadBulkEdits;
    private readonly _thresholds;
    private readonly _onWillSaveNotebookDocumentEvent;
    constructor(_logService: ILogService, _notebooksAndEditors: ExtHostNotebookController, _mainThreadBulkEdits: MainThreadBulkEditsShape, _thresholds?: {
        timeout: number;
        errors: number;
    });
    dispose(): void;
    getOnWillSaveNotebookDocumentEvent(extension: IExtensionDescription): Event<NotebookDocumentWillSaveEvent>;
    $participateInSave(resource: UriComponents, reason: SaveReason, token: CancellationToken): Promise<boolean>;
}
