/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as DOM from '../../../../../../base/browser/dom.js';
import { Codicon } from '../../../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../../../base/common/themables.js';
import { localize } from '../../../../../../nls.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { EXPAND_CELL_OUTPUT_COMMAND_ID } from '../../notebookBrowser.js';
import { CellContentPart } from '../cellPart.js';
const $ = DOM.$;
let CollapsedCellOutput = class CollapsedCellOutput extends CellContentPart {
    constructor(notebookEditor, cellOutputCollapseContainer, keybindingService) {
        super();
        this.notebookEditor = notebookEditor;
        const placeholder = DOM.append(cellOutputCollapseContainer, $('span.expandOutputPlaceholder'));
        placeholder.textContent = localize('cellOutputsCollapsedMsg', "Outputs are collapsed");
        const expandIcon = DOM.append(cellOutputCollapseContainer, $('span.expandOutputIcon'));
        expandIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.more));
        const keybinding = keybindingService.lookupKeybinding(EXPAND_CELL_OUTPUT_COMMAND_ID);
        if (keybinding) {
            placeholder.title = localize('cellExpandOutputButtonLabelWithDoubleClick', "Double-click to expand cell output ({0})", keybinding.getLabel());
            cellOutputCollapseContainer.title = localize('cellExpandOutputButtonLabel', "Expand Cell Output (${0})", keybinding.getLabel());
        }
        DOM.hide(cellOutputCollapseContainer);
        this._register(DOM.addDisposableListener(expandIcon, DOM.EventType.CLICK, () => this.expand()));
        this._register(DOM.addDisposableListener(cellOutputCollapseContainer, DOM.EventType.DBLCLICK, () => this.expand()));
    }
    expand() {
        if (!this.currentCell) {
            return;
        }
        if (!this.currentCell) {
            return;
        }
        const textModel = this.notebookEditor.textModel;
        const index = textModel.cells.indexOf(this.currentCell.model);
        if (index < 0) {
            return;
        }
        this.currentCell.isOutputCollapsed = !this.currentCell.isOutputCollapsed;
    }
};
CollapsedCellOutput = __decorate([
    __param(2, IKeybindingService),
    __metadata("design:paramtypes", [Object, HTMLElement, Object])
], CollapsedCellOutput);
export { CollapsedCellOutput };
