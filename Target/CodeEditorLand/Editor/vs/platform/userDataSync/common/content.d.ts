import { JSONPath } from '../../../base/common/json.js';
import { FormattingOptions } from '../../../base/common/jsonFormatter.js';
export declare function edit(content: string, originalPath: JSONPath, value: any, formattingOptions: FormattingOptions): string;
export declare function getLineStartOffset(content: string, eol: string, atOffset: number): number;
export declare function getLineEndOffset(content: string, eol: string, atOffset: number): number;
