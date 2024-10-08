import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { GroupIdentifier } from '../../../common/editor.js';
import { IEditorGroupsService, IEditorGroup } from './editorGroupsService.js';
import { ACTIVE_GROUP_TYPE, SIDE_GROUP_TYPE } from './editorService.js';
/**
 * A way to address editor groups through a column based system
 * where `0` is the first column. Will fallback to `SIDE_GROUP`
 * in case the column is invalid.
 */
export type EditorGroupColumn = number;
export declare function columnToEditorGroup(editorGroupService: IEditorGroupsService, configurationService: IConfigurationService, column?: number): GroupIdentifier | ACTIVE_GROUP_TYPE | SIDE_GROUP_TYPE;
export declare function editorGroupToColumn(editorGroupService: IEditorGroupsService, editorGroup: IEditorGroup | GroupIdentifier): EditorGroupColumn;
