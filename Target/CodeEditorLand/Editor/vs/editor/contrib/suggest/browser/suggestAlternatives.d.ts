import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { ISelectedSuggestion } from './suggestWidget.js';
export declare class SuggestAlternatives {
    private readonly _editor;
    static readonly OtherSuggestions: RawContextKey<boolean>;
    private readonly _ckOtherSuggestions;
    private _index;
    private _model;
    private _acceptNext;
    private _listener;
    private _ignore;
    constructor(_editor: ICodeEditor, contextKeyService: IContextKeyService);
    dispose(): void;
    reset(): void;
    set({ model, index }: ISelectedSuggestion, acceptNext: (selected: ISelectedSuggestion) => any): void;
    private static _moveIndex;
    next(): void;
    prev(): void;
    private _move;
}
