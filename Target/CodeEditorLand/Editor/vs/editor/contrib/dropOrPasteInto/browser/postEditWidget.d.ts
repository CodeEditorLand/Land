import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import './postEditWidget.css';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { IBulkEditService } from '../../../browser/services/bulkEditService.js';
import { Range } from '../../../common/core/range.js';
import { DocumentDropEdit, DocumentPasteEdit } from '../../../common/languages.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
interface EditSet<Edit extends DocumentPasteEdit | DocumentDropEdit> {
    readonly activeEditIndex: number;
    readonly allEdits: ReadonlyArray<Edit>;
}
interface ShowCommand {
    readonly id: string;
    readonly label: string;
}
export declare class PostEditWidgetManager<T extends DocumentPasteEdit | DocumentDropEdit> extends Disposable {
    private readonly _id;
    private readonly _editor;
    private readonly _visibleContext;
    private readonly _showCommand;
    private readonly _instantiationService;
    private readonly _bulkEditService;
    private readonly _notificationService;
    private readonly _currentWidget;
    constructor(_id: string, _editor: ICodeEditor, _visibleContext: RawContextKey<boolean>, _showCommand: ShowCommand, _instantiationService: IInstantiationService, _bulkEditService: IBulkEditService, _notificationService: INotificationService);
    applyEditAndShowIfNeeded(ranges: readonly Range[], edits: EditSet<T>, canShowWidget: boolean, resolve: (edit: T, token: CancellationToken) => Promise<T>, token: CancellationToken): Promise<void>;
    show(range: Range, edits: EditSet<T>, onDidSelectEdit: (newIndex: number) => void): void;
    clear(): void;
    tryShowSelector(): void;
}
export {};
