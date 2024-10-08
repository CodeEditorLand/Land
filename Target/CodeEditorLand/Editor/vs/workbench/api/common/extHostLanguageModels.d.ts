import { CancellationToken } from '../../../base/common/cancellation.js';
import { SerializedError } from '../../../base/common/errors.js';
import { Event } from '../../../base/common/event.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { ExtensionIdentifier, IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { ExtHostLanguageModelsShape } from './extHost.protocol.js';
import { IExtHostAuthentication } from './extHostAuthentication.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { IChatMessage, IChatResponseFragment, ILanguageModelChatMetadata } from '../../contrib/chat/common/languageModels.js';
import type * as vscode from 'vscode';
export interface IExtHostLanguageModels extends ExtHostLanguageModels {
}
export declare const IExtHostLanguageModels: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostLanguageModels>;
export declare class ExtHostLanguageModels implements ExtHostLanguageModelsShape {
    private readonly _logService;
    private readonly _extHostAuthentication;
    _serviceBrand: undefined;
    private static _idPool;
    private readonly _proxy;
    private readonly _onDidChangeModelAccess;
    private readonly _onDidChangeProviders;
    readonly onDidChangeProviders: Event<void>;
    private readonly _languageModels;
    private readonly _allLanguageModelData;
    private readonly _modelAccessList;
    private readonly _pendingRequest;
    constructor(extHostRpc: IExtHostRpcService, _logService: ILogService, _extHostAuthentication: IExtHostAuthentication);
    dispose(): void;
    registerLanguageModel(extension: IExtensionDescription, identifier: string, provider: vscode.ChatResponseProvider, metadata: vscode.ChatResponseProviderMetadata): IDisposable;
    $startChatRequest(handle: number, requestId: number, from: ExtensionIdentifier, messages: IChatMessage[], options: vscode.LanguageModelChatRequestOptions, token: CancellationToken): Promise<void>;
    $provideTokenLength(handle: number, value: string, token: CancellationToken): Promise<number>;
    $acceptChatModelMetadata(data: {
        added?: {
            identifier: string;
            metadata: ILanguageModelChatMetadata;
        }[] | undefined;
        removed?: string[] | undefined;
    }): void;
    getLanguageModelByIdentifier(extension: IExtensionDescription, identifier: string): Promise<vscode.LanguageModelChat | undefined>;
    selectLanguageModels(extension: IExtensionDescription, selector: vscode.LanguageModelChatSelector): Promise<vscode.LanguageModelChat[]>;
    private _sendChatRequest;
    private _convertMessages;
    $acceptResponsePart(requestId: number, chunk: IChatResponseFragment): Promise<void>;
    $acceptResponseDone(requestId: number, error: SerializedError | undefined): Promise<void>;
    private _getAuthAccess;
    private _isUsingAuth;
    private _fakeAuthPopulate;
    private _computeTokenLength;
    $updateModelAccesslist(data: {
        from: ExtensionIdentifier;
        to: ExtensionIdentifier;
        enabled: boolean;
    }[]): void;
    private readonly _languageAccessInformationExtensions;
    createLanguageModelAccessInformation(from: Readonly<IExtensionDescription>): vscode.LanguageModelAccessInformation;
}
