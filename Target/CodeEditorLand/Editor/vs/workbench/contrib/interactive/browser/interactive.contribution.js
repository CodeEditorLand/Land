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
import { Iterable } from '../../../../base/common/iterator.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { parse } from '../../../../base/common/marshalling.js';
import { Schemas } from '../../../../base/common/network.js';
import { extname, isEqual } from '../../../../base/common/resources.js';
import { isFalsyOrWhitespace } from '../../../../base/common/strings.js';
import { URI } from '../../../../base/common/uri.js';
import { IBulkEditService } from '../../../../editor/browser/services/bulkEditService.js';
import { EditOperation } from '../../../../editor/common/core/editOperation.js';
import { PLAINTEXT_LANGUAGE_ID } from '../../../../editor/common/languages/modesRegistry.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { peekViewBorder } from '../../../../editor/contrib/peekView/browser/peekView.js';
import { Context as SuggestContext } from '../../../../editor/contrib/suggest/browser/suggest.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { EditorActivation } from '../../../../platform/editor/common/editor.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { contrastBorder, ifDefinedThenElse, listInactiveSelectionBackground, registerColor } from '../../../../platform/theme/common/colorRegistry.js';
import { EditorPaneDescriptor } from '../../../browser/editor.js';
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { EditorExtensions } from '../../../common/editor.js';
import { PANEL_BORDER } from '../../../common/theme.js';
import { ResourceNotebookCellEdit } from '../../bulkEdit/browser/bulkCellEdits.js';
import { InteractiveWindowSetting, INTERACTIVE_INPUT_CURSOR_BOUNDARY } from './interactiveCommon.js';
import { IInteractiveDocumentService, InteractiveDocumentService } from './interactiveDocumentService.js';
import { InteractiveEditor } from './interactiveEditor.js';
import { InteractiveEditorInput } from './interactiveEditorInput.js';
import { IInteractiveHistoryService, InteractiveHistoryService } from './interactiveHistoryService.js';
import { NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT } from '../../notebook/browser/controller/coreActions.js';
import * as icons from '../../notebook/browser/notebookIcons.js';
import { INotebookEditorService } from '../../notebook/browser/services/notebookEditorService.js';
import { CellKind, CellUri, INTERACTIVE_WINDOW_EDITOR_ID, NotebookSetting, NotebookWorkingCopyTypeIdentifier } from '../../notebook/common/notebookCommon.js';
import { InteractiveWindowOpen, IS_COMPOSITE_NOTEBOOK, NOTEBOOK_EDITOR_FOCUSED } from '../../notebook/common/notebookContextKeys.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { INotebookService } from '../../notebook/common/notebookService.js';
import { columnToEditorGroup } from '../../../services/editor/common/editorGroupColumn.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorResolverService, RegisteredEditorPriority } from '../../../services/editor/common/editorResolverService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IWorkingCopyEditorService } from '../../../services/workingCopy/common/workingCopyEditorService.js';
import { isReplEditorControl } from '../../replNotebook/browser/replEditor.js';
import { InlineChatController } from '../../inlineChat/browser/inlineChatController.js';
import { IsLinuxContext, IsWindowsContext } from '../../../../platform/contextkey/common/contextkeys.js';
const interactiveWindowCategory = localize2('interactiveWindow', "Interactive Window");
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(InteractiveEditor, INTERACTIVE_WINDOW_EDITOR_ID, 'Interactive Window'), [
    new SyncDescriptor(InteractiveEditorInput)
]);
let InteractiveDocumentContribution = class InteractiveDocumentContribution extends Disposable {
    static { this.ID = 'workbench.contrib.interactiveDocument'; }
    constructor(notebookService, editorResolverService, editorService, instantiationService) {
        super();
        this.instantiationService = instantiationService;
        const info = notebookService.getContributedNotebookType('interactive');
        if (!info) {
            this._register(notebookService.registerContributedNotebookType('interactive', {
                providerDisplayName: 'Interactive Notebook',
                displayName: 'Interactive',
                filenamePattern: ['*.interactive'],
                priority: RegisteredEditorPriority.builtin
            }));
        }
        editorResolverService.registerEditor(`${Schemas.vscodeInteractiveInput}:/**`, {
            id: 'vscode-interactive-input',
            label: 'Interactive Editor',
            priority: RegisteredEditorPriority.exclusive
        }, {
            canSupportResource: uri => uri.scheme === Schemas.vscodeInteractiveInput,
            singlePerResource: true
        }, {
            createEditorInput: ({ resource }) => {
                const editorInput = editorService.getEditors(1).find(editor => editor.editor instanceof InteractiveEditorInput && editor.editor.inputResource.toString() === resource.toString());
                return editorInput;
            }
        });
        editorResolverService.registerEditor(`*.interactive`, {
            id: 'interactive',
            label: 'Interactive Editor',
            priority: RegisteredEditorPriority.exclusive
        }, {
            canSupportResource: uri => (uri.scheme === Schemas.untitled && extname(uri) === '.interactive') ||
                (uri.scheme === Schemas.vscodeNotebookCell && extname(uri) === '.interactive'),
            singlePerResource: true
        }, {
            createEditorInput: ({ resource, options }) => {
                const data = CellUri.parse(resource);
                let cellOptions;
                let iwResource = resource;
                if (data) {
                    cellOptions = { resource, options };
                    iwResource = data.notebook;
                }
                const notebookOptions = {
                    ...options,
                    cellOptions,
                    cellRevealType: undefined,
                    cellSelections: undefined,
                    isReadOnly: undefined,
                    viewState: undefined,
                    indexedCellOptions: undefined
                };
                const editorInput = createEditor(iwResource, this.instantiationService);
                return {
                    editor: editorInput,
                    options: notebookOptions
                };
            },
            createUntitledEditorInput: ({ resource, options }) => {
                if (!resource) {
                    throw new Error('Interactive window editors must have a resource name');
                }
                const data = CellUri.parse(resource);
                let cellOptions;
                if (data) {
                    cellOptions = { resource, options };
                }
                const notebookOptions = {
                    ...options,
                    cellOptions,
                    cellRevealType: undefined,
                    cellSelections: undefined,
                    isReadOnly: undefined,
                    viewState: undefined,
                    indexedCellOptions: undefined
                };
                const editorInput = createEditor(resource, this.instantiationService);
                return {
                    editor: editorInput,
                    options: notebookOptions
                };
            }
        });
    }
};
InteractiveDocumentContribution = __decorate([
    __param(0, INotebookService),
    __param(1, IEditorResolverService),
    __param(2, IEditorService),
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], InteractiveDocumentContribution);
export { InteractiveDocumentContribution };
let InteractiveInputContentProvider = class InteractiveInputContentProvider {
    static { this.ID = 'workbench.contrib.interactiveInputContentProvider'; }
    constructor(textModelService, _modelService) {
        this._modelService = _modelService;
        this._registration = textModelService.registerTextModelContentProvider(Schemas.vscodeInteractiveInput, this);
    }
    dispose() {
        this._registration.dispose();
    }
    async provideTextContent(resource) {
        const existing = this._modelService.getModel(resource);
        if (existing) {
            return existing;
        }
        const result = this._modelService.createModel('', null, resource, false);
        return result;
    }
};
InteractiveInputContentProvider = __decorate([
    __param(0, ITextModelService),
    __param(1, IModelService),
    __metadata("design:paramtypes", [Object, Object])
], InteractiveInputContentProvider);
function createEditor(resource, instantiationService) {
    const counter = /\/Interactive-(\d+)/.exec(resource.path);
    const inputBoxPath = counter && counter[1] ? `/InteractiveInput-${counter[1]}` : 'InteractiveInput';
    const inputUri = URI.from({ scheme: Schemas.vscodeInteractiveInput, path: inputBoxPath });
    const editorInput = InteractiveEditorInput.create(instantiationService, resource, inputUri);
    return editorInput;
}
let InteractiveWindowWorkingCopyEditorHandler = class InteractiveWindowWorkingCopyEditorHandler extends Disposable {
    static { this.ID = 'workbench.contrib.interactiveWindowWorkingCopyEditorHandler'; }
    constructor(_instantiationService, _workingCopyEditorService, _extensionService) {
        super();
        this._instantiationService = _instantiationService;
        this._workingCopyEditorService = _workingCopyEditorService;
        this._extensionService = _extensionService;
        this._installHandler();
    }
    handles(workingCopy) {
        const viewType = this._getViewType(workingCopy);
        return !!viewType && viewType === 'interactive';
    }
    isOpen(workingCopy, editor) {
        if (!this.handles(workingCopy)) {
            return false;
        }
        return editor instanceof InteractiveEditorInput && isEqual(workingCopy.resource, editor.resource);
    }
    createEditor(workingCopy) {
        return createEditor(workingCopy.resource, this._instantiationService);
    }
    async _installHandler() {
        await this._extensionService.whenInstalledExtensionsRegistered();
        this._register(this._workingCopyEditorService.registerHandler(this));
    }
    _getViewType(workingCopy) {
        return NotebookWorkingCopyTypeIdentifier.parse(workingCopy.typeId)?.viewType;
    }
};
InteractiveWindowWorkingCopyEditorHandler = __decorate([
    __param(0, IInstantiationService),
    __param(1, IWorkingCopyEditorService),
    __param(2, IExtensionService),
    __metadata("design:paramtypes", [Object, Object, Object])
], InteractiveWindowWorkingCopyEditorHandler);
registerWorkbenchContribution2(InteractiveDocumentContribution.ID, InteractiveDocumentContribution, 2);
registerWorkbenchContribution2(InteractiveInputContentProvider.ID, InteractiveInputContentProvider, {
    editorTypeId: INTERACTIVE_WINDOW_EDITOR_ID
});
registerWorkbenchContribution2(InteractiveWindowWorkingCopyEditorHandler.ID, InteractiveWindowWorkingCopyEditorHandler, {
    editorTypeId: INTERACTIVE_WINDOW_EDITOR_ID
});
export class InteractiveEditorSerializer {
    static { this.ID = InteractiveEditorInput.ID; }
    canSerialize(editor) {
        if (!(editor instanceof InteractiveEditorInput)) {
            return false;
        }
        return URI.isUri(editor.primary.resource) && URI.isUri(editor.inputResource);
    }
    serialize(input) {
        if (!this.canSerialize(input)) {
            return undefined;
        }
        return JSON.stringify({
            resource: input.primary.resource,
            inputResource: input.inputResource,
            name: input.getName(),
            language: input.language
        });
    }
    deserialize(instantiationService, raw) {
        const data = parse(raw);
        if (!data) {
            return undefined;
        }
        const { resource, inputResource, name, language } = data;
        if (!URI.isUri(resource) || !URI.isUri(inputResource)) {
            return undefined;
        }
        const input = InteractiveEditorInput.create(instantiationService, resource, inputResource, name, language);
        return input;
    }
}
Registry.as(EditorExtensions.EditorFactory)
    .registerEditorSerializer(InteractiveEditorSerializer.ID, InteractiveEditorSerializer);
registerSingleton(IInteractiveHistoryService, InteractiveHistoryService, 1);
registerSingleton(IInteractiveDocumentService, InteractiveDocumentService, 1);
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: '_interactive.open',
            title: localize2('interactive.open', 'Open Interactive Window'),
            f1: false,
            category: interactiveWindowCategory,
            metadata: {
                description: localize('interactive.open', 'Open Interactive Window'),
                args: [
                    {
                        name: 'showOptions',
                        description: 'Show Options',
                        schema: {
                            type: 'object',
                            properties: {
                                'viewColumn': {
                                    type: 'number',
                                    default: -1
                                },
                                'preserveFocus': {
                                    type: 'boolean',
                                    default: true
                                }
                            },
                        }
                    },
                    {
                        name: 'resource',
                        description: 'Interactive resource Uri',
                        isOptional: true
                    },
                    {
                        name: 'controllerId',
                        description: 'Notebook controller Id',
                        isOptional: true
                    },
                    {
                        name: 'title',
                        description: 'Notebook editor title',
                        isOptional: true
                    }
                ]
            }
        });
    }
    async run(accessor, showOptions, resource, id, title) {
        const editorService = accessor.get(IEditorService);
        const editorGroupService = accessor.get(IEditorGroupsService);
        const historyService = accessor.get(IInteractiveHistoryService);
        const kernelService = accessor.get(INotebookKernelService);
        const logService = accessor.get(ILogService);
        const configurationService = accessor.get(IConfigurationService);
        const group = columnToEditorGroup(editorGroupService, configurationService, typeof showOptions === 'number' ? showOptions : showOptions?.viewColumn);
        const editorOptions = {
            activation: EditorActivation.PRESERVE,
            preserveFocus: typeof showOptions !== 'number' ? (showOptions?.preserveFocus ?? false) : false
        };
        if (resource && extname(resource) === '.interactive') {
            logService.debug('Open interactive window from resource:', resource.toString());
            const resourceUri = URI.revive(resource);
            const editors = editorService.findEditors(resourceUri).filter(id => id.editor instanceof InteractiveEditorInput && id.editor.resource?.toString() === resourceUri.toString());
            if (editors.length) {
                logService.debug('Find existing interactive window:', resource.toString());
                const editorInput = editors[0].editor;
                const currentGroup = editors[0].groupId;
                const editor = await editorService.openEditor(editorInput, editorOptions, currentGroup);
                const editorControl = editor?.getControl();
                return {
                    notebookUri: editorInput.resource,
                    inputUri: editorInput.inputResource,
                    notebookEditorId: editorControl?.notebookEditor?.getId()
                };
            }
        }
        const existingNotebookDocument = new Set();
        editorService.getEditors(1).forEach(editor => {
            if (editor.editor.resource) {
                existingNotebookDocument.add(editor.editor.resource.toString());
            }
        });
        let notebookUri = undefined;
        let inputUri = undefined;
        let counter = 1;
        do {
            notebookUri = URI.from({ scheme: Schemas.untitled, path: `/Interactive-${counter}.interactive` });
            inputUri = URI.from({ scheme: Schemas.vscodeInteractiveInput, path: `/InteractiveInput-${counter}` });
            counter++;
        } while (existingNotebookDocument.has(notebookUri.toString()));
        InteractiveEditorInput.setName(notebookUri, title);
        logService.debug('Open new interactive window:', notebookUri.toString(), inputUri.toString());
        if (id) {
            const allKernels = kernelService.getMatchingKernel({ uri: notebookUri, notebookType: 'interactive' }).all;
            const preferredKernel = allKernels.find(kernel => kernel.id === id);
            if (preferredKernel) {
                kernelService.preselectKernelForNotebook(preferredKernel, { uri: notebookUri, notebookType: 'interactive' });
            }
        }
        historyService.clearHistory(notebookUri);
        const editorInput = { resource: notebookUri, options: editorOptions };
        const editorPane = await editorService.openEditor(editorInput, group);
        const editorControl = editorPane?.getControl();
        logService.debug('New interactive window opened. Notebook editor id', editorControl?.notebookEditor?.getId());
        return { notebookUri, inputUri, notebookEditorId: editorControl?.notebookEditor?.getId() };
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'interactive.execute',
            title: localize2('interactive.execute', 'Execute Code'),
            category: interactiveWindowCategory,
            keybinding: [{
                    when: ContextKeyExpr.equals('activeEditor', 'workbench.editor.interactive'),
                    primary: 2048 | 3,
                    weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                }, {
                    when: ContextKeyExpr.and(ContextKeyExpr.equals('activeEditor', 'workbench.editor.interactive'), ContextKeyExpr.equals('config.interactiveWindow.executeWithShiftEnter', true)),
                    primary: 1024 | 3,
                    weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                }, {
                    when: ContextKeyExpr.and(ContextKeyExpr.equals('activeEditor', 'workbench.editor.interactive'), ContextKeyExpr.equals('config.interactiveWindow.executeWithShiftEnter', false)),
                    primary: 3,
                    weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                }],
            menu: [
                {
                    id: MenuId.InteractiveInputExecute
                },
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
                if (found.editor.typeId === InteractiveEditorInput.ID) {
                    const editor = await editorService.openEditor(found.editor, found.groupId);
                    editorControl = editor?.getControl();
                    break;
                }
            }
        }
        else {
            editorControl = editorService.activeEditorPane?.getControl();
        }
        if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
            const notebookDocument = editorControl.notebookEditor.textModel;
            const textModel = editorControl.activeCodeEditor.getModel();
            const activeKernel = editorControl.notebookEditor.activeKernel;
            const language = activeKernel?.supportedLanguages[0] ?? PLAINTEXT_LANGUAGE_ID;
            if (notebookDocument && textModel) {
                const index = notebookDocument.length;
                const value = textModel.getValue();
                if (isFalsyOrWhitespace(value)) {
                    return;
                }
                const ctrl = InlineChatController.get(editorControl.activeCodeEditor);
                if (ctrl) {
                    ctrl.acceptHunk();
                }
                historyService.replaceLast(notebookDocument.uri, value);
                historyService.addToHistory(notebookDocument.uri, '');
                textModel.setValue('');
                const collapseState = editorControl.notebookEditor.notebookOptions.getDisplayOptions().interactiveWindowCollapseCodeCells === 'fromEditor' ?
                    {
                        inputCollapsed: false,
                        outputCollapsed: false
                    } :
                    undefined;
                await bulkEditService.apply([
                    new ResourceNotebookCellEdit(notebookDocument.uri, {
                        editType: 1,
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
                const range = { start: index, end: index + 1 };
                editorControl.notebookEditor.revealCellRangeInView(range);
                await editorControl.notebookEditor.executeNotebookCells(editorControl.notebookEditor.getCellsInRange({ start: index, end: index + 1 }));
                const editor = notebookEditorService.getNotebookEditor(editorControl.notebookEditor.getId());
                if (editor) {
                    editor.setSelections([range]);
                    editor.setFocus(range);
                }
            }
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'interactive.input.clear',
            title: localize2('interactive.input.clear', 'Clear the interactive window input editor contents'),
            category: interactiveWindowCategory,
            f1: false
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const editorControl = editorService.activeEditorPane?.getControl();
        if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
            const notebookDocument = editorControl.notebookEditor.textModel;
            const textModel = editorControl.activeCodeEditor.getModel();
            const range = editorControl.activeCodeEditor.getModel()?.getFullModelRange();
            if (notebookDocument && textModel && range) {
                editorControl.activeCodeEditor.executeEdits('', [EditOperation.replace(range, null)]);
            }
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'interactive.history.previous',
            title: localize2('interactive.history.previous', 'Previous value in history'),
            category: interactiveWindowCategory,
            f1: false,
            keybinding: {
                when: ContextKeyExpr.and(INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo('bottom'), INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo('none'), SuggestContext.Visible.toNegated()),
                primary: 16,
                weight: 200
            },
            precondition: ContextKeyExpr.and(IS_COMPOSITE_NOTEBOOK, NOTEBOOK_EDITOR_FOCUSED.negate())
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const historyService = accessor.get(IInteractiveHistoryService);
        const editorControl = editorService.activeEditorPane?.getControl();
        if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
            const notebookDocument = editorControl.notebookEditor.textModel;
            const textModel = editorControl.activeCodeEditor.getModel();
            if (notebookDocument && textModel) {
                const previousValue = historyService.getPreviousValue(notebookDocument.uri);
                if (previousValue) {
                    textModel.setValue(previousValue);
                }
            }
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'interactive.history.next',
            title: localize2('interactive.history.next', 'Next value in history'),
            category: interactiveWindowCategory,
            f1: false,
            keybinding: {
                when: ContextKeyExpr.and(INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo('top'), INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo('none'), SuggestContext.Visible.toNegated()),
                primary: 18,
                weight: 200
            },
            precondition: ContextKeyExpr.and(IS_COMPOSITE_NOTEBOOK, NOTEBOOK_EDITOR_FOCUSED.negate())
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const historyService = accessor.get(IInteractiveHistoryService);
        const editorControl = editorService.activeEditorPane?.getControl();
        if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
            const notebookDocument = editorControl.notebookEditor.textModel;
            const textModel = editorControl.activeCodeEditor.getModel();
            if (notebookDocument && textModel) {
                const nextValue = historyService.getNextValue(notebookDocument.uri);
                if (nextValue !== null) {
                    textModel.setValue(nextValue);
                }
            }
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'interactive.scrollToTop',
            title: localize('interactiveScrollToTop', 'Scroll to Top'),
            keybinding: {
                when: ContextKeyExpr.equals('activeEditor', 'workbench.editor.interactive'),
                primary: 2048 | 14,
                mac: { primary: 2048 | 16 },
                weight: 200
            },
            category: interactiveWindowCategory,
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const editorControl = editorService.activeEditorPane?.getControl();
        if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
            if (editorControl.notebookEditor.getLength() === 0) {
                return;
            }
            editorControl.notebookEditor.revealCellRangeInView({ start: 0, end: 1 });
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'interactive.scrollToBottom',
            title: localize('interactiveScrollToBottom', 'Scroll to Bottom'),
            keybinding: {
                when: ContextKeyExpr.equals('activeEditor', 'workbench.editor.interactive'),
                primary: 2048 | 13,
                mac: { primary: 2048 | 18 },
                weight: 200
            },
            category: interactiveWindowCategory,
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const editorControl = editorService.activeEditorPane?.getControl();
        if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
            if (editorControl.notebookEditor.getLength() === 0) {
                return;
            }
            const len = editorControl.notebookEditor.getLength();
            editorControl.notebookEditor.revealCellRangeInView({ start: len - 1, end: len });
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'interactive.input.focus',
            title: localize2('interactive.input.focus', 'Focus Input Editor'),
            category: interactiveWindowCategory,
            menu: {
                id: MenuId.CommandPalette,
                when: InteractiveWindowOpen,
            },
            keybinding: {
                when: ContextKeyExpr.and(IS_COMPOSITE_NOTEBOOK, NOTEBOOK_EDITOR_FOCUSED),
                weight: 200 + 5,
                primary: 2048 | 18
            }
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const editorControl = editorService.activeEditorPane?.getControl();
        if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
            editorService.activeEditorPane?.focus();
        }
        else {
            const openEditors = editorService.getEditors(0);
            const interactiveWindow = Iterable.find(openEditors, identifier => { return identifier.editor.typeId === InteractiveEditorInput.ID; });
            if (interactiveWindow) {
                const editorInput = interactiveWindow.editor;
                const currentGroup = interactiveWindow.groupId;
                const editor = await editorService.openEditor(editorInput, currentGroup);
                const editorControl = editor?.getControl();
                if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
                    editorService.activeEditorPane?.focus();
                }
            }
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'interactive.history.focus',
            title: localize2('interactive.history.focus', 'Focus History'),
            category: interactiveWindowCategory,
            menu: {
                id: MenuId.CommandPalette,
                when: ContextKeyExpr.equals('activeEditor', 'workbench.editor.interactive'),
            },
            keybinding: [{
                    when: ContextKeyExpr.and(INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo('bottom'), INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo('none')),
                    weight: 200 + 5,
                    primary: 2048 | 16
                },
                {
                    when: ContextKeyExpr.or(IsWindowsContext, IsLinuxContext),
                    weight: 200,
                    primary: 2048 | 16,
                }],
            precondition: ContextKeyExpr.and(IS_COMPOSITE_NOTEBOOK, NOTEBOOK_EDITOR_FOCUSED.negate())
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const editorControl = editorService.activeEditorPane?.getControl();
        if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
            editorControl.notebookEditor.focus();
        }
    }
});
registerColor('interactive.activeCodeBorder', {
    dark: ifDefinedThenElse(peekViewBorder, peekViewBorder, '#007acc'),
    light: ifDefinedThenElse(peekViewBorder, peekViewBorder, '#007acc'),
    hcDark: contrastBorder,
    hcLight: contrastBorder
}, localize('interactive.activeCodeBorder', 'The border color for the current interactive code cell when the editor has focus.'));
registerColor('interactive.inactiveCodeBorder', {
    dark: ifDefinedThenElse(listInactiveSelectionBackground, listInactiveSelectionBackground, '#37373D'),
    light: ifDefinedThenElse(listInactiveSelectionBackground, listInactiveSelectionBackground, '#E4E6F1'),
    hcDark: PANEL_BORDER,
    hcLight: PANEL_BORDER
}, localize('interactive.inactiveCodeBorder', 'The border color for the current interactive code cell when the editor does not have focus.'));
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
    id: 'interactiveWindow',
    order: 100,
    type: 'object',
    'properties': {
        [InteractiveWindowSetting.interactiveWindowAlwaysScrollOnNewCell]: {
            type: 'boolean',
            default: true,
            markdownDescription: localize('interactiveWindow.alwaysScrollOnNewCell', "Automatically scroll the interactive window to show the output of the last statement executed. If this value is false, the window will only scroll if the last cell was already the one scrolled to.")
        },
        [NotebookSetting.InteractiveWindowPromptToSave]: {
            type: 'boolean',
            default: false,
            markdownDescription: localize('interactiveWindow.promptToSaveOnClose', "Prompt to save the interactive window when it is closed. Only new interactive windows will be affected by this setting change.")
        },
        [InteractiveWindowSetting.executeWithShiftEnter]: {
            type: 'boolean',
            default: false,
            markdownDescription: localize('interactiveWindow.executeWithShiftEnter', "Execute the Interactive Window (REPL) input box with shift+enter, so that enter can be used to create a newline."),
            tags: ['replExecute']
        },
        [InteractiveWindowSetting.showExecutionHint]: {
            type: 'boolean',
            default: true,
            markdownDescription: localize('interactiveWindow.showExecutionHint', "Display a hint in the Interactive Window (REPL) input box to indicate how to execute code."),
            tags: ['replExecute']
        }
    }
});
