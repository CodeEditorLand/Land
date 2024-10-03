import { Event } from '../../../../../../base/common/event.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { INotebookFindScope } from '../../../common/notebookCommon.js';
export interface INotebookFindChangeEvent {
    markupInput?: boolean;
    markupPreview?: boolean;
    codeInput?: boolean;
    codeOutput?: boolean;
    findScope?: boolean;
}
export declare class NotebookFindFilters extends Disposable {
    private readonly _onDidChange;
    readonly onDidChange: Event<INotebookFindChangeEvent>;
    private _markupInput;
    get markupInput(): boolean;
    set markupInput(value: boolean);
    private _markupPreview;
    get markupPreview(): boolean;
    set markupPreview(value: boolean);
    private _codeInput;
    get codeInput(): boolean;
    set codeInput(value: boolean);
    private _codeOutput;
    get codeOutput(): boolean;
    set codeOutput(value: boolean);
    private _findScope;
    get findScope(): INotebookFindScope;
    set findScope(value: INotebookFindScope);
    private readonly _initialMarkupInput;
    private readonly _initialMarkupPreview;
    private readonly _initialCodeInput;
    private readonly _initialCodeOutput;
    constructor(markupInput: boolean, markupPreview: boolean, codeInput: boolean, codeOutput: boolean, findScope: INotebookFindScope);
    isModified(): boolean;
    update(v: NotebookFindFilters): void;
}
