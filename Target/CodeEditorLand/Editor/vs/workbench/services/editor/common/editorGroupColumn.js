/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { preferredSideBySideGroupDirection } from './editorGroupsService.js';
import { ACTIVE_GROUP, SIDE_GROUP } from './editorService.js';
export function columnToEditorGroup(editorGroupService, configurationService, column = ACTIVE_GROUP) {
    if (column === ACTIVE_GROUP || column === SIDE_GROUP) {
        return column; // return early for when column is well known
    }
    let groupInColumn = editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)[column];
    // If a column is asked for that does not exist, we create up to 9 columns in accordance
    // to what `ViewColumn` provides and otherwise fallback to `SIDE_GROUP`.
    if (!groupInColumn && column < 9) {
        for (let i = 0; i <= column; i++) {
            const editorGroups = editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
            if (!editorGroups[i]) {
                editorGroupService.addGroup(editorGroups[i - 1], preferredSideBySideGroupDirection(configurationService));
            }
        }
        groupInColumn = editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)[column];
    }
    return groupInColumn?.id ?? SIDE_GROUP; // finally open to the side when group not found
}
export function editorGroupToColumn(editorGroupService, editorGroup) {
    const group = (typeof editorGroup === 'number') ? editorGroupService.getGroup(editorGroup) : editorGroup;
    return editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */).indexOf(group ?? editorGroupService.activeGroup);
}
