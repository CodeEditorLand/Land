import './media/singleeditortabscontrol.css';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { EditorTabsControl } from './editorTabsControl.js';
import { Dimension } from '../../../../base/browser/dom.js';
import { IEditorTitleControlDimensions } from './editorTitleControl.js';
import { IToolbarActions } from '../../../common/editor.js';
export declare class NoEditorTabsControl extends EditorTabsControl {
    private activeEditor;
    protected prepareEditorActions(editorActions: IToolbarActions): IToolbarActions;
    openEditor(editor: EditorInput): boolean;
    openEditors(editors: EditorInput[]): boolean;
    private handleOpenedEditors;
    private activeEditorChanged;
    beforeCloseEditor(editor: EditorInput): void;
    closeEditor(editor: EditorInput): void;
    closeEditors(editors: EditorInput[]): void;
    private handleClosedEditors;
    moveEditor(editor: EditorInput, fromIndex: number, targetIndex: number): void;
    pinEditor(editor: EditorInput): void;
    stickEditor(editor: EditorInput): void;
    unstickEditor(editor: EditorInput): void;
    setActive(isActive: boolean): void;
    updateEditorSelections(): void;
    updateEditorLabel(editor: EditorInput): void;
    updateEditorDirty(editor: EditorInput): void;
    getHeight(): number;
    layout(dimensions: IEditorTitleControlDimensions): Dimension;
}
