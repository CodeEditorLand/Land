import { Range } from '../core/range.js';
import { ITextModel } from '../model.js';
import { IndentAction } from './languageConfiguration.js';
import { EditorAutoIndentStrategy } from '../config/editorOptions.js';
import { ILanguageConfigurationService } from './languageConfigurationRegistry.js';
import { IViewLineTokens } from '../tokens/lineTokens.js';
import { CursorConfiguration } from '../cursorCommon.js';
export interface IVirtualModel {
    tokenization: {
        getLineTokens(lineNumber: number): IViewLineTokens;
        getLanguageId(): string;
        getLanguageIdAtPosition(lineNumber: number, column: number): string;
        forceTokenization?(lineNumber: number): void;
    };
    getLineContent(lineNumber: number): string;
}
export interface IIndentConverter {
    shiftIndent(indentation: string): string;
    unshiftIndent(indentation: string): string;
    normalizeIndentation?(indentation: string): string;
}
/**
 * Get inherited indentation from above lines.
 * 1. Find the nearest preceding line which doesn't match unIndentedLinePattern.
 * 2. If this line matches indentNextLinePattern or increaseIndentPattern, it means that the indent level of `lineNumber` should be 1 greater than this line.
 * 3. If this line doesn't match any indent rules
 *   a. check whether the line above it matches indentNextLinePattern
 *   b. If not, the indent level of this line is the result
 *   c. If so, it means the indent of this line is *temporary*, go upward utill we find a line whose indent is not temporary (the same workflow a -> b -> c).
 * 4. Otherwise, we fail to get an inherited indent from aboves. Return null and we should not touch the indent of `lineNumber`
 *
 * This function only return the inherited indent based on above lines, it doesn't check whether current line should decrease or not.
 */
export declare function getInheritIndentForLine(autoIndent: EditorAutoIndentStrategy, model: IVirtualModel, lineNumber: number, honorIntentialIndent: boolean | undefined, languageConfigurationService: ILanguageConfigurationService): {
    indentation: string;
    action: IndentAction | null;
    line?: number;
} | null;
export declare function getGoodIndentForLine(autoIndent: EditorAutoIndentStrategy, virtualModel: IVirtualModel, languageId: string, lineNumber: number, indentConverter: IIndentConverter, languageConfigurationService: ILanguageConfigurationService): string | null;
export declare function getIndentForEnter(autoIndent: EditorAutoIndentStrategy, model: ITextModel, range: Range, indentConverter: IIndentConverter, languageConfigurationService: ILanguageConfigurationService): {
    beforeEnter: string;
    afterEnter: string;
} | null;
/**
 * We should always allow intentional indentation. It means, if users change the indentation of `lineNumber` and the content of
 * this line doesn't match decreaseIndentPattern, we should not adjust the indentation.
 */
export declare function getIndentActionForType(cursorConfig: CursorConfiguration, model: ITextModel, range: Range, ch: string, indentConverter: IIndentConverter, languageConfigurationService: ILanguageConfigurationService): string | null;
export declare function getIndentMetadata(model: ITextModel, lineNumber: number, languageConfigurationService: ILanguageConfigurationService): number | null;
