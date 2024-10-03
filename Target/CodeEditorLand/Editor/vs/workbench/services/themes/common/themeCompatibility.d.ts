import { ITextMateThemingRule, IColorMap } from './workbenchThemeService.js';
export declare function convertSettings(oldSettings: ITextMateThemingRule[], result: {
    textMateRules: ITextMateThemingRule[];
    colors: IColorMap;
}): void;
