import { JSONPath } from './json.js';
import { Edit, FormattingOptions } from './jsonFormatter.js';
export declare function removeProperty(text: string, path: JSONPath, formattingOptions: FormattingOptions): Edit[];
export declare function setProperty(text: string, originalPath: JSONPath, value: any, formattingOptions: FormattingOptions, getInsertionIndex?: (properties: string[]) => number): Edit[];
export declare function withFormatting(text: string, edit: Edit, formattingOptions: FormattingOptions): Edit[];
export declare function applyEdit(text: string, edit: Edit): string;
export declare function applyEdits(text: string, edits: Edit[]): string;
