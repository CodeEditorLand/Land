/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT, CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, CONTEXT_CAN_VIEW_MEMORY, CONTEXT_VARIABLE_IS_READONLY, CONTEXT_DEBUG_TYPE } from './debug.js';
/**
 * Gets a context key overlay that has context for the given variable.
 */
export function getContextForVariable(parentContext, variable, additionalContext = []) {
    const session = variable.getSession();
    const contextKeys = [
        [CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT.key, variable.variableMenuContext || ''],
        [CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT.key, !!variable.evaluateName],
        [CONTEXT_CAN_VIEW_MEMORY.key, !!session?.capabilities.supportsReadMemoryRequest && variable.memoryReference !== undefined],
        [CONTEXT_VARIABLE_IS_READONLY.key, !!variable.presentationHint?.attributes?.includes('readOnly') || variable.presentationHint?.lazy],
        [CONTEXT_DEBUG_TYPE.key, session?.configuration.type],
        ...additionalContext,
    ];
    return parentContext.createOverlay(contextKeys);
}
