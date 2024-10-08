import { UriComponents } from '../../../../../../base/common/uri.js';
import { LanguageId } from '../../../../../../editor/common/encodedTokenAttributes.js';
import { IModelChangedEvent } from '../../../../../../editor/common/model/mirrorTextModel.js';
import { IValidEmbeddedLanguagesMap, IValidTokenTypeMap } from '../../../common/TMScopeRegistry.js';
import type { IRawTheme, StackDiff } from 'vscode-textmate';
import { IRequestHandler, IWorkerServer } from '../../../../../../base/common/worker/simpleWorker.js';
/**
 * Defines the worker entry point. Must be exported and named `create`.
 * @skipMangle
 */
export declare function create(workerServer: IWorkerServer): TextMateTokenizationWorker;
export interface ICreateData {
    grammarDefinitions: IValidGrammarDefinitionDTO[];
    onigurumaWASMUri: string;
}
export interface IValidGrammarDefinitionDTO {
    location: UriComponents;
    language?: string;
    scopeName: string;
    embeddedLanguages: IValidEmbeddedLanguagesMap;
    tokenTypes: IValidTokenTypeMap;
    injectTo?: string[];
    balancedBracketSelectors: string[];
    unbalancedBracketSelectors: string[];
    sourceExtensionId?: string;
}
export interface StateDeltas {
    startLineNumber: number;
    stateDeltas: (StackDiff | null)[];
}
export declare class TextMateTokenizationWorker implements IRequestHandler {
    _requestHandlerBrand: any;
    private readonly _host;
    private readonly _models;
    private readonly _grammarCache;
    private _grammarFactory;
    constructor(workerServer: IWorkerServer);
    $init(_createData: ICreateData): Promise<void>;
    private _loadTMGrammarFactory;
    $acceptNewModel(data: IRawModelData): void;
    $acceptModelChanged(controllerId: number, e: IModelChangedEvent): void;
    $retokenize(controllerId: number, startLineNumber: number, endLineNumberExclusive: number): void;
    $acceptModelLanguageChanged(controllerId: number, newLanguageId: string, newEncodedLanguageId: LanguageId): void;
    $acceptRemovedModel(controllerId: number): void;
    $acceptTheme(theme: IRawTheme, colorMap: string[]): Promise<void>;
    $acceptMaxTokenizationLineLength(controllerId: number, value: number): void;
}
export interface IRawModelData {
    uri: UriComponents;
    versionId: number;
    lines: string[];
    EOL: string;
    languageId: string;
    encodedLanguageId: LanguageId;
    maxTokenizationLineLength: number;
    controllerId: number;
}
