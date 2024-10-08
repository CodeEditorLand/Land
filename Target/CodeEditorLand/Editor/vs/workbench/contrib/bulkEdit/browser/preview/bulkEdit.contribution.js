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
var BulkEditPreviewContribution_1;
import { Registry } from '../../../../../platform/registry/common/platform.js';
import { registerWorkbenchContribution2 } from '../../../../common/contributions.js';
import { IBulkEditService } from '../../../../../editor/browser/services/bulkEditService.js';
import { BulkEditPane } from './bulkEditPane.js';
import { Extensions as ViewContainerExtensions } from '../../../../common/views.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
import { FocusedViewContext } from '../../../../common/contextkeys.js';
import { localize, localize2 } from '../../../../../nls.js';
import { ViewPaneContainer } from '../../../../browser/parts/views/viewPaneContainer.js';
import { RawContextKey, IContextKeyService, ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { WorkbenchListFocusContextKey } from '../../../../../platform/list/browser/listService.js';
import { SyncDescriptor } from '../../../../../platform/instantiation/common/descriptors.js';
import { MenuId, registerAction2, Action2 } from '../../../../../platform/actions/common/actions.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../../../common/editor.js';
import { CancellationTokenSource } from '../../../../../base/common/cancellation.js';
import { IDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import Severity from '../../../../../base/common/severity.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { registerIcon } from '../../../../../platform/theme/common/iconRegistry.js';
import { IPaneCompositePartService } from '../../../../services/panecomposite/browser/panecomposite.js';
async function getBulkEditPane(viewsService) {
    const view = await viewsService.openView(BulkEditPane.ID, true);
    if (view instanceof BulkEditPane) {
        return view;
    }
    return undefined;
}
let UXState = class UXState {
    constructor(_paneCompositeService, _editorGroupsService) {
        this._paneCompositeService = _paneCompositeService;
        this._editorGroupsService = _editorGroupsService;
        this._activePanel = _paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */)?.getId();
    }
    async restore(panels, editors) {
        // (1) restore previous panel
        if (panels) {
            if (typeof this._activePanel === 'string') {
                await this._paneCompositeService.openPaneComposite(this._activePanel, 1 /* ViewContainerLocation.Panel */);
            }
            else {
                this._paneCompositeService.hideActivePaneComposite(1 /* ViewContainerLocation.Panel */);
            }
        }
        // (2) close preview editors
        if (editors) {
            for (const group of this._editorGroupsService.groups) {
                const previewEditors = [];
                for (const input of group.editors) {
                    const resource = EditorResourceAccessor.getCanonicalUri(input, { supportSideBySide: SideBySideEditor.PRIMARY });
                    if (resource?.scheme === BulkEditPane.Schema) {
                        previewEditors.push(input);
                    }
                }
                if (previewEditors.length) {
                    group.closeEditors(previewEditors, { preserveFocus: true });
                }
            }
        }
    }
};
UXState = __decorate([
    __param(0, IPaneCompositePartService),
    __param(1, IEditorGroupsService),
    __metadata("design:paramtypes", [Object, Object])
], UXState);
class PreviewSession {
    constructor(uxState, cts = new CancellationTokenSource()) {
        this.uxState = uxState;
        this.cts = cts;
    }
}
let BulkEditPreviewContribution = class BulkEditPreviewContribution {
    static { BulkEditPreviewContribution_1 = this; }
    static { this.ID = 'workbench.contrib.bulkEditPreview'; }
    static { this.ctxEnabled = new RawContextKey('refactorPreview.enabled', false); }
    constructor(_paneCompositeService, _viewsService, _editorGroupsService, _dialogService, bulkEditService, contextKeyService) {
        this._paneCompositeService = _paneCompositeService;
        this._viewsService = _viewsService;
        this._editorGroupsService = _editorGroupsService;
        this._dialogService = _dialogService;
        bulkEditService.setPreviewHandler(edits => this._previewEdit(edits));
        this._ctxEnabled = BulkEditPreviewContribution_1.ctxEnabled.bindTo(contextKeyService);
    }
    async _previewEdit(edits) {
        this._ctxEnabled.set(true);
        const uxState = this._activeSession?.uxState ?? new UXState(this._paneCompositeService, this._editorGroupsService);
        const view = await getBulkEditPane(this._viewsService);
        if (!view) {
            this._ctxEnabled.set(false);
            return edits;
        }
        // check for active preview session and let the user decide
        if (view.hasInput()) {
            const { confirmed } = await this._dialogService.confirm({
                type: Severity.Info,
                message: localize('overlap', "Another refactoring is being previewed."),
                detail: localize('detail', "Press 'Continue' to discard the previous refactoring and continue with the current refactoring."),
                primaryButton: localize({ key: 'continue', comment: ['&& denotes a mnemonic'] }, "&&Continue")
            });
            if (!confirmed) {
                return [];
            }
        }
        // session
        let session;
        if (this._activeSession) {
            await this._activeSession.uxState.restore(false, true);
            this._activeSession.cts.dispose(true);
            session = new PreviewSession(uxState);
        }
        else {
            session = new PreviewSession(uxState);
        }
        this._activeSession = session;
        // the actual work...
        try {
            return await view.setInput(edits, session.cts.token) ?? [];
        }
        finally {
            // restore UX state
            if (this._activeSession === session) {
                await this._activeSession.uxState.restore(true, true);
                this._activeSession.cts.dispose();
                this._ctxEnabled.set(false);
                this._activeSession = undefined;
            }
        }
    }
};
BulkEditPreviewContribution = BulkEditPreviewContribution_1 = __decorate([
    __param(0, IPaneCompositePartService),
    __param(1, IViewsService),
    __param(2, IEditorGroupsService),
    __param(3, IDialogService),
    __param(4, IBulkEditService),
    __param(5, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], BulkEditPreviewContribution);
// CMD: accept
registerAction2(class ApplyAction extends Action2 {
    constructor() {
        super({
            id: 'refactorPreview.apply',
            title: localize2('apply', "Apply Refactoring"),
            category: localize2('cat', "Refactor Preview"),
            icon: Codicon.check,
            precondition: ContextKeyExpr.and(BulkEditPreviewContribution.ctxEnabled, BulkEditPane.ctxHasCheckedChanges),
            menu: [{
                    id: MenuId.BulkEditContext,
                    order: 1
                }],
            keybinding: {
                weight: 100 /* KeybindingWeight.EditorContrib */ - 10,
                when: ContextKeyExpr.and(BulkEditPreviewContribution.ctxEnabled, FocusedViewContext.isEqualTo(BulkEditPane.ID)),
                primary: 2048 /* KeyMod.CtrlCmd */ + 3 /* KeyCode.Enter */,
            }
        });
    }
    async run(accessor) {
        const viewsService = accessor.get(IViewsService);
        const view = await getBulkEditPane(viewsService);
        view?.accept();
    }
});
// CMD: discard
registerAction2(class DiscardAction extends Action2 {
    constructor() {
        super({
            id: 'refactorPreview.discard',
            title: localize2('Discard', "Discard Refactoring"),
            category: localize2('cat', "Refactor Preview"),
            icon: Codicon.clearAll,
            precondition: BulkEditPreviewContribution.ctxEnabled,
            menu: [{
                    id: MenuId.BulkEditContext,
                    order: 2
                }]
        });
    }
    async run(accessor) {
        const viewsService = accessor.get(IViewsService);
        const view = await getBulkEditPane(viewsService);
        view?.discard();
    }
});
// CMD: toggle change
registerAction2(class ToggleAction extends Action2 {
    constructor() {
        super({
            id: 'refactorPreview.toggleCheckedState',
            title: localize2('toogleSelection', "Toggle Change"),
            category: localize2('cat', "Refactor Preview"),
            precondition: BulkEditPreviewContribution.ctxEnabled,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: WorkbenchListFocusContextKey,
                primary: 10 /* KeyCode.Space */,
            },
            menu: {
                id: MenuId.BulkEditContext,
                group: 'navigation'
            }
        });
    }
    async run(accessor) {
        const viewsService = accessor.get(IViewsService);
        const view = await getBulkEditPane(viewsService);
        view?.toggleChecked();
    }
});
// CMD: toggle category
registerAction2(class GroupByFile extends Action2 {
    constructor() {
        super({
            id: 'refactorPreview.groupByFile',
            title: localize2('groupByFile', "Group Changes By File"),
            category: localize2('cat', "Refactor Preview"),
            icon: Codicon.ungroupByRefType,
            precondition: ContextKeyExpr.and(BulkEditPane.ctxHasCategories, BulkEditPane.ctxGroupByFile.negate(), BulkEditPreviewContribution.ctxEnabled),
            menu: [{
                    id: MenuId.BulkEditTitle,
                    when: ContextKeyExpr.and(BulkEditPane.ctxHasCategories, BulkEditPane.ctxGroupByFile.negate()),
                    group: 'navigation',
                    order: 3,
                }]
        });
    }
    async run(accessor) {
        const viewsService = accessor.get(IViewsService);
        const view = await getBulkEditPane(viewsService);
        view?.groupByFile();
    }
});
registerAction2(class GroupByType extends Action2 {
    constructor() {
        super({
            id: 'refactorPreview.groupByType',
            title: localize2('groupByType', "Group Changes By Type"),
            category: localize2('cat', "Refactor Preview"),
            icon: Codicon.groupByRefType,
            precondition: ContextKeyExpr.and(BulkEditPane.ctxHasCategories, BulkEditPane.ctxGroupByFile, BulkEditPreviewContribution.ctxEnabled),
            menu: [{
                    id: MenuId.BulkEditTitle,
                    when: ContextKeyExpr.and(BulkEditPane.ctxHasCategories, BulkEditPane.ctxGroupByFile),
                    group: 'navigation',
                    order: 3
                }]
        });
    }
    async run(accessor) {
        const viewsService = accessor.get(IViewsService);
        const view = await getBulkEditPane(viewsService);
        view?.groupByType();
    }
});
registerAction2(class ToggleGrouping extends Action2 {
    constructor() {
        super({
            id: 'refactorPreview.toggleGrouping',
            title: localize2('groupByType', "Group Changes By Type"),
            category: localize2('cat', "Refactor Preview"),
            icon: Codicon.listTree,
            toggled: BulkEditPane.ctxGroupByFile.negate(),
            precondition: ContextKeyExpr.and(BulkEditPane.ctxHasCategories, BulkEditPreviewContribution.ctxEnabled),
            menu: [{
                    id: MenuId.BulkEditContext,
                    order: 3
                }]
        });
    }
    async run(accessor) {
        const viewsService = accessor.get(IViewsService);
        const view = await getBulkEditPane(viewsService);
        view?.toggleGrouping();
    }
});
registerWorkbenchContribution2(BulkEditPreviewContribution.ID, BulkEditPreviewContribution, 2 /* WorkbenchPhase.BlockRestore */);
const refactorPreviewViewIcon = registerIcon('refactor-preview-view-icon', Codicon.lightbulb, localize('refactorPreviewViewIcon', 'View icon of the refactor preview view.'));
const container = Registry.as(ViewContainerExtensions.ViewContainersRegistry).registerViewContainer({
    id: BulkEditPane.ID,
    title: localize2('panel', "Refactor Preview"),
    hideIfEmpty: true,
    ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [BulkEditPane.ID, { mergeViewWithContainerWhenSingleView: true }]),
    icon: refactorPreviewViewIcon,
    storageId: BulkEditPane.ID
}, 1 /* ViewContainerLocation.Panel */);
Registry.as(ViewContainerExtensions.ViewsRegistry).registerViews([{
        id: BulkEditPane.ID,
        name: localize2('panel', "Refactor Preview"),
        when: BulkEditPreviewContribution.ctxEnabled,
        ctorDescriptor: new SyncDescriptor(BulkEditPane),
        containerIcon: refactorPreviewViewIcon,
    }], container);
