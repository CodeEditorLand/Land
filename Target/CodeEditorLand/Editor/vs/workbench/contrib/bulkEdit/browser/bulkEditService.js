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
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { toDisposable } from '../../../../base/common/lifecycle.js';
import { LinkedList } from '../../../../base/common/linkedList.js';
import { ResourceMap, ResourceSet } from '../../../../base/common/map.js';
import { isCodeEditor, isDiffEditor } from '../../../../editor/browser/editorBrowser.js';
import { IBulkEditService, ResourceFileEdit, ResourceTextEdit } from '../../../../editor/browser/services/bulkEditService.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Extensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { Progress } from '../../../../platform/progress/common/progress.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { UndoRedoGroup } from '../../../../platform/undoRedo/common/undoRedo.js';
import { BulkCellEdits, ResourceNotebookCellEdit } from './bulkCellEdits.js';
import { BulkFileEdits } from './bulkFileEdits.js';
import { BulkTextEdits } from './bulkTextEdits.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { IWorkingCopyService } from '../../../services/workingCopy/common/workingCopyService.js';
function liftEdits(edits) {
    return edits.map(edit => {
        if (ResourceTextEdit.is(edit)) {
            return ResourceTextEdit.lift(edit);
        }
        if (ResourceFileEdit.is(edit)) {
            return ResourceFileEdit.lift(edit);
        }
        if (ResourceNotebookCellEdit.is(edit)) {
            return ResourceNotebookCellEdit.lift(edit);
        }
        throw new Error('Unsupported edit');
    });
}
let BulkEdit = class BulkEdit {
    constructor(_label, _code, _editor, _progress, _token, _edits, _undoRedoGroup, _undoRedoSource, _confirmBeforeUndo, _instaService, _logService) {
        this._label = _label;
        this._code = _code;
        this._editor = _editor;
        this._progress = _progress;
        this._token = _token;
        this._edits = _edits;
        this._undoRedoGroup = _undoRedoGroup;
        this._undoRedoSource = _undoRedoSource;
        this._confirmBeforeUndo = _confirmBeforeUndo;
        this._instaService = _instaService;
        this._logService = _logService;
    }
    ariaMessage() {
        const otherResources = new ResourceMap();
        const textEditResources = new ResourceMap();
        let textEditCount = 0;
        for (const edit of this._edits) {
            if (edit instanceof ResourceTextEdit) {
                textEditCount += 1;
                textEditResources.set(edit.resource, true);
            }
            else if (edit instanceof ResourceFileEdit) {
                otherResources.set(edit.oldResource ?? edit.newResource, true);
            }
        }
        if (this._edits.length === 0) {
            return localize('summary.0', "Made no edits");
        }
        else if (otherResources.size === 0) {
            if (textEditCount > 1 && textEditResources.size > 1) {
                return localize('summary.nm', "Made {0} text edits in {1} files", textEditCount, textEditResources.size);
            }
            else {
                return localize('summary.n0', "Made {0} text edits in one file", textEditCount);
            }
        }
        else {
            return localize('summary.textFiles', "Made {0} text edits in {1} files, also created or deleted {2} files", textEditCount, textEditResources.size, otherResources.size);
        }
    }
    async perform() {
        if (this._edits.length === 0) {
            return [];
        }
        const ranges = [1];
        for (let i = 1; i < this._edits.length; i++) {
            if (Object.getPrototypeOf(this._edits[i - 1]) === Object.getPrototypeOf(this._edits[i])) {
                ranges[ranges.length - 1]++;
            }
            else {
                ranges.push(1);
            }
        }
        const increment = this._edits.length > 1 ? 0 : undefined;
        this._progress.report({ increment, total: 100 });
        const progress = { report: _ => this._progress.report({ increment: 100 / this._edits.length }) };
        const resources = [];
        let index = 0;
        for (const range of ranges) {
            if (this._token.isCancellationRequested) {
                break;
            }
            const group = this._edits.slice(index, index + range);
            if (group[0] instanceof ResourceFileEdit) {
                resources.push(await this._performFileEdits(group, this._undoRedoGroup, this._undoRedoSource, this._confirmBeforeUndo, progress));
            }
            else if (group[0] instanceof ResourceTextEdit) {
                resources.push(await this._performTextEdits(group, this._undoRedoGroup, this._undoRedoSource, progress));
            }
            else if (group[0] instanceof ResourceNotebookCellEdit) {
                resources.push(await this._performCellEdits(group, this._undoRedoGroup, this._undoRedoSource, progress));
            }
            else {
                console.log('UNKNOWN EDIT');
            }
            index = index + range;
        }
        return resources.flat();
    }
    async _performFileEdits(edits, undoRedoGroup, undoRedoSource, confirmBeforeUndo, progress) {
        this._logService.debug('_performFileEdits', JSON.stringify(edits));
        const model = this._instaService.createInstance(BulkFileEdits, this._label || localize('workspaceEdit', "Workspace Edit"), this._code || 'undoredo.workspaceEdit', undoRedoGroup, undoRedoSource, confirmBeforeUndo, progress, this._token, edits);
        return await model.apply();
    }
    async _performTextEdits(edits, undoRedoGroup, undoRedoSource, progress) {
        this._logService.debug('_performTextEdits', JSON.stringify(edits));
        const model = this._instaService.createInstance(BulkTextEdits, this._label || localize('workspaceEdit', "Workspace Edit"), this._code || 'undoredo.workspaceEdit', this._editor, undoRedoGroup, undoRedoSource, progress, this._token, edits);
        return await model.apply();
    }
    async _performCellEdits(edits, undoRedoGroup, undoRedoSource, progress) {
        this._logService.debug('_performCellEdits', JSON.stringify(edits));
        const model = this._instaService.createInstance(BulkCellEdits, undoRedoGroup, undoRedoSource, progress, this._token, edits);
        return await model.apply();
    }
};
BulkEdit = __decorate([
    __param(9, IInstantiationService),
    __param(10, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Array, UndoRedoGroup, Object, Boolean, Object, Object])
], BulkEdit);
let BulkEditService = class BulkEditService {
    constructor(_instaService, _logService, _editorService, _lifecycleService, _dialogService, _workingCopyService, _configService) {
        this._instaService = _instaService;
        this._logService = _logService;
        this._editorService = _editorService;
        this._lifecycleService = _lifecycleService;
        this._dialogService = _dialogService;
        this._workingCopyService = _workingCopyService;
        this._configService = _configService;
        this._activeUndoRedoGroups = new LinkedList();
    }
    setPreviewHandler(handler) {
        this._previewHandler = handler;
        return toDisposable(() => {
            if (this._previewHandler === handler) {
                this._previewHandler = undefined;
            }
        });
    }
    hasPreviewHandler() {
        return Boolean(this._previewHandler);
    }
    async apply(editsIn, options) {
        let edits = liftEdits(Array.isArray(editsIn) ? editsIn : editsIn.edits);
        if (edits.length === 0) {
            return { ariaSummary: localize('nothing', "Made no edits"), isApplied: false };
        }
        if (this._previewHandler && (options?.showPreview || edits.some(value => value.metadata?.needsConfirmation))) {
            edits = await this._previewHandler(edits, options);
        }
        let codeEditor = options?.editor;
        if (!codeEditor) {
            const candidate = this._editorService.activeTextEditorControl;
            if (isCodeEditor(candidate)) {
                codeEditor = candidate;
            }
            else if (isDiffEditor(candidate)) {
                codeEditor = candidate.getModifiedEditor();
            }
        }
        if (codeEditor && codeEditor.getOption(94)) {
            codeEditor = undefined;
        }
        let undoRedoGroup;
        let undoRedoGroupRemove = () => { };
        if (typeof options?.undoRedoGroupId === 'number') {
            for (const candidate of this._activeUndoRedoGroups) {
                if (candidate.id === options.undoRedoGroupId) {
                    undoRedoGroup = candidate;
                    break;
                }
            }
        }
        if (!undoRedoGroup) {
            undoRedoGroup = new UndoRedoGroup();
            undoRedoGroupRemove = this._activeUndoRedoGroups.push(undoRedoGroup);
        }
        const label = options?.quotableLabel || options?.label;
        const bulkEdit = this._instaService.createInstance(BulkEdit, label, options?.code, codeEditor, options?.progress ?? Progress.None, options?.token ?? CancellationToken.None, edits, undoRedoGroup, options?.undoRedoSource, !!options?.confirmBeforeUndo);
        let listener;
        try {
            listener = this._lifecycleService.onBeforeShutdown(e => e.veto(this._shouldVeto(label, e.reason), 'veto.blukEditService'));
            const resources = await bulkEdit.perform();
            if (options?.respectAutoSaveConfig && this._configService.getValue(autoSaveSetting) === true && resources.length > 1) {
                await this._saveAll(resources);
            }
            return { ariaSummary: bulkEdit.ariaMessage(), isApplied: edits.length > 0 };
        }
        catch (err) {
            this._logService.error(err);
            throw err;
        }
        finally {
            listener?.dispose();
            undoRedoGroupRemove();
        }
    }
    async _saveAll(resources) {
        const set = new ResourceSet(resources);
        const saves = this._workingCopyService.dirtyWorkingCopies.map(async (copy) => {
            if (set.has(copy.resource)) {
                await copy.save();
            }
        });
        const result = await Promise.allSettled(saves);
        for (const item of result) {
            if (item.status === 'rejected') {
                this._logService.warn(item.reason);
            }
        }
    }
    async _shouldVeto(label, reason) {
        let message;
        let primaryButton;
        switch (reason) {
            case 1:
                message = localize('closeTheWindow.message', "Are you sure you want to close the window?");
                primaryButton = localize({ key: 'closeTheWindow', comment: ['&& denotes a mnemonic'] }, "&&Close Window");
                break;
            case 4:
                message = localize('changeWorkspace.message', "Are you sure you want to change the workspace?");
                primaryButton = localize({ key: 'changeWorkspace', comment: ['&& denotes a mnemonic'] }, "Change &&Workspace");
                break;
            case 3:
                message = localize('reloadTheWindow.message', "Are you sure you want to reload the window?");
                primaryButton = localize({ key: 'reloadTheWindow', comment: ['&& denotes a mnemonic'] }, "&&Reload Window");
                break;
            default:
                message = localize('quit.message', "Are you sure you want to quit?");
                primaryButton = localize({ key: 'quit', comment: ['&& denotes a mnemonic'] }, "&&Quit");
                break;
        }
        const result = await this._dialogService.confirm({
            message,
            detail: localize('areYouSureQuiteBulkEdit.detail', "'{0}' is in progress.", label || localize('fileOperation', "File operation")),
            primaryButton
        });
        return !result.confirmed;
    }
};
BulkEditService = __decorate([
    __param(0, IInstantiationService),
    __param(1, ILogService),
    __param(2, IEditorService),
    __param(3, ILifecycleService),
    __param(4, IDialogService),
    __param(5, IWorkingCopyService),
    __param(6, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], BulkEditService);
export { BulkEditService };
registerSingleton(IBulkEditService, BulkEditService, 1);
const autoSaveSetting = 'files.refactoring.autoSave';
Registry.as(Extensions.Configuration).registerConfiguration({
    id: 'files',
    properties: {
        [autoSaveSetting]: {
            description: localize('refactoring.autoSave', "Controls if files that were part of a refactoring are saved automatically"),
            default: true,
            type: 'boolean'
        }
    }
});
