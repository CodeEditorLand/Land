import { IListService } from '../../../../platform/list/browser/listService.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IEditorGroup, IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
export interface IResolvedEditorCommandsContext {
    readonly groupedEditors: {
        readonly group: IEditorGroup;
        readonly editors: EditorInput[];
    }[];
    readonly preserveFocus: boolean;
}
export declare function resolveCommandsContext(commandArgs: unknown[], editorService: IEditorService, editorGroupsService: IEditorGroupsService, listService: IListService): IResolvedEditorCommandsContext;
