import { IPosition } from '../core/position.js';
import type { TextModel } from './textModel.js';
import { TextModelPart } from './textModelPart.js';
import { ILanguageConfigurationService } from '../languages/languageConfigurationRegistry.js';
import { BracketGuideOptions, IActiveIndentGuideInfo, IGuidesTextModelPart, IndentGuide } from '../textModelGuides.js';
export declare class GuidesTextModelPart extends TextModelPart implements IGuidesTextModelPart {
    private readonly textModel;
    private readonly languageConfigurationService;
    constructor(textModel: TextModel, languageConfigurationService: ILanguageConfigurationService);
    private getLanguageConfiguration;
    private _computeIndentLevel;
    getActiveIndentGuide(lineNumber: number, minLineNumber: number, maxLineNumber: number): IActiveIndentGuideInfo;
    getLinesBracketGuides(startLineNumber: number, endLineNumber: number, activePosition: IPosition | null, options: BracketGuideOptions): IndentGuide[][];
    private getVisibleColumnFromPosition;
    getLinesIndentGuides(startLineNumber: number, endLineNumber: number): number[];
    private _getIndentLevelForWhitespaceLine;
}
export declare class BracketPairGuidesClassNames {
    readonly activeClassName = "indent-active";
    getInlineClassName(nestingLevel: number, nestingLevelOfEqualBracketType: number, independentColorPoolPerBracketType: boolean): string;
    getInlineClassNameOfLevel(level: number): string;
}
