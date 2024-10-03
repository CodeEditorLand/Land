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
var ReplaceService_1;
import * as nls from '../../../../nls.js';
import * as network from '../../../../base/common/network.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IReplaceService } from './replace.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { Match, FileMatch, ISearchViewModelWorkbenchService, MatchInNotebook } from './searchModel.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { createTextBufferFactoryFromSnapshot } from '../../../../editor/common/model/textModel.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { IBulkEditService, ResourceTextEdit } from '../../../../editor/browser/services/bulkEditService.js';
import { Range } from '../../../../editor/common/core/range.js';
import { EditOperation } from '../../../../editor/common/core/editOperation.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { dirname } from '../../../../base/common/resources.js';
import { Promises } from '../../../../base/common/async.js';
import { SaveSourceRegistry } from '../../../common/editor.js';
import { CellUri } from '../../notebook/common/notebookCommon.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
const REPLACE_PREVIEW = 'replacePreview';
const toReplaceResource = (fileResource) => {
    return fileResource.with({ scheme: network.Schemas.internal, fragment: REPLACE_PREVIEW, query: JSON.stringify({ scheme: fileResource.scheme }) });
};
const toFileResource = (replaceResource) => {
    return replaceResource.with({ scheme: JSON.parse(replaceResource.query)['scheme'], fragment: '', query: '' });
};
let ReplacePreviewContentProvider = class ReplacePreviewContentProvider {
    static { this.ID = 'workbench.contrib.replacePreviewContentProvider'; }
    constructor(instantiationService, textModelResolverService) {
        this.instantiationService = instantiationService;
        this.textModelResolverService = textModelResolverService;
        this.textModelResolverService.registerTextModelContentProvider(network.Schemas.internal, this);
    }
    provideTextContent(uri) {
        if (uri.fragment === REPLACE_PREVIEW) {
            return this.instantiationService.createInstance(ReplacePreviewModel).resolve(uri);
        }
        return null;
    }
};
ReplacePreviewContentProvider = __decorate([
    __param(0, IInstantiationService),
    __param(1, ITextModelService),
    __metadata("design:paramtypes", [Object, Object])
], ReplacePreviewContentProvider);
export { ReplacePreviewContentProvider };
let ReplacePreviewModel = class ReplacePreviewModel extends Disposable {
    constructor(modelService, languageService, textModelResolverService, replaceService, searchWorkbenchService) {
        super();
        this.modelService = modelService;
        this.languageService = languageService;
        this.textModelResolverService = textModelResolverService;
        this.replaceService = replaceService;
        this.searchWorkbenchService = searchWorkbenchService;
    }
    async resolve(replacePreviewUri) {
        const fileResource = toFileResource(replacePreviewUri);
        const fileMatch = this.searchWorkbenchService.searchModel.searchResult.matches(false).filter(match => match.resource.toString() === fileResource.toString())[0];
        const ref = this._register(await this.textModelResolverService.createModelReference(fileResource));
        const sourceModel = ref.object.textEditorModel;
        const sourceModelLanguageId = sourceModel.getLanguageId();
        const replacePreviewModel = this.modelService.createModel(createTextBufferFactoryFromSnapshot(sourceModel.createSnapshot()), this.languageService.createById(sourceModelLanguageId), replacePreviewUri);
        this._register(fileMatch.onChange(({ forceUpdateModel }) => this.update(sourceModel, replacePreviewModel, fileMatch, forceUpdateModel)));
        this._register(this.searchWorkbenchService.searchModel.onReplaceTermChanged(() => this.update(sourceModel, replacePreviewModel, fileMatch)));
        this._register(fileMatch.onDispose(() => replacePreviewModel.dispose()));
        this._register(replacePreviewModel.onWillDispose(() => this.dispose()));
        this._register(sourceModel.onWillDispose(() => this.dispose()));
        return replacePreviewModel;
    }
    update(sourceModel, replacePreviewModel, fileMatch, override = false) {
        if (!sourceModel.isDisposed() && !replacePreviewModel.isDisposed()) {
            this.replaceService.updateReplacePreview(fileMatch, override);
        }
    }
};
ReplacePreviewModel = __decorate([
    __param(0, IModelService),
    __param(1, ILanguageService),
    __param(2, ITextModelService),
    __param(3, IReplaceService),
    __param(4, ISearchViewModelWorkbenchService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ReplacePreviewModel);
let ReplaceService = class ReplaceService {
    static { ReplaceService_1 = this; }
    static { this.REPLACE_SAVE_SOURCE = SaveSourceRegistry.registerSource('searchReplace.source', nls.localize('searchReplace.source', "Search and Replace")); }
    constructor(textFileService, editorService, textModelResolverService, bulkEditorService, labelService, notebookEditorModelResolverService) {
        this.textFileService = textFileService;
        this.editorService = editorService;
        this.textModelResolverService = textModelResolverService;
        this.bulkEditorService = bulkEditorService;
        this.labelService = labelService;
        this.notebookEditorModelResolverService = notebookEditorModelResolverService;
    }
    async replace(arg, progress = undefined, resource = null) {
        const edits = this.createEdits(arg, resource);
        await this.bulkEditorService.apply(edits, { progress });
        const rawTextPromises = edits.map(async (e) => {
            if (e.resource.scheme === network.Schemas.vscodeNotebookCell) {
                const notebookResource = CellUri.parse(e.resource)?.notebook;
                if (notebookResource) {
                    let ref;
                    try {
                        ref = await this.notebookEditorModelResolverService.resolve(notebookResource);
                        await ref.object.save({ source: ReplaceService_1.REPLACE_SAVE_SOURCE });
                    }
                    finally {
                        ref?.dispose();
                    }
                }
                return;
            }
            else {
                return this.textFileService.files.get(e.resource)?.save({ source: ReplaceService_1.REPLACE_SAVE_SOURCE });
            }
        });
        return Promises.settled(rawTextPromises);
    }
    async openReplacePreview(element, preserveFocus, sideBySide, pinned) {
        const fileMatch = element instanceof Match ? element.parent() : element;
        const editor = await this.editorService.openEditor({
            original: { resource: fileMatch.resource },
            modified: { resource: toReplaceResource(fileMatch.resource) },
            label: nls.localize('fileReplaceChanges', "{0} ↔ {1} (Replace Preview)", fileMatch.name(), fileMatch.name()),
            description: this.labelService.getUriLabel(dirname(fileMatch.resource), { relative: true }),
            options: {
                preserveFocus,
                pinned,
                revealIfVisible: true
            }
        });
        const input = editor?.input;
        const disposable = fileMatch.onDispose(() => {
            input?.dispose();
            disposable.dispose();
        });
        await this.updateReplacePreview(fileMatch);
        if (editor) {
            const editorControl = editor.getControl();
            if (element instanceof Match && editorControl) {
                editorControl.revealLineInCenter(element.range().startLineNumber, 1);
            }
        }
    }
    async updateReplacePreview(fileMatch, override = false) {
        const replacePreviewUri = toReplaceResource(fileMatch.resource);
        const [sourceModelRef, replaceModelRef] = await Promise.all([this.textModelResolverService.createModelReference(fileMatch.resource), this.textModelResolverService.createModelReference(replacePreviewUri)]);
        const sourceModel = sourceModelRef.object.textEditorModel;
        const replaceModel = replaceModelRef.object.textEditorModel;
        try {
            if (sourceModel && replaceModel) {
                if (override) {
                    replaceModel.setValue(sourceModel.getValue());
                }
                else {
                    replaceModel.undo();
                }
                this.applyEditsToPreview(fileMatch, replaceModel);
            }
        }
        finally {
            sourceModelRef.dispose();
            replaceModelRef.dispose();
        }
    }
    applyEditsToPreview(fileMatch, replaceModel) {
        const resourceEdits = this.createEdits(fileMatch, replaceModel.uri);
        const modelEdits = [];
        for (const resourceEdit of resourceEdits) {
            modelEdits.push(EditOperation.replaceMove(Range.lift(resourceEdit.textEdit.range), resourceEdit.textEdit.text));
        }
        replaceModel.pushEditOperations([], modelEdits.sort((a, b) => Range.compareRangesUsingStarts(a.range, b.range)), () => []);
    }
    createEdits(arg, resource = null) {
        const edits = [];
        if (arg instanceof Match) {
            if (!arg.isReadonly()) {
                if (arg instanceof MatchInNotebook) {
                    const match = arg;
                    edits.push(this.createEdit(match, match.replaceString, match.cell?.uri));
                }
                else {
                    const match = arg;
                    edits.push(this.createEdit(match, match.replaceString, resource));
                }
            }
        }
        if (arg instanceof FileMatch) {
            arg = [arg];
        }
        if (arg instanceof Array) {
            arg.forEach(element => {
                const fileMatch = element;
                if (fileMatch.count() > 0) {
                    edits.push(...fileMatch.matches().flatMap(match => this.createEdits(match, resource)));
                }
            });
        }
        return edits;
    }
    createEdit(match, text, resource = null) {
        const fileMatch = match.parent();
        return new ResourceTextEdit(resource ?? fileMatch.resource, { range: match.range(), text }, undefined, undefined);
    }
};
ReplaceService = ReplaceService_1 = __decorate([
    __param(0, ITextFileService),
    __param(1, IEditorService),
    __param(2, ITextModelService),
    __param(3, IBulkEditService),
    __param(4, ILabelService),
    __param(5, INotebookEditorModelResolverService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], ReplaceService);
export { ReplaceService };
