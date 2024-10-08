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
import { Action, Separator } from '../../../base/common/actions.js';
import { localize } from '../../../nls.js';
import { IWorkbenchLayoutService } from '../../services/layout/browser/layoutService.js';
import { IContextMenuService } from '../../../platform/contextview/browser/contextView.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { EventHelper, addDisposableListener, getActiveDocument, getWindow, isHTMLElement, isHTMLInputElement, isHTMLTextAreaElement } from '../../../base/browser/dom.js';
import { registerWorkbenchContribution2 } from '../../common/contributions.js';
import { isNative } from '../../../base/common/platform.js';
import { IClipboardService } from '../../../platform/clipboard/common/clipboardService.js';
import { StandardMouseEvent } from '../../../base/browser/mouseEvent.js';
import { Event as BaseEvent } from '../../../base/common/event.js';
import { Lazy } from '../../../base/common/lazy.js';
let TextInputActionsProvider = class TextInputActionsProvider extends Disposable {
    static { this.ID = 'workbench.contrib.textInputActionsProvider'; }
    constructor(layoutService, contextMenuService, clipboardService) {
        super();
        this.layoutService = layoutService;
        this.contextMenuService = contextMenuService;
        this.clipboardService = clipboardService;
        this.textInputActions = new Lazy(() => this.createActions());
        this.registerListeners();
    }
    createActions() {
        return [
            // Undo/Redo
            new Action('undo', localize('undo', "Undo"), undefined, true, async () => getActiveDocument().execCommand('undo')),
            new Action('redo', localize('redo', "Redo"), undefined, true, async () => getActiveDocument().execCommand('redo')),
            new Separator(),
            // Cut / Copy / Paste
            new Action('editor.action.clipboardCutAction', localize('cut', "Cut"), undefined, true, async () => getActiveDocument().execCommand('cut')),
            new Action('editor.action.clipboardCopyAction', localize('copy', "Copy"), undefined, true, async () => getActiveDocument().execCommand('copy')),
            new Action('editor.action.clipboardPasteAction', localize('paste', "Paste"), undefined, true, async (element) => {
                // Native: paste is supported
                if (isNative) {
                    getActiveDocument().execCommand('paste');
                }
                // Web: paste is not supported due to security reasons
                else {
                    const clipboardText = await this.clipboardService.readText();
                    if (isHTMLTextAreaElement(element) ||
                        isHTMLInputElement(element)) {
                        const selectionStart = element.selectionStart || 0;
                        const selectionEnd = element.selectionEnd || 0;
                        element.value = `${element.value.substring(0, selectionStart)}${clipboardText}${element.value.substring(selectionEnd, element.value.length)}`;
                        element.selectionStart = selectionStart + clipboardText.length;
                        element.selectionEnd = element.selectionStart;
                        element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                    }
                }
            }),
            new Separator(),
            // Select All
            new Action('editor.action.selectAll', localize('selectAll', "Select All"), undefined, true, async () => getActiveDocument().execCommand('selectAll'))
        ];
    }
    registerListeners() {
        // Context menu support in input/textarea
        this._register(BaseEvent.runAndSubscribe(this.layoutService.onDidAddContainer, ({ container, disposables }) => {
            disposables.add(addDisposableListener(container, 'contextmenu', e => this.onContextMenu(getWindow(container), e)));
        }, { container: this.layoutService.mainContainer, disposables: this._store }));
    }
    onContextMenu(targetWindow, e) {
        if (e.defaultPrevented) {
            return; // make sure to not show these actions by accident if component indicated to prevent
        }
        const target = e.target;
        if (!(isHTMLElement(target)) || (target.nodeName.toLowerCase() !== 'input' && target.nodeName.toLowerCase() !== 'textarea')) {
            return; // only for inputs or textareas
        }
        EventHelper.stop(e, true);
        const event = new StandardMouseEvent(targetWindow, e);
        this.contextMenuService.showContextMenu({
            getAnchor: () => event,
            getActions: () => this.textInputActions.value,
            getActionsContext: () => target,
        });
    }
};
TextInputActionsProvider = __decorate([
    __param(0, IWorkbenchLayoutService),
    __param(1, IContextMenuService),
    __param(2, IClipboardService),
    __metadata("design:paramtypes", [Object, Object, Object])
], TextInputActionsProvider);
export { TextInputActionsProvider };
registerWorkbenchContribution2(TextInputActionsProvider.ID, TextInputActionsProvider, 2 /* WorkbenchPhase.BlockRestore */);
