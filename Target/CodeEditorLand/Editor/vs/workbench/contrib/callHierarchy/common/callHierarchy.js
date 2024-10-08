/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { LanguageFeatureRegistry } from '../../../../editor/common/languageFeatureRegistry.js';
import { URI } from '../../../../base/common/uri.js';
import { Position } from '../../../../editor/common/core/position.js';
import { isNonEmptyArray } from '../../../../base/common/arrays.js';
import { onUnexpectedExternalError } from '../../../../base/common/errors.js';
import { RefCountedDisposable } from '../../../../base/common/lifecycle.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { assertType } from '../../../../base/common/types.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
export const CallHierarchyProviderRegistry = new LanguageFeatureRegistry();
export class CallHierarchyModel {
    static async create(model, position, token) {
        const [provider] = CallHierarchyProviderRegistry.ordered(model);
        if (!provider) {
            return undefined;
        }
        const session = await provider.prepareCallHierarchy(model, position, token);
        if (!session) {
            return undefined;
        }
        return new CallHierarchyModel(session.roots.reduce((p, c) => p + c._sessionId, ''), provider, session.roots, new RefCountedDisposable(session));
    }
    constructor(id, provider, roots, ref) {
        this.id = id;
        this.provider = provider;
        this.roots = roots;
        this.ref = ref;
        this.root = roots[0];
    }
    dispose() {
        this.ref.release();
    }
    fork(item) {
        const that = this;
        return new class extends CallHierarchyModel {
            constructor() {
                super(that.id, that.provider, [item], that.ref.acquire());
            }
        };
    }
    async resolveIncomingCalls(item, token) {
        try {
            const result = await this.provider.provideIncomingCalls(item, token);
            if (isNonEmptyArray(result)) {
                return result;
            }
        }
        catch (e) {
            onUnexpectedExternalError(e);
        }
        return [];
    }
    async resolveOutgoingCalls(item, token) {
        try {
            const result = await this.provider.provideOutgoingCalls(item, token);
            if (isNonEmptyArray(result)) {
                return result;
            }
        }
        catch (e) {
            onUnexpectedExternalError(e);
        }
        return [];
    }
}
// --- API command support
const _models = new Map();
CommandsRegistry.registerCommand('_executePrepareCallHierarchy', async (accessor, ...args) => {
    const [resource, position] = args;
    assertType(URI.isUri(resource));
    assertType(Position.isIPosition(position));
    const modelService = accessor.get(IModelService);
    let textModel = modelService.getModel(resource);
    let textModelReference;
    if (!textModel) {
        const textModelService = accessor.get(ITextModelService);
        const result = await textModelService.createModelReference(resource);
        textModel = result.object.textEditorModel;
        textModelReference = result;
    }
    try {
        const model = await CallHierarchyModel.create(textModel, position, CancellationToken.None);
        if (!model) {
            return [];
        }
        //
        _models.set(model.id, model);
        _models.forEach((value, key, map) => {
            if (map.size > 10) {
                value.dispose();
                _models.delete(key);
            }
        });
        return [model.root];
    }
    finally {
        textModelReference?.dispose();
    }
});
function isCallHierarchyItemDto(obj) {
    return true;
}
CommandsRegistry.registerCommand('_executeProvideIncomingCalls', async (_accessor, ...args) => {
    const [item] = args;
    assertType(isCallHierarchyItemDto(item));
    // find model
    const model = _models.get(item._sessionId);
    if (!model) {
        return undefined;
    }
    return model.resolveIncomingCalls(item, CancellationToken.None);
});
CommandsRegistry.registerCommand('_executeProvideOutgoingCalls', async (_accessor, ...args) => {
    const [item] = args;
    assertType(isCallHierarchyItemDto(item));
    // find model
    const model = _models.get(item._sessionId);
    if (!model) {
        return undefined;
    }
    return model.resolveOutgoingCalls(item, CancellationToken.None);
});
