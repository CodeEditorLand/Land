/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import './media/singleeditortabscontrol.css';
import { EditorTabsControl } from './editorTabsControl.js';
import { Dimension } from '../../../../base/browser/dom.js';
export class NoEditorTabsControl extends EditorTabsControl {
    constructor() {
        super(...arguments);
        this.activeEditor = null;
    }
    prepareEditorActions(editorActions) {
        return {
            primary: [],
            secondary: []
        };
    }
    openEditor(editor) {
        return this.handleOpenedEditors();
    }
    openEditors(editors) {
        return this.handleOpenedEditors();
    }
    handleOpenedEditors() {
        const didChange = this.activeEditorChanged();
        this.activeEditor = this.tabsModel.activeEditor;
        return didChange;
    }
    activeEditorChanged() {
        if (!this.activeEditor && this.tabsModel.activeEditor || // active editor changed from null => editor
            this.activeEditor && !this.tabsModel.activeEditor || // active editor changed from editor => null
            (!this.activeEditor || !this.tabsModel.isActive(this.activeEditor)) // active editor changed from editorA => editorB
        ) {
            return true;
        }
        return false;
    }
    beforeCloseEditor(editor) { }
    closeEditor(editor) {
        this.handleClosedEditors();
    }
    closeEditors(editors) {
        this.handleClosedEditors();
    }
    handleClosedEditors() {
        this.activeEditor = this.tabsModel.activeEditor;
    }
    moveEditor(editor, fromIndex, targetIndex) { }
    pinEditor(editor) { }
    stickEditor(editor) { }
    unstickEditor(editor) { }
    setActive(isActive) { }
    updateEditorSelections() { }
    updateEditorLabel(editor) { }
    updateEditorDirty(editor) { }
    getHeight() {
        return 0;
    }
    layout(dimensions) {
        return new Dimension(dimensions.container.width, this.getHeight());
    }
}
