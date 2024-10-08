import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IValidGrammarDefinition } from './TMScopeRegistry.js';
import type { IGrammar, IOnigLib, IRawTheme, StateStack } from 'vscode-textmate';
interface ITMGrammarFactoryHost {
    logTrace(msg: string): void;
    logError(msg: string, err: any): void;
    readFile(resource: URI): Promise<string>;
}
export interface ICreateGrammarResult {
    languageId: string;
    grammar: IGrammar | null;
    initialState: StateStack;
    containsEmbeddedLanguages: boolean;
    sourceExtensionId?: string;
}
export declare const missingTMGrammarErrorMessage = "No TM Grammar registered for this language.";
export declare class TMGrammarFactory extends Disposable {
    private readonly _host;
    private readonly _initialState;
    private readonly _scopeRegistry;
    private readonly _injections;
    private readonly _injectedEmbeddedLanguages;
    private readonly _languageToScope;
    private readonly _grammarRegistry;
    constructor(host: ITMGrammarFactoryHost, grammarDefinitions: IValidGrammarDefinition[], vscodeTextmate: typeof import('vscode-textmate'), onigLib: Promise<IOnigLib>);
    has(languageId: string): boolean;
    setTheme(theme: IRawTheme, colorMap: string[]): void;
    getColorMap(): string[];
    createGrammar(languageId: string, encodedLanguageId: number): Promise<ICreateGrammarResult>;
}
export {};
