import { URI } from '../common/uri.js';
export declare function asCssValueWithDefault(cssPropertyValue: string | undefined, dflt: string): string;
export declare function asCSSPropertyValue(value: string): string;
/**
 * returns url('...')
 */
export declare function asCSSUrl(uri: URI | null | undefined): string;
