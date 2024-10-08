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
import * as DOM from '../../../../base/browser/dom.js';
import { Action } from '../../../../base/common/actions.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import Messages from './messages.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Emitter } from '../../../../base/common/event.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { ActionViewItem } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { MarkersContextKeys } from '../common/markers.js';
import './markersViewActions.css';
export class MarkersFilters extends Disposable {
    constructor(options, contextKeyService) {
        super();
        this.contextKeyService = contextKeyService;
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this._excludedFiles = MarkersContextKeys.ShowExcludedFilesFilterContextKey.bindTo(this.contextKeyService);
        this._activeFile = MarkersContextKeys.ShowActiveFileFilterContextKey.bindTo(this.contextKeyService);
        this._showWarnings = MarkersContextKeys.ShowWarningsFilterContextKey.bindTo(this.contextKeyService);
        this._showErrors = MarkersContextKeys.ShowErrorsFilterContextKey.bindTo(this.contextKeyService);
        this._showInfos = MarkersContextKeys.ShowInfoFilterContextKey.bindTo(this.contextKeyService);
        this._showErrors.set(options.showErrors);
        this._showWarnings.set(options.showWarnings);
        this._showInfos.set(options.showInfos);
        this._excludedFiles.set(options.excludedFiles);
        this._activeFile.set(options.activeFile);
        this.filterHistory = options.filterHistory;
    }
    get excludedFiles() {
        return !!this._excludedFiles.get();
    }
    set excludedFiles(filesExclude) {
        if (this._excludedFiles.get() !== filesExclude) {
            this._excludedFiles.set(filesExclude);
            this._onDidChange.fire({ excludedFiles: true });
        }
    }
    get activeFile() {
        return !!this._activeFile.get();
    }
    set activeFile(activeFile) {
        if (this._activeFile.get() !== activeFile) {
            this._activeFile.set(activeFile);
            this._onDidChange.fire({ activeFile: true });
        }
    }
    get showWarnings() {
        return !!this._showWarnings.get();
    }
    set showWarnings(showWarnings) {
        if (this._showWarnings.get() !== showWarnings) {
            this._showWarnings.set(showWarnings);
            this._onDidChange.fire({ showWarnings: true });
        }
    }
    get showErrors() {
        return !!this._showErrors.get();
    }
    set showErrors(showErrors) {
        if (this._showErrors.get() !== showErrors) {
            this._showErrors.set(showErrors);
            this._onDidChange.fire({ showErrors: true });
        }
    }
    get showInfos() {
        return !!this._showInfos.get();
    }
    set showInfos(showInfos) {
        if (this._showInfos.get() !== showInfos) {
            this._showInfos.set(showInfos);
            this._onDidChange.fire({ showInfos: true });
        }
    }
}
export class QuickFixAction extends Action {
    static { this.ID = 'workbench.actions.problems.quickfix'; }
    static { this.CLASS = 'markers-panel-action-quickfix ' + ThemeIcon.asClassName(Codicon.lightBulb); }
    static { this.AUTO_FIX_CLASS = QuickFixAction.CLASS + ' autofixable'; }
    get quickFixes() {
        return this._quickFixes;
    }
    set quickFixes(quickFixes) {
        this._quickFixes = quickFixes;
        this.enabled = this._quickFixes.length > 0;
    }
    autoFixable(autofixable) {
        this.class = autofixable ? QuickFixAction.AUTO_FIX_CLASS : QuickFixAction.CLASS;
    }
    constructor(marker) {
        super(QuickFixAction.ID, Messages.MARKERS_PANEL_ACTION_TOOLTIP_QUICKFIX, QuickFixAction.CLASS, false);
        this.marker = marker;
        this._onShowQuickFixes = this._register(new Emitter());
        this.onShowQuickFixes = this._onShowQuickFixes.event;
        this._quickFixes = [];
    }
    run() {
        this._onShowQuickFixes.fire();
        return Promise.resolve();
    }
}
let QuickFixActionViewItem = class QuickFixActionViewItem extends ActionViewItem {
    constructor(action, options, contextMenuService) {
        super(null, action, { ...options, icon: true, label: false });
        this.contextMenuService = contextMenuService;
    }
    onClick(event) {
        DOM.EventHelper.stop(event, true);
        this.showQuickFixes();
    }
    showQuickFixes() {
        if (!this.element) {
            return;
        }
        if (!this.isEnabled()) {
            return;
        }
        const elementPosition = DOM.getDomNodePagePosition(this.element);
        const quickFixes = this.action.quickFixes;
        if (quickFixes.length) {
            this.contextMenuService.showContextMenu({
                getAnchor: () => ({ x: elementPosition.left + 10, y: elementPosition.top + elementPosition.height + 4 }),
                getActions: () => quickFixes
            });
        }
    }
};
QuickFixActionViewItem = __decorate([
    __param(2, IContextMenuService),
    __metadata("design:paramtypes", [QuickFixAction, Object, Object])
], QuickFixActionViewItem);
export { QuickFixActionViewItem };
