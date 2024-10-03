import { Color } from '../../../base/common/color.js';
import { Event } from '../../../base/common/event.js';
import { IJSONSchema } from '../../../base/common/jsonSchema.js';
import { IColorTheme } from './themeService.js';
export type ColorIdentifier = string;
export interface ColorContribution {
    readonly id: ColorIdentifier;
    readonly description: string;
    readonly defaults: ColorDefaults | ColorValue | null;
    readonly needsTransparency: boolean;
    readonly deprecationMessage: string | undefined;
}
export declare function asCssVariableName(colorIdent: ColorIdentifier): string;
export declare function asCssVariable(color: ColorIdentifier): string;
export declare function asCssVariableWithDefault(color: ColorIdentifier, defaultCssValue: string): string;
export declare const enum ColorTransformType {
    Darken = 0,
    Lighten = 1,
    Transparent = 2,
    Opaque = 3,
    OneOf = 4,
    LessProminent = 5,
    IfDefinedThenElse = 6
}
export type ColorTransform = {
    op: ColorTransformType.Darken;
    value: ColorValue;
    factor: number;
} | {
    op: ColorTransformType.Lighten;
    value: ColorValue;
    factor: number;
} | {
    op: ColorTransformType.Transparent;
    value: ColorValue;
    factor: number;
} | {
    op: ColorTransformType.Opaque;
    value: ColorValue;
    background: ColorValue;
} | {
    op: ColorTransformType.OneOf;
    values: readonly ColorValue[];
} | {
    op: ColorTransformType.LessProminent;
    value: ColorValue;
    background: ColorValue;
    factor: number;
    transparency: number;
} | {
    op: ColorTransformType.IfDefinedThenElse;
    if: ColorIdentifier;
    then: ColorValue;
    else: ColorValue;
};
export interface ColorDefaults {
    light: ColorValue | null;
    dark: ColorValue | null;
    hcDark: ColorValue | null;
    hcLight: ColorValue | null;
}
export declare function isColorDefaults(value: unknown): value is ColorDefaults;
export type ColorValue = Color | string | ColorIdentifier | ColorTransform;
export declare const Extensions: {
    ColorContribution: string;
};
export declare const DEFAULT_COLOR_CONFIG_VALUE = "default";
export interface IColorRegistry {
    readonly onDidChangeSchema: Event<void>;
    registerColor(id: string, defaults: ColorDefaults, description: string, needsTransparency?: boolean): ColorIdentifier;
    deregisterColor(id: string): void;
    getColors(): ColorContribution[];
    resolveDefaultColor(id: ColorIdentifier, theme: IColorTheme): Color | undefined;
    getColorSchema(): IJSONSchema;
    getColorReferenceSchema(): IJSONSchema;
    notifyThemeUpdate(theme: IColorTheme): void;
}
export declare function registerColor(id: string, defaults: ColorDefaults | ColorValue | null, description: string, needsTransparency?: boolean, deprecationMessage?: string): ColorIdentifier;
export declare function getColorRegistry(): IColorRegistry;
export declare function executeTransform(transform: ColorTransform, theme: IColorTheme): Color | undefined;
export declare function darken(colorValue: ColorValue, factor: number): ColorTransform;
export declare function lighten(colorValue: ColorValue, factor: number): ColorTransform;
export declare function transparent(colorValue: ColorValue, factor: number): ColorTransform;
export declare function opaque(colorValue: ColorValue, background: ColorValue): ColorTransform;
export declare function oneOf(...colorValues: ColorValue[]): ColorTransform;
export declare function ifDefinedThenElse(ifArg: ColorIdentifier, thenArg: ColorValue, elseArg: ColorValue): ColorTransform;
export declare function lessProminent(colorValue: ColorValue, backgroundColorValue: ColorValue, factor: number, transparency: number): ColorTransform;
export declare function resolveColorValue(colorValue: ColorValue | null, theme: IColorTheme): Color | undefined;
export declare const workbenchColorsSchemaId = "vscode://schemas/workbench-colors";
