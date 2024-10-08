import type { IGrammar } from 'vscode-textmate';
export declare const ITextMateTokenizationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITextMateTokenizationService>;
export interface ITextMateTokenizationService {
    readonly _serviceBrand: undefined;
    createTokenizer(languageId: string): Promise<IGrammar | null>;
    startDebugMode(printFn: (str: string) => void, onStop: () => void): void;
}
