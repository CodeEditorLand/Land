import { Disposable } from '../../../../../base/common/lifecycle.js';
import { Range } from '../../../core/range.js';
import { BracketInfo, BracketPairWithMinIndentationInfo, IFoundBracket } from '../../../textModelBracketPairs.js';
import { TextModel } from '../../textModel.js';
import { IModelContentChangedEvent, IModelTokensChangedEvent } from '../../../textModelEvents.js';
import { ResolvedLanguageConfiguration } from '../../../languages/languageConfigurationRegistry.js';
import { Position } from '../../../core/position.js';
import { CallbackIterable } from '../../../../../base/common/arrays.js';
export declare class BracketPairsTree extends Disposable {
    private readonly textModel;
    private readonly getLanguageConfiguration;
    private readonly didChangeEmitter;
    private initialAstWithoutTokens;
    private astWithTokens;
    private readonly denseKeyProvider;
    private readonly brackets;
    didLanguageChange(languageId: string): boolean;
    readonly onDidChange: import("../../../../../workbench/workbench.web.main.internal.js").Event<void>;
    private queuedTextEditsForInitialAstWithoutTokens;
    private queuedTextEdits;
    constructor(textModel: TextModel, getLanguageConfiguration: (languageId: string) => ResolvedLanguageConfiguration);
    handleDidChangeBackgroundTokenizationState(): void;
    handleDidChangeTokens({ ranges }: IModelTokensChangedEvent): void;
    handleContentChanged(change: IModelContentChangedEvent): void;
    private handleEdits;
    private flushQueue;
    /**
     * @pure (only if isPure = true)
    */
    private parseDocumentFromTextBuffer;
    getBracketsInRange(range: Range, onlyColorizedBrackets: boolean): CallbackIterable<BracketInfo>;
    getBracketPairsInRange(range: Range, includeMinIndentation: boolean): CallbackIterable<BracketPairWithMinIndentationInfo>;
    getFirstBracketAfter(position: Position): IFoundBracket | null;
    getFirstBracketBefore(position: Position): IFoundBracket | null;
}
