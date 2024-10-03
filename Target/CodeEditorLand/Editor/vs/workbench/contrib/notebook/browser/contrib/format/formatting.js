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
import { localize, localize2 } from '../../../../../../nls.js';
import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { Disposable, DisposableStore } from '../../../../../../base/common/lifecycle.js';
import { EditorAction, registerEditorAction } from '../../../../../../editor/browser/editorExtensions.js';
import { IBulkEditService, ResourceTextEdit } from '../../../../../../editor/browser/services/bulkEditService.js';
import { EditorContextKeys } from '../../../../../../editor/common/editorContextKeys.js';
import { IEditorWorkerService } from '../../../../../../editor/common/services/editorWorker.js';
import { ILanguageFeaturesService } from '../../../../../../editor/common/services/languageFeatures.js';
import { ITextModelService } from '../../../../../../editor/common/services/resolverService.js';
import { formatDocumentWithSelectedProvider, getDocumentFormattingEditsWithSelectedProvider } from '../../../../../../editor/contrib/format/browser/format.js';
import { Action2, MenuId, registerAction2 } from '../../../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { Progress } from '../../../../../../platform/progress/common/progress.js';
import { NOTEBOOK_ACTIONS_CATEGORY } from '../../controller/coreActions.js';
import { getNotebookEditorFromEditorPane } from '../../notebookBrowser.js';
import { NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_IS_ACTIVE_EDITOR } from '../../../common/notebookContextKeys.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
import { INotebookExecutionService } from '../../../common/notebookExecutionService.js';
import { NotebookSetting } from '../../../common/notebookCommon.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { Registry } from '../../../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchContributionsExtensions } from '../../../../../common/contributions.js';
import { INotebookService } from '../../../common/notebookService.js';
import { CodeActionParticipantUtils } from '../saveParticipants/saveParticipants.js';
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.format',
            title: localize2('format.title', 'Format Notebook'),
            category: NOTEBOOK_ACTIONS_CATEGORY,
            precondition: ContextKeyExpr.and(NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_EDITOR_EDITABLE),
            keybinding: {
                when: EditorContextKeys.editorTextFocus.toNegated(),
                primary: 1024 | 512 | 36,
                linux: { primary: 2048 | 1024 | 39 },
                weight: 200
            },
            f1: true,
            menu: {
                id: MenuId.EditorContext,
                when: ContextKeyExpr.and(EditorContextKeys.inCompositeEditor, EditorContextKeys.hasDocumentFormattingProvider),
                group: '1_modification',
                order: 1.3
            }
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const textModelService = accessor.get(ITextModelService);
        const editorWorkerService = accessor.get(IEditorWorkerService);
        const languageFeaturesService = accessor.get(ILanguageFeaturesService);
        const bulkEditService = accessor.get(IBulkEditService);
        const instantiationService = accessor.get(IInstantiationService);
        const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
        if (!editor || !editor.hasModel()) {
            return;
        }
        const notebook = editor.textModel;
        const formatApplied = await instantiationService.invokeFunction(CodeActionParticipantUtils.checkAndRunFormatCodeAction, notebook, Progress.None, CancellationToken.None);
        const disposable = new DisposableStore();
        try {
            if (!formatApplied) {
                const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
                    const ref = await textModelService.createModelReference(cell.uri);
                    disposable.add(ref);
                    const model = ref.object.textEditorModel;
                    const formatEdits = await getDocumentFormattingEditsWithSelectedProvider(editorWorkerService, languageFeaturesService, model, 1, CancellationToken.None);
                    const edits = [];
                    if (formatEdits) {
                        for (const edit of formatEdits) {
                            edits.push(new ResourceTextEdit(model.uri, edit, model.getVersionId()));
                        }
                        return edits;
                    }
                    return [];
                }));
                await bulkEditService.apply(allCellEdits.flat(), { label: localize('label', "Format Notebook"), code: 'undoredo.formatNotebook', });
            }
        }
        finally {
            disposable.dispose();
        }
    }
});
registerEditorAction(class FormatCellAction extends EditorAction {
    constructor() {
        super({
            id: 'notebook.formatCell',
            label: localize('formatCell.label', "Format Cell"),
            alias: 'Format Cell',
            precondition: ContextKeyExpr.and(NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_EDITOR_EDITABLE, EditorContextKeys.inCompositeEditor, EditorContextKeys.writable, EditorContextKeys.hasDocumentFormattingProvider),
            kbOpts: {
                kbExpr: ContextKeyExpr.and(EditorContextKeys.editorTextFocus),
                primary: 1024 | 512 | 36,
                linux: { primary: 2048 | 1024 | 39 },
                weight: 100
            },
            contextMenuOpts: {
                group: '1_modification',
                order: 1.301
            }
        });
    }
    async run(accessor, editor) {
        if (editor.hasModel()) {
            const instaService = accessor.get(IInstantiationService);
            await instaService.invokeFunction(formatDocumentWithSelectedProvider, editor, 1, Progress.None, CancellationToken.None, true);
        }
    }
});
let FormatOnCellExecutionParticipant = class FormatOnCellExecutionParticipant {
    constructor(bulkEditService, languageFeaturesService, textModelService, editorWorkerService, configurationService, _notebookService) {
        this.bulkEditService = bulkEditService;
        this.languageFeaturesService = languageFeaturesService;
        this.textModelService = textModelService;
        this.editorWorkerService = editorWorkerService;
        this.configurationService = configurationService;
        this._notebookService = _notebookService;
    }
    async onWillExecuteCell(executions) {
        const enabled = this.configurationService.getValue(NotebookSetting.formatOnCellExecution);
        if (!enabled) {
            return;
        }
        const disposable = new DisposableStore();
        try {
            const allCellEdits = await Promise.all(executions.map(async (cellExecution) => {
                const nbModel = this._notebookService.getNotebookTextModel(cellExecution.notebook);
                if (!nbModel) {
                    return [];
                }
                let activeCell;
                for (const cell of nbModel.cells) {
                    if (cell.handle === cellExecution.cellHandle) {
                        activeCell = cell;
                        break;
                    }
                }
                if (!activeCell) {
                    return [];
                }
                const ref = await this.textModelService.createModelReference(activeCell.uri);
                disposable.add(ref);
                const model = ref.object.textEditorModel;
                const formatEdits = await getDocumentFormattingEditsWithSelectedProvider(this.editorWorkerService, this.languageFeaturesService, model, 2, CancellationToken.None);
                const edits = [];
                if (formatEdits) {
                    edits.push(...formatEdits.map(edit => new ResourceTextEdit(model.uri, edit, model.getVersionId())));
                    return edits;
                }
                return [];
            }));
            await this.bulkEditService.apply(allCellEdits.flat(), { label: localize('formatCells.label', "Format Cells"), code: 'undoredo.notebooks.onWillExecuteFormat', });
        }
        finally {
            disposable.dispose();
        }
    }
};
FormatOnCellExecutionParticipant = __decorate([
    __param(0, IBulkEditService),
    __param(1, ILanguageFeaturesService),
    __param(2, ITextModelService),
    __param(3, IEditorWorkerService),
    __param(4, IConfigurationService),
    __param(5, INotebookService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], FormatOnCellExecutionParticipant);
let CellExecutionParticipantsContribution = class CellExecutionParticipantsContribution extends Disposable {
    constructor(instantiationService, notebookExecutionService) {
        super();
        this.instantiationService = instantiationService;
        this.notebookExecutionService = notebookExecutionService;
        this.registerKernelExecutionParticipants();
    }
    registerKernelExecutionParticipants() {
        this._register(this.notebookExecutionService.registerExecutionParticipant(this.instantiationService.createInstance(FormatOnCellExecutionParticipant)));
    }
};
CellExecutionParticipantsContribution = __decorate([
    __param(0, IInstantiationService),
    __param(1, INotebookExecutionService),
    __metadata("design:paramtypes", [Object, Object])
], CellExecutionParticipantsContribution);
export { CellExecutionParticipantsContribution };
const workbenchContributionsRegistry = Registry.as(WorkbenchContributionsExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(CellExecutionParticipantsContribution, 3);
