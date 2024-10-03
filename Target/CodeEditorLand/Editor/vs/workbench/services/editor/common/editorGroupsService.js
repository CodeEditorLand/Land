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
export function preferredSideBySideGroupDirection(configurationService) {
    const openSideBySideDirection = configurationService.getValue('workbench.editor.openSideBySideDirection');
    if (openSideBySideDirection === 'down') {
        return 1;
    }
    return 3;
}
