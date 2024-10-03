import { Disposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_IS_ACTIVE_EDITOR } from '../../common/notebookContextKeys.js';
import { getNotebookEditorFromEditorPane } from '../notebookBrowser.js';
import { FoldingModel } from '../viewModel/foldingModel.js';
import { CellKind } from '../../common/notebookCommon.js';
import { registerNotebookContribution } from '../notebookEditorExtensions.js';
import { registerAction2, Action2 } from '../../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { InputFocusedContextKey } from '../../../../../platform/contextkey/common/contextkeys.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { NOTEBOOK_ACTIONS_CATEGORY } from './coreActions.js';
import { localize, localize2 } from '../../../../../nls.js';
export class FoldingController extends Disposable {
    static { this.id = 'workbench.notebook.foldingController'; }
    constructor(_notebookEditor) {
        super();
        this._notebookEditor = _notebookEditor;
        this._foldingModel = null;
        this._localStore = this._register(new DisposableStore());
        this._register(this._notebookEditor.onMouseUp(e => { this.onMouseUp(e); }));
        this._register(this._notebookEditor.onDidChangeModel(() => {
            this._localStore.clear();
            if (!this._notebookEditor.hasModel()) {
                return;
            }
            this._localStore.add(this._notebookEditor.onDidChangeCellState(e => {
                if (e.source.editStateChanged && e.cell.cellKind === CellKind.Markup) {
                    this._foldingModel?.recompute();
                }
            }));
            this._foldingModel = new FoldingModel();
            this._localStore.add(this._foldingModel);
            this._foldingModel.attachViewModel(this._notebookEditor.getViewModel());
            this._localStore.add(this._foldingModel.onDidFoldingRegionChanged(() => {
                this._updateEditorFoldingRanges();
            }));
        }));
    }
    saveViewState() {
        return this._foldingModel?.getMemento() || [];
    }
    restoreViewState(state) {
        this._foldingModel?.applyMemento(state || []);
        this._updateEditorFoldingRanges();
    }
    setFoldingStateDown(index, state, levels) {
        const doCollapse = state === 2;
        const region = this._foldingModel.getRegionAtLine(index + 1);
        const regions = [];
        if (region) {
            if (region.isCollapsed !== doCollapse) {
                regions.push(region);
            }
            if (levels > 1) {
                const regionsInside = this._foldingModel.getRegionsInside(region, (r, level) => r.isCollapsed !== doCollapse && level < levels);
                regions.push(...regionsInside);
            }
        }
        regions.forEach(r => this._foldingModel.setCollapsed(r.regionIndex, state === 2));
        this._updateEditorFoldingRanges();
    }
    setFoldingStateUp(index, state, levels) {
        if (!this._foldingModel) {
            return;
        }
        const regions = this._foldingModel.getAllRegionsAtLine(index + 1, (region, level) => region.isCollapsed !== (state === 2) && level <= levels);
        regions.forEach(r => this._foldingModel.setCollapsed(r.regionIndex, state === 2));
        this._updateEditorFoldingRanges();
    }
    _updateEditorFoldingRanges() {
        if (!this._foldingModel) {
            return;
        }
        if (!this._notebookEditor.hasModel()) {
            return;
        }
        const vm = this._notebookEditor.getViewModel();
        vm.updateFoldingRanges(this._foldingModel.regions);
        const hiddenRanges = vm.getHiddenRanges();
        this._notebookEditor.setHiddenAreas(hiddenRanges);
    }
    onMouseUp(e) {
        if (!e.event.target) {
            return;
        }
        if (!this._notebookEditor.hasModel()) {
            return;
        }
        const viewModel = this._notebookEditor.getViewModel();
        const target = e.event.target;
        if (target.classList.contains('codicon-notebook-collapsed') || target.classList.contains('codicon-notebook-expanded')) {
            const parent = target.parentElement;
            if (!parent.classList.contains('notebook-folding-indicator')) {
                return;
            }
            const cellViewModel = e.target;
            const modelIndex = viewModel.getCellIndex(cellViewModel);
            const state = viewModel.getFoldingState(modelIndex);
            if (state === 0) {
                return;
            }
            this.setFoldingStateUp(modelIndex, state === 2 ? 1 : 2, 1);
            this._notebookEditor.focusElement(cellViewModel);
        }
        return;
    }
}
registerNotebookContribution(FoldingController.id, FoldingController);
const NOTEBOOK_FOLD_COMMAND_LABEL = localize('fold.cell', "Fold Cell");
const NOTEBOOK_UNFOLD_COMMAND_LABEL = localize2('unfold.cell', "Unfold Cell");
const FOLDING_COMMAND_ARGS = {
    args: [{
            isOptional: true,
            name: 'index',
            description: 'The cell index',
            schema: {
                'type': 'object',
                'required': ['index', 'direction'],
                'properties': {
                    'index': {
                        'type': 'number'
                    },
                    'direction': {
                        'type': 'string',
                        'enum': ['up', 'down'],
                        'default': 'down'
                    },
                    'levels': {
                        'type': 'number',
                        'default': 1
                    },
                }
            }
        }]
};
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.fold',
            title: localize2('fold.cell', "Fold Cell"),
            category: NOTEBOOK_ACTIONS_CATEGORY,
            keybinding: {
                when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey)),
                primary: 2048 | 1024 | 92,
                mac: {
                    primary: 2048 | 512 | 92,
                    secondary: [15],
                },
                secondary: [15],
                weight: 200
            },
            metadata: {
                description: NOTEBOOK_FOLD_COMMAND_LABEL,
                args: FOLDING_COMMAND_ARGS.args
            },
            precondition: NOTEBOOK_IS_ACTIVE_EDITOR,
            f1: true
        });
    }
    async run(accessor, args) {
        const editorService = accessor.get(IEditorService);
        const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
        if (!editor) {
            return;
        }
        if (!editor.hasModel()) {
            return;
        }
        const levels = args && args.levels || 1;
        const direction = args && args.direction === 'up' ? 'up' : 'down';
        let index = undefined;
        if (args) {
            index = args.index;
        }
        else {
            const activeCell = editor.getActiveCell();
            if (!activeCell) {
                return;
            }
            index = editor.getCellIndex(activeCell);
        }
        const controller = editor.getContribution(FoldingController.id);
        if (index !== undefined) {
            const targetCell = (index < 0 || index >= editor.getLength()) ? undefined : editor.cellAt(index);
            if (targetCell?.cellKind === CellKind.Code && direction === 'down') {
                return;
            }
            if (direction === 'up') {
                controller.setFoldingStateUp(index, 2, levels);
            }
            else {
                controller.setFoldingStateDown(index, 2, levels);
            }
            const viewIndex = editor.getViewModel().getNearestVisibleCellIndexUpwards(index);
            editor.focusElement(editor.cellAt(viewIndex));
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.unfold',
            title: NOTEBOOK_UNFOLD_COMMAND_LABEL,
            category: NOTEBOOK_ACTIONS_CATEGORY,
            keybinding: {
                when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey)),
                primary: 2048 | 1024 | 94,
                mac: {
                    primary: 2048 | 512 | 94,
                    secondary: [17],
                },
                secondary: [17],
                weight: 200
            },
            metadata: {
                description: NOTEBOOK_UNFOLD_COMMAND_LABEL,
                args: FOLDING_COMMAND_ARGS.args
            },
            precondition: NOTEBOOK_IS_ACTIVE_EDITOR,
            f1: true
        });
    }
    async run(accessor, args) {
        const editorService = accessor.get(IEditorService);
        const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
        if (!editor) {
            return;
        }
        const levels = args && args.levels || 1;
        const direction = args && args.direction === 'up' ? 'up' : 'down';
        let index = undefined;
        if (args) {
            index = args.index;
        }
        else {
            const activeCell = editor.getActiveCell();
            if (!activeCell) {
                return;
            }
            index = editor.getCellIndex(activeCell);
        }
        const controller = editor.getContribution(FoldingController.id);
        if (index !== undefined) {
            if (direction === 'up') {
                controller.setFoldingStateUp(index, 1, levels);
            }
            else {
                controller.setFoldingStateDown(index, 1, levels);
            }
        }
    }
});
