import './codelensWidget.css';
import { IActiveCodeEditor, IViewZoneChangeAccessor } from '../../../browser/editorBrowser.js';
import { IModelDecorationsChangeAccessor, IModelDeltaDecoration, ITextModel } from '../../../common/model.js';
import { CodeLens, Command } from '../../../common/languages.js';
import { CodeLensItem } from './codelens.js';
export interface IDecorationIdCallback {
    (decorationId: string): void;
}
export declare class CodeLensHelper {
    private readonly _removeDecorations;
    private readonly _addDecorations;
    private readonly _addDecorationsCallbacks;
    constructor();
    addDecoration(decoration: IModelDeltaDecoration, callback: IDecorationIdCallback): void;
    removeDecoration(decorationId: string): void;
    commit(changeAccessor: IModelDecorationsChangeAccessor): void;
}
export declare class CodeLensWidget {
    private readonly _editor;
    private readonly _viewZone;
    private readonly _viewZoneId;
    private _contentWidget?;
    private _decorationIds;
    private _data;
    private _isDisposed;
    constructor(data: CodeLensItem[], editor: IActiveCodeEditor, helper: CodeLensHelper, viewZoneChangeAccessor: IViewZoneChangeAccessor, heightInPx: number, updateCallback: () => void);
    private _createContentWidgetIfNecessary;
    dispose(helper: CodeLensHelper, viewZoneChangeAccessor?: IViewZoneChangeAccessor): void;
    isDisposed(): boolean;
    isValid(): boolean;
    updateCodeLensSymbols(data: CodeLensItem[], helper: CodeLensHelper): void;
    updateHeight(height: number, viewZoneChangeAccessor: IViewZoneChangeAccessor): void;
    computeIfNecessary(model: ITextModel): CodeLensItem[] | null;
    updateCommands(symbols: Array<CodeLens | undefined | null>): void;
    getCommand(link: HTMLLinkElement): Command | undefined;
    getLineNumber(): number;
    update(viewZoneChangeAccessor: IViewZoneChangeAccessor): void;
    getItems(): CodeLensItem[];
}
