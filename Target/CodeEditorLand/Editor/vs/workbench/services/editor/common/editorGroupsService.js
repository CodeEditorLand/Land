/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { isEditorInput } from '../../../common/editor.js';
export const IEditorGroupsService = createDecorator('editorGroupsService');
export function isEditorReplacement(replacement) {
    const candidate = replacement;
    return isEditorInput(candidate?.editor) && isEditorInput(candidate?.replacement);
}
export function isEditorGroup(obj) {
    const group = obj;
    return !!group && typeof group.id === 'number' && Array.isArray(group.editors);
}
//#region Editor Group Helpers
export function preferredSideBySideGroupDirection(configurationService) {
    const openSideBySideDirection = configurationService.getValue('workbench.editor.openSideBySideDirection');
    if (openSideBySideDirection === 'down') {
        return 1 /* GroupDirection.DOWN */;
    }
    return 3 /* GroupDirection.RIGHT */;
}
//#endregion
