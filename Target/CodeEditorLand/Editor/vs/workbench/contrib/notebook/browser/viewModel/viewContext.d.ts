import { IBaseCellEditorOptions } from '../notebookBrowser.js';
import { NotebookEventDispatcher } from './eventDispatcher.js';
import { NotebookOptions } from '../notebookOptions.js';
export declare class ViewContext {
    readonly notebookOptions: NotebookOptions;
    readonly eventDispatcher: NotebookEventDispatcher;
    readonly getBaseCellEditorOptions: (language: string) => IBaseCellEditorOptions;
    constructor(notebookOptions: NotebookOptions, eventDispatcher: NotebookEventDispatcher, getBaseCellEditorOptions: (language: string) => IBaseCellEditorOptions);
}
