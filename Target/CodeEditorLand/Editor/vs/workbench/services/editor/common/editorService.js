/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { isEditorGroup } from './editorGroupsService.js';
export const IEditorService = createDecorator('editorService');
/**
 * Open an editor in the currently active group.
 */
export const ACTIVE_GROUP = -1;
/**
 * Open an editor to the side of the active group.
 */
export const SIDE_GROUP = -2;
/**
 * Open an editor in a new auxiliary window.
 */
export const AUX_WINDOW_GROUP = -3;
export function isPreferredGroup(obj) {
    const candidate = obj;
    return typeof obj === 'number' || isEditorGroup(candidate);
}
