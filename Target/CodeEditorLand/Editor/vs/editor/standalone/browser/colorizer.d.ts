import { ILanguageService } from '../../common/languages/language.js';
import { ITextModel } from '../../common/model.js';
import { IViewLineTokens } from '../../common/tokens/lineTokens.js';
import { IStandaloneThemeService } from '../common/standaloneTheme.js';
export interface IColorizerOptions {
    tabSize?: number;
}
export interface IColorizerElementOptions extends IColorizerOptions {
    theme?: string;
    mimeType?: string;
}
export declare class Colorizer {
    static colorizeElement(themeService: IStandaloneThemeService, languageService: ILanguageService, domNode: HTMLElement, options: IColorizerElementOptions): Promise<void>;
    static colorize(languageService: ILanguageService, text: string, languageId: string, options: IColorizerOptions | null | undefined): Promise<string>;
    static colorizeLine(line: string, mightContainNonBasicASCII: boolean, mightContainRTL: boolean, tokens: IViewLineTokens, tabSize?: number): string;
    static colorizeModelLine(model: ITextModel, lineNumber: number, tabSize?: number): string;
}
