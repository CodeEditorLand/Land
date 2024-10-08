import { ThemeIcon } from './themables.js';
export declare function register(id: string, fontCharacter: number | string): ThemeIcon;
/**
 * Only to be used by the iconRegistry.
 */
export declare function getCodiconFontCharacters(): {
    [id: string]: number;
};
