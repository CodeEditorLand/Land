import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { DocumentContextItem, TextEdit } from '../../../../editor/common/languages.js';
import { IChatAgentResult } from './chatAgents.js';
import { IChatResponseModel } from './chatModel.js';
import { IChatContentReference } from './chatService.js';
export interface ICodeMapperResponse {
    textEdit: (resource: URI, textEdit: TextEdit[]) => void;
}
export interface ICodeMapperCodeBlock {
    readonly code: string;
    readonly resource: URI;
    readonly markdownBeforeBlock?: string;
}
export interface ConversationRequest {
    readonly type: 'request';
    readonly message: string;
}
export interface ConversationResponse {
    readonly type: 'response';
    readonly message: string;
    readonly result?: IChatAgentResult;
    readonly references?: DocumentContextItem[];
}
export interface ICodeMapperRequest {
    readonly codeBlocks: ICodeMapperCodeBlock[];
    readonly conversation: (ConversationResponse | ConversationRequest)[];
}
export interface ICodeMapperResult {
    readonly errorMessage?: string;
}
export interface ICodeMapperProvider {
    mapCode(request: ICodeMapperRequest, response: ICodeMapperResponse, token: CancellationToken): Promise<ICodeMapperResult | undefined>;
}
export declare const ICodeMapperService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ICodeMapperService>;
export interface ICodeMapperService {
    readonly _serviceBrand: undefined;
    registerCodeMapperProvider(handle: number, provider: ICodeMapperProvider): IDisposable;
    mapCode(request: ICodeMapperRequest, response: ICodeMapperResponse, token: CancellationToken): Promise<ICodeMapperResult | undefined>;
    mapCodeFromResponse(responseModel: IChatResponseModel, response: ICodeMapperResponse, token: CancellationToken): Promise<ICodeMapperResult | undefined>;
}
export declare class CodeMapperService implements ICodeMapperService {
    _serviceBrand: undefined;
    private readonly providers;
    registerCodeMapperProvider(handle: number, provider: ICodeMapperProvider): IDisposable;
    mapCode(request: ICodeMapperRequest, response: ICodeMapperResponse, token: CancellationToken): Promise<ICodeMapperResult | undefined>;
    mapCodeFromResponse(responseModel: IChatResponseModel, response: ICodeMapperResponse, token: CancellationToken): Promise<ICodeMapperResult | undefined>;
}
export declare function getReferencesAsDocumentContext(res: readonly IChatContentReference[]): DocumentContextItem[];
