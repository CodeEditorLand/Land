import { Disposable } from '../../../../../base/common/lifecycle.js';
import { NotebookCellStateChangedEvent, NotebookLayoutChangedEvent, NotebookMetadataChangedEvent, NotebookViewEvent } from '../notebookViewEvents.js';
export declare class NotebookEventDispatcher extends Disposable {
    private readonly _onDidChangeLayout;
    readonly onDidChangeLayout: import("../../../../workbench.web.main.internal.js").Event<NotebookLayoutChangedEvent>;
    private readonly _onDidChangeMetadata;
    readonly onDidChangeMetadata: import("../../../../workbench.web.main.internal.js").Event<NotebookMetadataChangedEvent>;
    private readonly _onDidChangeCellState;
    readonly onDidChangeCellState: import("../../../../workbench.web.main.internal.js").Event<NotebookCellStateChangedEvent>;
    emit(events: NotebookViewEvent[]): void;
}
