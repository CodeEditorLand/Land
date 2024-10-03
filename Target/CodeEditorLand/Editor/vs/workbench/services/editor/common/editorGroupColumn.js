import { preferredSideBySideGroupDirection } from './editorGroupsService.js';
import { ACTIVE_GROUP, SIDE_GROUP } from './editorService.js';
export function columnToEditorGroup(editorGroupService, configurationService, column = ACTIVE_GROUP) {
    if (column === ACTIVE_GROUP || column === SIDE_GROUP) {
        return column;
    }
    let groupInColumn = editorGroupService.getGroups(2)[column];
    if (!groupInColumn && column < 9) {
        for (let i = 0; i <= column; i++) {
            const editorGroups = editorGroupService.getGroups(2);
            if (!editorGroups[i]) {
                editorGroupService.addGroup(editorGroups[i - 1], preferredSideBySideGroupDirection(configurationService));
            }
        }
        groupInColumn = editorGroupService.getGroups(2)[column];
    }
    return groupInColumn?.id ?? SIDE_GROUP;
}
export function editorGroupToColumn(editorGroupService, editorGroup) {
    const group = (typeof editorGroup === 'number') ? editorGroupService.getGroup(editorGroup) : editorGroup;
    return editorGroupService.getGroups(2).indexOf(group ?? editorGroupService.activeGroup);
}
