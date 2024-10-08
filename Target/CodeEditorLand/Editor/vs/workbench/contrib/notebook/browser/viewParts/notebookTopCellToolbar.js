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
import * as DOM from '../../../../../base/browser/dom.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../../base/common/lifecycle.js';
import { MenuWorkbenchToolBar } from '../../../../../platform/actions/browser/toolbar.js';
import { IMenuService, MenuItemAction } from '../../../../../platform/actions/common/actions.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { NotebookOptions } from '../notebookOptions.js';
import { CodiconActionViewItem } from '../view/cellParts/cellActionView.js';
let ListTopCellToolbar = class ListTopCellToolbar extends Disposable {
    constructor(notebookEditor, notebookOptions, instantiationService, contextMenuService, menuService) {
        super();
        this.notebookEditor = notebookEditor;
        this.notebookOptions = notebookOptions;
        this.instantiationService = instantiationService;
        this.contextMenuService = contextMenuService;
        this.menuService = menuService;
        this.viewZone = this._register(new MutableDisposable());
        this._modelDisposables = this._register(new DisposableStore());
        this.topCellToolbarContainer = DOM.$('div');
        this.topCellToolbar = DOM.$('.cell-list-top-cell-toolbar-container');
        this.topCellToolbarContainer.appendChild(this.topCellToolbar);
        this._register(this.notebookEditor.onDidAttachViewModel(() => {
            this.updateTopToolbar();
        }));
        this._register(this.notebookOptions.onDidChangeOptions(e => {
            if (e.insertToolbarAlignment || e.insertToolbarPosition || e.cellToolbarLocation) {
                this.updateTopToolbar();
            }
        }));
    }
    updateTopToolbar() {
        const layoutInfo = this.notebookOptions.getLayoutConfiguration();
        this.viewZone.value = new DisposableStore();
        if (layoutInfo.insertToolbarPosition === 'hidden' || layoutInfo.insertToolbarPosition === 'notebookToolbar') {
            const height = this.notebookOptions.computeTopInsertToolbarHeight(this.notebookEditor.textModel?.viewType);
            if (height !== 0) {
                // reserve whitespace to avoid overlap with cell toolbar
                this.notebookEditor.changeViewZones(accessor => {
                    const id = accessor.addZone({
                        afterModelPosition: 0,
                        heightInPx: height,
                        domNode: DOM.$('div')
                    });
                    accessor.layoutZone(id);
                    this.viewZone.value?.add({
                        dispose: () => {
                            if (!this.notebookEditor.isDisposed) {
                                this.notebookEditor.changeViewZones(accessor => {
                                    accessor.removeZone(id);
                                });
                            }
                        }
                    });
                });
            }
            return;
        }
        this.notebookEditor.changeViewZones(accessor => {
            const height = this.notebookOptions.computeTopInsertToolbarHeight(this.notebookEditor.textModel?.viewType);
            const id = accessor.addZone({
                afterModelPosition: 0,
                heightInPx: height,
                domNode: this.topCellToolbarContainer
            });
            accessor.layoutZone(id);
            this.viewZone.value?.add({
                dispose: () => {
                    if (!this.notebookEditor.isDisposed) {
                        this.notebookEditor.changeViewZones(accessor => {
                            accessor.removeZone(id);
                        });
                    }
                }
            });
            DOM.clearNode(this.topCellToolbar);
            const toolbar = this.instantiationService.createInstance(MenuWorkbenchToolBar, this.topCellToolbar, this.notebookEditor.creationOptions.menuIds.cellTopInsertToolbar, {
                actionViewItemProvider: (action, options) => {
                    if (action instanceof MenuItemAction) {
                        const item = this.instantiationService.createInstance(CodiconActionViewItem, action, { hoverDelegate: options.hoverDelegate });
                        return item;
                    }
                    return undefined;
                },
                menuOptions: {
                    shouldForwardArgs: true
                },
                toolbarOptions: {
                    primaryGroup: (g) => /^inline/.test(g),
                },
                hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
            });
            if (this.notebookEditor.hasModel()) {
                toolbar.context = {
                    notebookEditor: this.notebookEditor
                };
            }
            this.viewZone.value?.add(toolbar);
            // update toolbar container css based on cell list length
            this.viewZone.value?.add(this.notebookEditor.onDidChangeModel(() => {
                this._modelDisposables.clear();
                if (this.notebookEditor.hasModel()) {
                    this._modelDisposables.add(this.notebookEditor.onDidChangeViewCells(() => {
                        this.updateClass();
                    }));
                    this.updateClass();
                }
            }));
            this.updateClass();
        });
    }
    updateClass() {
        if (this.notebookEditor.hasModel() && this.notebookEditor.getLength() === 0) {
            this.topCellToolbar.classList.add('emptyNotebook');
        }
        else {
            this.topCellToolbar.classList.remove('emptyNotebook');
        }
    }
};
ListTopCellToolbar = __decorate([
    __param(2, IInstantiationService),
    __param(3, IContextMenuService),
    __param(4, IMenuService),
    __metadata("design:paramtypes", [Object, NotebookOptions, Object, Object, Object])
], ListTopCellToolbar);
export { ListTopCellToolbar };
