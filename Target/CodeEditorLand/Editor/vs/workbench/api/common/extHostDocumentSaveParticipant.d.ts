import { Event } from '../../../base/common/event.js';
import { UriComponents } from '../../../base/common/uri.js';
import { ExtHostDocumentSaveParticipantShape, MainThreadBulkEditsShape } from './extHost.protocol.js';
import { ExtHostDocuments } from './extHostDocuments.js';
import { SaveReason } from '../../common/editor.js';
import type * as vscode from 'vscode';
import { ILogService } from '../../../platform/log/common/log.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
export declare class ExtHostDocumentSaveParticipant implements ExtHostDocumentSaveParticipantShape {
    private readonly _logService;
    private readonly _documents;
    private readonly _mainThreadBulkEdits;
    private readonly _thresholds;
    private readonly _callbacks;
    private readonly _badListeners;
    constructor(_logService: ILogService, _documents: ExtHostDocuments, _mainThreadBulkEdits: MainThreadBulkEditsShape, _thresholds?: {
        timeout: number;
        errors: number;
    });
    dispose(): void;
    getOnWillSaveTextDocumentEvent(extension: IExtensionDescription): Event<vscode.TextDocumentWillSaveEvent>;
    $participateInSave(data: UriComponents, reason: SaveReason): Promise<boolean[]>;
    private _deliverEventAsyncAndBlameBadListeners;
    private _deliverEventAsync;
}
