import { raceCancellation } from '../../../base/common/async.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { CancellationError } from '../../../base/common/errors.js';
import { toDisposable } from '../../../base/common/lifecycle.js';
import { revive } from '../../../base/common/marshalling.js';
import { generateUuid } from '../../../base/common/uuid.js';
import { MainContext } from './extHost.protocol.js';
import * as typeConvert from './extHostTypeConverters.js';
export class ExtHostLanguageModelTools {
    constructor(mainContext) {
        this._registeredTools = new Map();
        this._tokenCountFuncs = new Map();
        this._allTools = new Map();
        this._proxy = mainContext.getProxy(MainContext.MainThreadLanguageModelTools);
        this._proxy.$getTools().then(tools => {
            for (const tool of tools) {
                this._allTools.set(tool.id, revive(tool));
            }
        });
    }
    async $countTokensForInvocation(callId, input, token) {
        const fn = this._tokenCountFuncs.get(callId);
        if (!fn) {
            throw new Error(`Tool invocation call ${callId} not found`);
        }
        return await fn(input, token);
    }
    async invokeTool(toolId, options, token) {
        if (!options.requestedContentTypes?.length) {
            throw new Error('LanguageModelToolInvocationOptions.requestedContentTypes is required to be set');
        }
        const callId = generateUuid();
        if (options.tokenOptions) {
            this._tokenCountFuncs.set(callId, options.tokenOptions.countTokens);
        }
        try {
            const result = await this._proxy.$invokeTool({
                toolId,
                callId,
                parameters: options.parameters,
                tokenBudget: options.tokenOptions?.tokenBudget,
                context: options.toolInvocationToken,
                requestedContentTypes: options.requestedContentTypes,
            }, token);
            return result;
        }
        finally {
            this._tokenCountFuncs.delete(callId);
        }
    }
    $onDidChangeTools(tools) {
        this._allTools.clear();
        for (const tool of tools) {
            this._allTools.set(tool.id, tool);
        }
    }
    get tools() {
        return Array.from(this._allTools.values())
            .map(tool => typeConvert.LanguageModelToolDescription.to(tool));
    }
    async $invokeTool(dto, token) {
        const item = this._registeredTools.get(dto.toolId);
        if (!item) {
            throw new Error(`Unknown tool ${dto.toolId}`);
        }
        const options = { parameters: dto.parameters, toolInvocationToken: dto.context, requestedContentTypes: dto.requestedContentTypes };
        if (dto.tokenBudget !== undefined) {
            options.tokenOptions = {
                tokenBudget: dto.tokenBudget,
                countTokens: this._tokenCountFuncs.get(dto.callId) || ((value, token = CancellationToken.None) => this._proxy.$countTokensForInvocation(dto.callId, value, token))
            };
        }
        const extensionResult = await raceCancellation(Promise.resolve(item.tool.invoke(options, token)), token);
        if (!extensionResult) {
            throw new CancellationError();
        }
        for (const key of Object.keys(extensionResult)) {
            const value = extensionResult[key];
            if (value instanceof Promise) {
                throw new Error(`Tool result for '${key}' cannot be a Promise`);
            }
            else if (!options.requestedContentTypes.includes(key) && key !== 'toString') {
                throw new Error(`Tool result for '${key}' was not requested from ${dto.toolId}.`);
            }
        }
        return extensionResult;
    }
    async $provideToolConfirmationMessages(toolId, participantName, parameters, token) {
        const item = this._registeredTools.get(toolId);
        if (!item) {
            throw new Error(`Unknown tool ${toolId}`);
        }
        if (!item.tool.provideToolConfirmationMessages) {
            return undefined;
        }
        const result = await item.tool.provideToolConfirmationMessages({ participantName, parameters }, token);
        if (!result) {
            return undefined;
        }
        return {
            title: result.title,
            message: typeof result.message === 'string' ? result.message : typeConvert.MarkdownString.from(result.message),
        };
    }
    async $provideToolInvocationMessage(toolId, parameters, token) {
        const item = this._registeredTools.get(toolId);
        if (!item) {
            throw new Error(`Unknown tool ${toolId}`);
        }
        if (!item.tool.provideToolInvocationMessage) {
            return undefined;
        }
        return await item.tool.provideToolInvocationMessage(parameters, token);
    }
    registerTool(extension, id, tool) {
        this._registeredTools.set(id, { extension, tool });
        this._proxy.$registerTool(id);
        return toDisposable(() => {
            this._registeredTools.delete(id);
            this._proxy.$unregisterTool(id);
        });
    }
}
