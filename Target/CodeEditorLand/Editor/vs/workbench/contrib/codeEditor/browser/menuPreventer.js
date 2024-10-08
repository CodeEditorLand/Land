/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from '../../../../base/common/lifecycle.js';
import { registerEditorContribution } from '../../../../editor/browser/editorExtensions.js';
/**
 * Prevents the top-level menu from showing up when doing Alt + Click in the editor
 */
export class MenuPreventer extends Disposable {
    static { this.ID = 'editor.contrib.menuPreventer'; }
    constructor(editor) {
        super();
        this._editor = editor;
        this._altListeningMouse = false;
        this._altMouseTriggered = false;
        // A global crossover handler to prevent menu bar from showing up
        // When <alt> is hold, we will listen to mouse events and prevent
        // the release event up <alt> if the mouse is triggered.
        this._register(this._editor.onMouseDown((e) => {
            if (this._altListeningMouse) {
                this._altMouseTriggered = true;
            }
        }));
        this._register(this._editor.onKeyDown((e) => {
            if (e.equals(512 /* KeyMod.Alt */)) {
                if (!this._altListeningMouse) {
                    this._altMouseTriggered = false;
                }
                this._altListeningMouse = true;
            }
        }));
        this._register(this._editor.onKeyUp((e) => {
            if (e.equals(512 /* KeyMod.Alt */)) {
                if (this._altMouseTriggered) {
                    e.preventDefault();
                }
                this._altListeningMouse = false;
                this._altMouseTriggered = false;
            }
        }));
    }
}
registerEditorContribution(MenuPreventer.ID, MenuPreventer, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
