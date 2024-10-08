import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IPreparedQuery } from '../../../../base/common/fuzzyScorer.js';
import { DisposableStore, IDisposable } from '../../../../base/common/lifecycle.js';
import { IRange } from '../../../common/core/range.js';
import { ITextModel } from '../../../common/model.js';
import { DocumentSymbol, SymbolKind } from '../../../common/languages.js';
import { IOutlineModelService } from '../../documentSymbols/browser/outlineModel.js';
import { AbstractEditorNavigationQuickAccessProvider, IEditorNavigationQuickAccessOptions, IQuickAccessTextEditorContext } from './editorNavigationQuickAccess.js';
import { IQuickPick, IQuickPickItem, IQuickPickSeparator } from '../../../../platform/quickinput/common/quickInput.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { IQuickAccessProviderRunOptions } from '../../../../platform/quickinput/common/quickAccess.js';
import { URI } from '../../../../base/common/uri.js';
export interface IGotoSymbolQuickPickItem extends IQuickPickItem {
    kind: SymbolKind;
    index: number;
    score?: number;
    uri?: URI;
    symbolName?: string;
    range?: {
        decoration: IRange;
        selection: IRange;
    };
}
export interface IGotoSymbolQuickAccessProviderOptions extends IEditorNavigationQuickAccessOptions {
    openSideBySideDirection?: () => undefined | 'right' | 'down';
    /**
     * A handler to invoke when an item is accepted for
     * this particular showing of the quick access.
     * @param item The item that was accepted.
     */
    readonly handleAccept?: (item: IQuickPickItem) => void;
}
export declare abstract class AbstractGotoSymbolQuickAccessProvider extends AbstractEditorNavigationQuickAccessProvider {
    private readonly _languageFeaturesService;
    private readonly _outlineModelService;
    static PREFIX: string;
    static SCOPE_PREFIX: string;
    static PREFIX_BY_CATEGORY: string;
    protected readonly options: IGotoSymbolQuickAccessProviderOptions;
    constructor(_languageFeaturesService: ILanguageFeaturesService, _outlineModelService: IOutlineModelService, options?: IGotoSymbolQuickAccessProviderOptions);
    protected provideWithoutTextEditor(picker: IQuickPick<IGotoSymbolQuickPickItem, {
        useSeparators: true;
    }>): IDisposable;
    protected provideWithTextEditor(context: IQuickAccessTextEditorContext, picker: IQuickPick<IGotoSymbolQuickPickItem, {
        useSeparators: true;
    }>, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): IDisposable;
    private doProvideWithoutEditorSymbols;
    private provideLabelPick;
    protected waitForLanguageSymbolRegistry(model: ITextModel, disposables: DisposableStore): Promise<boolean>;
    private doProvideWithEditorSymbols;
    protected doGetSymbolPicks(symbolsPromise: Promise<DocumentSymbol[]>, query: IPreparedQuery, options: {
        extraContainerLabel?: string;
    } | undefined, token: CancellationToken, model: ITextModel): Promise<Array<IGotoSymbolQuickPickItem | IQuickPickSeparator>>;
    private compareByScore;
    private compareByKindAndScore;
    protected getDocumentSymbols(document: ITextModel, token: CancellationToken): Promise<DocumentSymbol[]>;
}
