import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { isEditorGroup } from './editorGroupsService.js';
export const IEditorService = createDecorator('editorService');
export const ACTIVE_GROUP = -1;
export const SIDE_GROUP = -2;
export const AUX_WINDOW_GROUP = -3;
export function isPreferredGroup(obj) {
    const candidate = obj;
    return typeof obj === 'number' || isEditorGroup(candidate);
}
