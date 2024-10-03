import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { Action2 } from '../../../../../platform/actions/common/actions.js';
export declare class NotebookIndentUsingTabs extends Action2 {
    static readonly ID = "notebook.action.indentUsingTabs";
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare class NotebookIndentUsingSpaces extends Action2 {
    static readonly ID = "notebook.action.indentUsingSpaces";
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare class NotebookChangeTabDisplaySize extends Action2 {
    static readonly ID = "notebook.action.changeTabDisplaySize";
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare class NotebookIndentationToSpacesAction extends Action2 {
    static readonly ID = "notebook.action.convertIndentationToSpaces";
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare class NotebookIndentationToTabsAction extends Action2 {
    static readonly ID = "notebook.action.convertIndentationToTabs";
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): void;
}
