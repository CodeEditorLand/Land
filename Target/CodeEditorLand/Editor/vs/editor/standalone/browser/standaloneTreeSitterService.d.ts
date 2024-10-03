import type { Parser } from '@vscode/tree-sitter-wasm';
import { Event } from '../../../base/common/event.js';
import { ITextModel } from '../../common/model.js';
import { ITreeSitterParseResult, ITreeSitterParserService } from '../../common/services/treeSitterParserService.js';
import { Range } from '../../common/core/range.js';
export declare class StandaloneTreeSitterParserService implements ITreeSitterParserService {
    getTree(content: string, languageId: string): Promise<Parser.Tree | undefined>;
    onDidUpdateTree: Event<{
        textModel: ITextModel;
        ranges: Range[];
    }>;
    readonly _serviceBrand: undefined;
    onDidAddLanguage: Event<{
        id: string;
        language: Parser.Language;
    }>;
    getOrInitLanguage(_languageId: string): Parser.Language | undefined;
    getParseResult(textModel: ITextModel): ITreeSitterParseResult | undefined;
}
