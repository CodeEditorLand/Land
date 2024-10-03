export class ViewContext {
    constructor(notebookOptions, eventDispatcher, getBaseCellEditorOptions) {
        this.notebookOptions = notebookOptions;
        this.eventDispatcher = eventDispatcher;
        this.getBaseCellEditorOptions = getBaseCellEditorOptions;
    }
}
