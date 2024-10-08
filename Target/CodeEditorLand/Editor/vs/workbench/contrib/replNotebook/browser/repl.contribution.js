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
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { EditorPaneDescriptor } from '../../../browser/editor.js';
import { EditorExtensions } from '../../../common/editor.js';
import { parse } from '../../../../base/common/marshalling.js';
import { assertType } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { CellKind, NotebookSetting, NotebookWorkingCopyTypeIdentifier, REPL_EDITOR_ID } from '../../notebook/common/notebookCommon.js';
import { isReplEditorControl, ReplEditor } from './replEditor.js';
import { ReplEditorInput } from './replEditorInput.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IWorkingCopyEditorService } from '../../../services/workingCopy/common/workingCopyEditorService.js';
import { isEqual } from '../../../../base/common/resources.js';
import { INotebookService } from '../../notebook/common/notebookService.js';
import { IEditorResolverService, RegisteredEditorPriority } from '../../../services/editor/common/editorResolverService.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { isFalsyOrWhitespace } from '../../../../base/common/strings.js';
import { IBulkEditService } from '../../../../editor/browser/services/bulkEditService.js';
import { PLAINTEXT_LANGUAGE_ID } from '../../../../editor/common/languages/modesRegistry.js';
import { ResourceNotebookCellEdit } from '../../bulkEdit/browser/bulkCellEdits.js';
import { IInteractiveHistoryService } from '../../interactive/browser/interactiveHistoryService.js';
import { INotebookEditorService } from '../../notebook/browser/services/notebookEditorService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { getReplView } from '../../debug/browser/repl.js';
import { REPL_VIEW_ID } from '../../debug/common/debug.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { localize2 } from '../../../../nls.js';
import { NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT } from '../../notebook/browser/controller/coreActions.js';
import * as icons from '../../notebook/browser/notebookIcons.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { InlineChatController } from '../../inlineChat/browser/inlineChatController.js';
import { ReplEditorAccessibilityHelp } from './replEditorAccessibilityHelp.js';
import { AccessibleViewRegistry } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
class ReplEditorSerializer {
    canSerialize(input) {
        return input.typeId === ReplEditorInput.ID;
    }
    serialize(input) {
        assertType(input instanceof ReplEditorInput);
        const data = {
            resource: input.resource,
            preferredResource: input.preferredResource,
            viewType: input.viewType,
            options: input.options,
            label: input.getName()
        };
        return JSON.stringify(data);
    }
    deserialize(instantiationService, raw) {
        const data = parse(raw);
        if (!data) {
            return undefined;
        }
        const { resource, viewType } = data;
        if (!data || !URI.isUri(resource) || typeof viewType !== 'string') {
            return undefined;
        }
        const input = instantiationService.createInstance(ReplEditorInput, resource, data.label);
        return input;
    }
}
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(ReplEditor, REPL_EDITOR_ID, 'REPL Editor'), [
    new SyncDescriptor(ReplEditorInput)
]);
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(ReplEditorInput.ID, ReplEditorSerializer);
let ReplDocumentContribution = class ReplDocumentContribution extends Disposable {
    static { this.ID = 'workbench.contrib.replDocument'; }
    constructor(notebookService, editorResolverService, notebookEditorModelResolverService, instantiationService, configurationService) {
        super();
        this.notebookEditorModelResolverService = notebookEditorModelResolverService;
        this.instantiationService = instantiationService;
        this.configurationService = configurationService;
        editorResolverService.registerEditor(
        // don't match anything, we don't need to support re-opening files as REPL editor at this point
        ` `, {
            id: 'repl',
            label: 'repl Editor',
            priority: RegisteredEditorPriority.option
        }, {
            // We want to support all notebook types which could have any file extension,
            // so we just check if the resource corresponds to a notebook
            canSupportResource: uri => notebookService.getNotebookTextModel(uri) !== undefined,
            singlePerResource: true
        }, {
            createUntitledEditorInput: async ({ resource, options }) => {
                const scratchpad = this.configurationService.getValue(NotebookSetting.InteractiveWindowPromptToSave) !== true;
                const ref = await this.notebookEditorModelResolverService.resolve({ untitledResource: resource }, 'jupyter-notebook', { scratchpad, viewType: 'repl' });
                // untitled notebooks are disposed when they get saved. we should not hold a reference
                // to such a disposed notebook and therefore dispose the reference as well
                ref.object.notebook.onWillDispose(() => {
                    ref.dispose();
                });
                const label = options?.label ?? undefined;
                return { editor: this.instantiationService.createInstance(ReplEditorInput, resource, label), options };
            },
            createEditorInput: async ({ resource, options }) => {
                const label = options?.label ?? undefined;
                return { editor: this.instantiationService.createInstance(ReplEditorInput, resource, label), options };
            }
        });
    }
};
ReplDocumentContribution = __decorate([
    __param(0, INotebookService),
    __param(1, IEditorResolverService),
    __param(2, INotebookEditorModelResolverService),
    __param(3, IInstantiationService),
    __param(4, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ReplDocumentContribution);
export { ReplDocumentContribution };
let ReplWindowWorkingCopyEditorHandler = class ReplWindowWorkingCopyEditorHandler extends Disposable {
    static { this.ID = 'workbench.contrib.replWorkingCopyEditorHandler'; }
    constructor(instantiationService, workingCopyEditorService, extensionService, notebookService) {
        super();
        this.instantiationService = instantiationService;
        this.workingCopyEditorService = workingCopyEditorService;
        this.extensionService = extensionService;
        this.notebookService = notebookService;
        this._installHandler();
    }
    async handles(workingCopy) {
        const notebookType = this._getNotebookType(workingCopy);
        if (!notebookType) {
            return false;
        }
        return !!notebookType && notebookType.viewType === 'repl' && await this.notebookService.canResolve(notebookType.notebookType);
    }
    isOpen(workingCopy, editor) {
        if (!this.handles(workingCopy)) {
            return false;
        }
        return editor instanceof ReplEditorInput && isEqual(workingCopy.resource, editor.resource);
    }
    createEditor(workingCopy) {
        return this.instantiationService.createInstance(ReplEditorInput, workingCopy.resource, undefined);
    }
    async _installHandler() {
        await this.extensionService.whenInstalledExtensionsRegistered();
        this._register(this.workingCopyEditorService.registerHandler(this));
    }
    _getNotebookType(workingCopy) {
        return NotebookWorkingCopyTypeIdentifier.parse(workingCopy.typeId);
    }
};
ReplWindowWorkingCopyEditorHandler = __decorate([
    __param(0, IInstantiationService),
    __param(1, IWorkingCopyEditorService),
    __param(2, IExtensionService),
    __param(3, INotebookService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ReplWindowWorkingCopyEditorHandler);
registerWorkbenchContribution2(ReplWindowWorkingCopyEditorHandler.ID, ReplWindowWorkingCopyEditorHandler, 2 /* WorkbenchPhase.BlockRestore */);
registerWorkbenchContribution2(ReplDocumentContribution.ID, ReplDocumentContribution, 2 /* WorkbenchPhase.BlockRestore */);
AccessibleViewRegistry.register(new ReplEditorAccessibilityHelp());
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'repl.execute',
            title: localize2('repl.execute', 'Execute REPL input'),
            category: 'REPL',
            keybinding: [{
                    when: ContextKeyExpr.equals('activeEditor', 'workbench.editor.repl'),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                    weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                }, {
                    when: ContextKeyExpr.and(ContextKeyExpr.equals('activeEditor', 'workbench.editor.repl'), ContextKeyExpr.equals('config.interactiveWindow.executeWithShiftEnter', true)),
                    primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                    weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                }, {
                    when: ContextKeyExpr.and(ContextKeyExpr.equals('activeEditor', 'workbench.editor.repl'), ContextKeyExpr.equals('config.interactiveWindow.executeWithShiftEnter', false)),
                    primary: 3 /* KeyCode.Enter */,
                    weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                }],
            menu: [
                {
                    id: MenuId.ReplInputExecute
                }
            ],
            icon: icons.executeIcon,
            f1: false,
            metadata: {
                description: 'Execute the Contents of the Input Box',
                args: [
                    {
                        name: 'resource',
                        description: 'Interactive resource Uri',
                        isOptional: true
                    }
                ]
            }
        });
    }
    async run(accessor, context) {
        const editorService = accessor.get(IEditorService);
        const bulkEditService = accessor.get(IBulkEditService);
        const historyService = accessor.get(IInteractiveHistoryService);
        const notebookEditorService = accessor.get(INotebookEditorService);
        let editorControl;
        if (context) {
            const resourceUri = URI.revive(context);
            const editors = editorService.findEditors(resourceUri);
            for (const found of editors) {
                if (found.editor.typeId === ReplEditorInput.ID) {
                    const editor = await editorService.openEditor(found.editor, found.groupId);
                    editorControl = editor?.getControl();
                    break;
                }
            }
        }
        else {
            editorControl = editorService.activeEditorPane?.getControl();
        }
        if (isReplEditorControl(editorControl)) {
            executeReplInput(bulkEditService, historyService, notebookEditorService, editorControl);
        }
    }
});
async function executeReplInput(bulkEditService, historyService, notebookEditorService, editorControl) {
    if (editorControl && editorControl.notebookEditor && editorControl.activeCodeEditor) {
        const notebookDocument = editorControl.notebookEditor.textModel;
        const textModel = editorControl.activeCodeEditor.getModel();
        const activeKernel = editorControl.notebookEditor.activeKernel;
        const language = activeKernel?.supportedLanguages[0] ?? PLAINTEXT_LANGUAGE_ID;
        if (notebookDocument && textModel) {
            const index = notebookDocument.length - 1;
            const value = textModel.getValue();
            if (isFalsyOrWhitespace(value)) {
                return;
            }
            // Just accept any existing inline chat hunk
            const ctrl = InlineChatController.get(editorControl.activeCodeEditor);
            if (ctrl) {
                ctrl.acceptHunk();
            }
            historyService.replaceLast(notebookDocument.uri, value);
            historyService.addToHistory(notebookDocument.uri, '');
            textModel.setValue('');
            notebookDocument.cells[index].resetTextBuffer(textModel.getTextBuffer());
            const collapseState = editorControl.notebookEditor.notebookOptions.getDisplayOptions().interactiveWindowCollapseCodeCells === 'fromEditor' ?
                {
                    inputCollapsed: false,
                    outputCollapsed: false
                } :
                undefined;
            await bulkEditService.apply([
                new ResourceNotebookCellEdit(notebookDocument.uri, {
                    editType: 1 /* CellEditType.Replace */,
                    index: index,
                    count: 0,
                    cells: [{
                            cellKind: CellKind.Code,
                            mime: undefined,
                            language,
                            source: value,
                            outputs: [],
                            metadata: {},
                            collapseState
                        }]
                })
            ]);
            // reveal the cell into view first
            const range = { start: index, end: index + 1 };
            editorControl.notebookEditor.revealCellRangeInView(range);
            await editorControl.notebookEditor.executeNotebookCells(editorControl.notebookEditor.getCellsInRange({ start: index, end: index + 1 }));
            // update the selection and focus in the extension host model
            const editor = notebookEditorService.getNotebookEditor(editorControl.notebookEditor.getId());
            if (editor) {
                editor.setSelections([range]);
                editor.setFocus(range);
            }
        }
    }
}
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'list.find.replInputFocus',
    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
    when: ContextKeyExpr.equals('view', REPL_VIEW_ID),
    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 36 /* KeyCode.KeyF */,
    secondary: [61 /* KeyCode.F3 */],
    handler: (accessor) => {
        getReplView(accessor.get(IViewsService))?.openFind();
    }
});
