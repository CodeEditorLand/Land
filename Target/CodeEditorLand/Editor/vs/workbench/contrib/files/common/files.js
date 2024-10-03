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
var TextFileContentProvider_1;
import { EditorResourceAccessor, SideBySideEditor } from '../../../common/editor.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ContextKeyExpr, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { InputFocusedContextKey } from '../../../../platform/contextkey/common/contextkeys.js';
import { Event } from '../../../../base/common/event.js';
import { localize } from '../../../../nls.js';
export const VIEWLET_ID = 'workbench.view.explorer';
export const VIEW_ID = 'workbench.explorer.fileView';
export const ExplorerViewletVisibleContext = new RawContextKey('explorerViewletVisible', true, { type: 'boolean', description: localize('explorerViewletVisible', "True when the EXPLORER viewlet is visible.") });
export const FoldersViewVisibleContext = new RawContextKey('foldersViewVisible', true, { type: 'boolean', description: localize('foldersViewVisible', "True when the FOLDERS view (the file tree within the explorer view container) is visible.") });
export const ExplorerFolderContext = new RawContextKey('explorerResourceIsFolder', false, { type: 'boolean', description: localize('explorerResourceIsFolder', "True when the focused item in the EXPLORER is a folder.") });
export const ExplorerResourceReadonlyContext = new RawContextKey('explorerResourceReadonly', false, { type: 'boolean', description: localize('explorerResourceReadonly', "True when the focused item in the EXPLORER is read-only.") });
export const ExplorerResourceNotReadonlyContext = ExplorerResourceReadonlyContext.toNegated();
export const ExplorerResourceAvailableEditorIdsContext = new RawContextKey('explorerResourceAvailableEditorIds', '');
export const ExplorerRootContext = new RawContextKey('explorerResourceIsRoot', false, { type: 'boolean', description: localize('explorerResourceIsRoot', "True when the focused item in the EXPLORER is a root folder.") });
export const ExplorerResourceCut = new RawContextKey('explorerResourceCut', false, { type: 'boolean', description: localize('explorerResourceCut', "True when an item in the EXPLORER has been cut for cut and paste.") });
export const ExplorerResourceMoveableToTrash = new RawContextKey('explorerResourceMoveableToTrash', false, { type: 'boolean', description: localize('explorerResourceMoveableToTrash', "True when the focused item in the EXPLORER can be moved to trash.") });
export const FilesExplorerFocusedContext = new RawContextKey('filesExplorerFocus', true, { type: 'boolean', description: localize('filesExplorerFocus', "True when the focus is inside the EXPLORER view.") });
export const OpenEditorsFocusedContext = new RawContextKey('openEditorsFocus', true, { type: 'boolean', description: localize('openEditorsFocus', "True when the focus is inside the OPEN EDITORS view.") });
export const ExplorerFocusedContext = new RawContextKey('explorerViewletFocus', true, { type: 'boolean', description: localize('explorerViewletFocus', "True when the focus is inside the EXPLORER viewlet.") });
export const ExplorerCompressedFocusContext = new RawContextKey('explorerViewletCompressedFocus', true, { type: 'boolean', description: localize('explorerViewletCompressedFocus', "True when the focused item in the EXPLORER view is a compact item.") });
export const ExplorerCompressedFirstFocusContext = new RawContextKey('explorerViewletCompressedFirstFocus', true, { type: 'boolean', description: localize('explorerViewletCompressedFirstFocus', "True when the focus is inside a compact item's first part in the EXPLORER view.") });
export const ExplorerCompressedLastFocusContext = new RawContextKey('explorerViewletCompressedLastFocus', true, { type: 'boolean', description: localize('explorerViewletCompressedLastFocus', "True when the focus is inside a compact item's last part in the EXPLORER view.") });
export const ViewHasSomeCollapsibleRootItemContext = new RawContextKey('viewHasSomeCollapsibleItem', false, { type: 'boolean', description: localize('viewHasSomeCollapsibleItem', "True when a workspace in the EXPLORER view has some collapsible root child.") });
export const FilesExplorerFocusCondition = ContextKeyExpr.and(FoldersViewVisibleContext, FilesExplorerFocusedContext, ContextKeyExpr.not(InputFocusedContextKey));
export const ExplorerFocusCondition = ContextKeyExpr.and(FoldersViewVisibleContext, ExplorerFocusedContext, ContextKeyExpr.not(InputFocusedContextKey));
export const TEXT_FILE_EDITOR_ID = 'workbench.editors.files.textFileEditor';
export const FILE_EDITOR_INPUT_ID = 'workbench.editors.files.fileEditorInput';
export const BINARY_FILE_EDITOR_ID = 'workbench.editors.files.binaryFileEditor';
export const BINARY_TEXT_FILE_MODE = 'code-text-binary';
let TextFileContentProvider = TextFileContentProvider_1 = class TextFileContentProvider extends Disposable {
    constructor(textFileService, fileService, languageService, modelService) {
        super();
        this.textFileService = textFileService;
        this.fileService = fileService;
        this.languageService = languageService;
        this.modelService = modelService;
        this.fileWatcherDisposable = this._register(new MutableDisposable());
    }
    static async open(resource, scheme, label, editorService, options) {
        await editorService.openEditor({
            original: { resource: TextFileContentProvider_1.resourceToTextFile(scheme, resource) },
            modified: { resource },
            label,
            options
        });
    }
    static resourceToTextFile(scheme, resource) {
        return resource.with({ scheme, query: JSON.stringify({ scheme: resource.scheme, query: resource.query }) });
    }
    static textFileToResource(resource) {
        const { scheme, query } = JSON.parse(resource.query);
        return resource.with({ scheme, query });
    }
    async provideTextContent(resource) {
        if (!resource.query) {
            return null;
        }
        const savedFileResource = TextFileContentProvider_1.textFileToResource(resource);
        const codeEditorModel = await this.resolveEditorModel(resource);
        if (!this.fileWatcherDisposable.value) {
            const disposables = new DisposableStore();
            this.fileWatcherDisposable.value = disposables;
            disposables.add(this.fileService.onDidFilesChange(changes => {
                if (changes.contains(savedFileResource, 0)) {
                    this.resolveEditorModel(resource, false);
                }
            }));
            if (codeEditorModel) {
                disposables.add(Event.once(codeEditorModel.onWillDispose)(() => this.fileWatcherDisposable.clear()));
            }
        }
        return codeEditorModel;
    }
    async resolveEditorModel(resource, createAsNeeded = true) {
        const savedFileResource = TextFileContentProvider_1.textFileToResource(resource);
        const content = await this.textFileService.readStream(savedFileResource);
        let codeEditorModel = this.modelService.getModel(resource);
        if (codeEditorModel) {
            this.modelService.updateModel(codeEditorModel, content.value);
        }
        else if (createAsNeeded) {
            const textFileModel = this.modelService.getModel(savedFileResource);
            let languageSelector;
            if (textFileModel) {
                languageSelector = this.languageService.createById(textFileModel.getLanguageId());
            }
            else {
                languageSelector = this.languageService.createByFilepathOrFirstLine(savedFileResource);
            }
            codeEditorModel = this.modelService.createModel(content.value, languageSelector, resource);
        }
        return codeEditorModel;
    }
};
TextFileContentProvider = TextFileContentProvider_1 = __decorate([
    __param(0, ITextFileService),
    __param(1, IFileService),
    __param(2, ILanguageService),
    __param(3, IModelService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], TextFileContentProvider);
export { TextFileContentProvider };
export class OpenEditor {
    static { this.COUNTER = 0; }
    constructor(_editor, _group) {
        this._editor = _editor;
        this._group = _group;
        this.id = OpenEditor.COUNTER++;
    }
    get editor() {
        return this._editor;
    }
    get group() {
        return this._group;
    }
    get groupId() {
        return this._group.id;
    }
    getId() {
        return `openeditor:${this.groupId}:${this.id}`;
    }
    isPreview() {
        return !this._group.isPinned(this.editor);
    }
    isSticky() {
        return this._group.isSticky(this.editor);
    }
    getResource() {
        return EditorResourceAccessor.getOriginalUri(this.editor, { supportSideBySide: SideBySideEditor.PRIMARY });
    }
}
