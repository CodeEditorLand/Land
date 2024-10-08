import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../../base/common/observable.js';
import { ICodeEditor } from '../../../../../browser/editorBrowser.js';
import { ILanguageService } from '../../../../../common/languages/language.js';
import { ITextModel } from '../../../../../common/model.js';
import { LineTokens } from '../../../../../common/tokens/lineTokens.js';
import { LineDecoration } from '../../../../../common/viewLayout/lineDecorations.js';
import { GhostText, GhostTextReplacement } from '../../model/ghostText.js';
import './ghostTextView.css';
export interface IGhostTextWidgetModel {
    readonly targetTextModel: IObservable<ITextModel | undefined>;
    readonly ghostText: IObservable<GhostText | GhostTextReplacement | undefined>;
    readonly minReservedLineCount: IObservable<number>;
}
export declare class GhostTextView extends Disposable {
    private readonly _editor;
    private readonly _model;
    private readonly _languageService;
    private readonly _isDisposed;
    private readonly _editorObs;
    constructor(_editor: ICodeEditor, _model: IGhostTextWidgetModel, _languageService: ILanguageService);
    private readonly _useSyntaxHighlighting;
    private readonly uiState;
    private readonly decorations;
    private readonly additionalLinesWidget;
    ownsViewZone(viewZoneId: string): boolean;
}
export declare class AdditionalLinesWidget extends Disposable {
    private readonly editor;
    private readonly lines;
    private _viewZoneId;
    get viewZoneId(): string | undefined;
    private readonly editorOptionsChanged;
    constructor(editor: ICodeEditor, lines: IObservable<{
        targetTextModel: ITextModel;
        lineNumber: number;
        additionalLines: LineData[];
        minReservedLineCount: number;
    } | undefined>);
    dispose(): void;
    private clear;
    private updateLines;
}
export interface LineData {
    content: LineTokens;
    decorations: LineDecoration[];
}
export declare const ttPolicy: Pick<TrustedTypePolicy<Options>, "name" | "createHTML"> | undefined;
