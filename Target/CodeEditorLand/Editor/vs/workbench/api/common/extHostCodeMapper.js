/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as extHostProtocol from './extHost.protocol.js';
import { ChatAgentResult, DocumentContextItem, TextEdit } from './extHostTypeConverters.js';
import { URI } from '../../../base/common/uri.js';
export class ExtHostCodeMapper {
    static { this._providerHandlePool = 0; }
    constructor(mainContext) {
        this.providers = new Map();
        this._proxy = mainContext.getProxy(extHostProtocol.MainContext.MainThreadCodeMapper);
    }
    async $mapCode(handle, internalRequest, token) {
        // Received request to map code from the main thread
        const provider = this.providers.get(handle);
        if (!provider) {
            throw new Error(`Received request to map code for unknown provider handle ${handle}`);
        }
        // Construct a response object to pass to the provider
        const stream = {
            textEdit: (target, edits) => {
                edits = (Array.isArray(edits) ? edits : [edits]);
                this._proxy.$handleProgress(internalRequest.requestId, {
                    uri: target,
                    edits: edits.map(TextEdit.from)
                });
            }
        };
        const request = {
            codeBlocks: internalRequest.codeBlocks.map(block => {
                return {
                    code: block.code,
                    resource: URI.revive(block.resource),
                    markdownBeforeBlock: block.markdownBeforeBlock
                };
            }),
            conversation: internalRequest.conversation.map(item => {
                if (item.type === 'request') {
                    return {
                        type: 'request',
                        message: item.message
                    };
                }
                else {
                    return {
                        type: 'response',
                        message: item.message,
                        result: item.result ? ChatAgentResult.to(item.result) : undefined,
                        references: item.references?.map(DocumentContextItem.to)
                    };
                }
            })
        };
        const result = await provider.provideMappedEdits(request, stream, token);
        return result ?? null;
    }
    registerMappedEditsProvider(extension, provider) {
        const handle = ExtHostCodeMapper._providerHandlePool++;
        this._proxy.$registerCodeMapperProvider(handle);
        this.providers.set(handle, provider);
        return {
            dispose: () => {
                return this._proxy.$unregisterCodeMapperProvider(handle);
            }
        };
    }
}
