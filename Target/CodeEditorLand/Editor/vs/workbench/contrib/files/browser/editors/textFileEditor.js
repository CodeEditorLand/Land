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
var TextFileEditor_1;
import { localize } from '../../../../../nls.js';
import { mark } from '../../../../../base/common/performance.js';
import { assertIsDefined } from '../../../../../base/common/types.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { toAction } from '../../../../../base/common/actions.js';
import { VIEWLET_ID, TEXT_FILE_EDITOR_ID, BINARY_TEXT_FILE_MODE } from '../../common/files.js';
import { ITextFileService } from '../../../../services/textfile/common/textfiles.js';
import { AbstractTextCodeEditor } from '../../../../browser/parts/editor/textCodeEditor.js';
import { isTextEditorViewState, DEFAULT_EDITOR_ASSOCIATION, createEditorOpenError, createTooLargeFileError } from '../../../../common/editor.js';
import { applyTextEditorOptions } from '../../../../common/editor/editorOptions.js';
import { BinaryEditorModel } from '../../../../common/editor/binaryEditorModel.js';
import { FileEditorInput } from './fileEditorInput.js';
import { FileOperationError, IFileService, ByteSize, TooLargeFileOperationError } from '../../../../../platform/files/common/files.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { ITextResourceConfigurationService } from '../../../../../editor/common/services/textResourceConfiguration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { EditorActivation } from '../../../../../platform/editor/common/editor.js';
import { IUriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentity.js';
import { IExplorerService } from '../files.js';
import { IPaneCompositePartService } from '../../../../services/panecomposite/browser/panecomposite.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IPreferencesService } from '../../../../services/preferences/common/preferences.js';
import { IHostService } from '../../../../services/host/browser/host.js';
import { IFilesConfigurationService } from '../../../../services/filesConfiguration/common/filesConfigurationService.js';
let TextFileEditor = class TextFileEditor extends AbstractTextCodeEditor {
    static { TextFileEditor_1 = this; }
    static { this.ID = TEXT_FILE_EDITOR_ID; }
    constructor(group, telemetryService, fileService, paneCompositeService, instantiationService, contextService, storageService, textResourceConfigurationService, editorService, themeService, editorGroupService, textFileService, explorerService, uriIdentityService, pathService, configurationService, preferencesService, hostService, filesConfigurationService) {
        super(TextFileEditor_1.ID, group, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService);
        this.paneCompositeService = paneCompositeService;
        this.contextService = contextService;
        this.textFileService = textFileService;
        this.explorerService = explorerService;
        this.uriIdentityService = uriIdentityService;
        this.pathService = pathService;
        this.configurationService = configurationService;
        this.preferencesService = preferencesService;
        this.hostService = hostService;
        this.filesConfigurationService = filesConfigurationService;
        this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
        this._register(this.fileService.onDidRunOperation(e => this.onDidRunOperation(e)));
    }
    onDidFilesChange(e) {
        for (const resource of e.rawDeleted) {
            this.clearEditorViewState(resource);
        }
    }
    onDidRunOperation(e) {
        if (e.operation === 2 && e.target) {
            this.moveEditorViewState(e.resource, e.target.resource, this.uriIdentityService.extUri);
        }
    }
    getTitle() {
        if (this.input) {
            return this.input.getName();
        }
        return localize('textFileEditor', "Text File Editor");
    }
    get input() {
        return this._input;
    }
    async setInput(input, options, context, token) {
        mark('code/willSetInputToTextFileEditor');
        await super.setInput(input, options, context, token);
        try {
            const resolvedModel = await input.resolve(options);
            if (token.isCancellationRequested) {
                return;
            }
            if (resolvedModel instanceof BinaryEditorModel) {
                return this.openAsBinary(input, options);
            }
            const textFileModel = resolvedModel;
            const control = assertIsDefined(this.editorControl);
            control.setModel(textFileModel.textEditorModel);
            if (!isTextEditorViewState(options?.viewState)) {
                const editorViewState = this.loadEditorViewState(input, context);
                if (editorViewState) {
                    if (options?.selection) {
                        editorViewState.cursorState = [];
                    }
                    control.restoreViewState(editorViewState);
                }
            }
            if (options) {
                applyTextEditorOptions(options, control, 1);
            }
            control.updateOptions(this.getReadonlyConfiguration(textFileModel.isReadonly()));
            if (control.handleInitialized) {
                control.handleInitialized();
            }
        }
        catch (error) {
            await this.handleSetInputError(error, input, options);
        }
        mark('code/didSetInputToTextFileEditor');
    }
    async handleSetInputError(error, input, options) {
        if (error.textFileOperationResult === 0) {
            return this.openAsBinary(input, options);
        }
        if (error.fileOperationResult === 0) {
            const actions = [];
            actions.push(toAction({
                id: 'workbench.files.action.openFolder', label: localize('openFolder', "Open Folder"), run: async () => {
                    return this.hostService.openWindow([{ folderUri: input.resource }], { forceNewWindow: true });
                }
            }));
            if (this.contextService.isInsideWorkspace(input.preferredResource)) {
                actions.push(toAction({
                    id: 'workbench.files.action.reveal', label: localize('reveal', "Reveal Folder"), run: async () => {
                        await this.paneCompositeService.openPaneComposite(VIEWLET_ID, 0, true);
                        return this.explorerService.select(input.preferredResource, true);
                    }
                }));
            }
            throw createEditorOpenError(localize('fileIsDirectory', "The file is not displayed in the text editor because it is a directory."), actions, { forceMessage: true });
        }
        if (error.fileOperationResult === 7) {
            let message;
            if (error instanceof TooLargeFileOperationError) {
                message = localize('fileTooLargeForHeapErrorWithSize', "The file is not displayed in the text editor because it is very large ({0}).", ByteSize.formatSize(error.size));
            }
            else {
                message = localize('fileTooLargeForHeapErrorWithoutSize', "The file is not displayed in the text editor because it is very large.");
            }
            throw createTooLargeFileError(this.group, input, options, message, this.preferencesService);
        }
        if (error.fileOperationResult === 1 &&
            !this.filesConfigurationService.isReadonly(input.preferredResource) &&
            await this.pathService.hasValidBasename(input.preferredResource)) {
            const fileNotFoundError = createEditorOpenError(new FileOperationError(localize('unavailableResourceErrorEditorText', "The editor could not be opened because the file was not found."), 1), [
                toAction({
                    id: 'workbench.files.action.createMissingFile', label: localize('createFile', "Create File"), run: async () => {
                        await this.textFileService.create([{ resource: input.preferredResource }]);
                        return this.editorService.openEditor({
                            resource: input.preferredResource,
                            options: {
                                pinned: true
                            }
                        });
                    }
                })
            ], {
                allowDialog: true
            });
            throw fileNotFoundError;
        }
        throw error;
    }
    openAsBinary(input, options) {
        const defaultBinaryEditor = this.configurationService.getValue('workbench.editor.defaultBinaryEditor');
        const editorOptions = {
            ...options,
            activation: EditorActivation.PRESERVE
        };
        if (defaultBinaryEditor && defaultBinaryEditor !== '' && defaultBinaryEditor !== DEFAULT_EDITOR_ASSOCIATION.id) {
            this.doOpenAsBinaryInDifferentEditor(this.group, defaultBinaryEditor, input, editorOptions);
        }
        else {
            this.doOpenAsBinaryInSameEditor(this.group, defaultBinaryEditor, input, editorOptions);
        }
    }
    doOpenAsBinaryInDifferentEditor(group, editorId, editor, editorOptions) {
        this.editorService.replaceEditors([{
                editor,
                replacement: { resource: editor.resource, options: { ...editorOptions, override: editorId } }
            }], group);
    }
    doOpenAsBinaryInSameEditor(group, editorId, editor, editorOptions) {
        if (editorId === DEFAULT_EDITOR_ASSOCIATION.id) {
            editor.setForceOpenAsText();
            editor.setPreferredLanguageId(BINARY_TEXT_FILE_MODE);
            editorOptions = { ...editorOptions, forceReload: true };
        }
        else {
            editor.setForceOpenAsBinary();
        }
        group.openEditor(editor, editorOptions);
    }
    clearInput() {
        super.clearInput();
        this.editorControl?.setModel(null);
    }
    createEditorControl(parent, initialOptions) {
        mark('code/willCreateTextFileEditorControl');
        super.createEditorControl(parent, initialOptions);
        mark('code/didCreateTextFileEditorControl');
    }
    tracksEditorViewState(input) {
        return input instanceof FileEditorInput;
    }
    tracksDisposedEditorViewState() {
        return true;
    }
};
TextFileEditor = TextFileEditor_1 = __decorate([
    __param(1, ITelemetryService),
    __param(2, IFileService),
    __param(3, IPaneCompositePartService),
    __param(4, IInstantiationService),
    __param(5, IWorkspaceContextService),
    __param(6, IStorageService),
    __param(7, ITextResourceConfigurationService),
    __param(8, IEditorService),
    __param(9, IThemeService),
    __param(10, IEditorGroupsService),
    __param(11, ITextFileService),
    __param(12, IExplorerService),
    __param(13, IUriIdentityService),
    __param(14, IPathService),
    __param(15, IConfigurationService),
    __param(16, IPreferencesService),
    __param(17, IHostService),
    __param(18, IFilesConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TextFileEditor);
export { TextFileEditor };
