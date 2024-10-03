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
export declare function getIndentActionForType(cursorConfig: CursorConfiguration, model: ITextModel, range: Range, ch: string, indentConverter: IIndentConverter, languageConfigurationService: ILanguageConfigurationService): string | null;
export declare function getIndentMetadata(model: ITextModel, lineNumber: number, languageConfigurationService: ILanguageConfigurationService): number | null;
