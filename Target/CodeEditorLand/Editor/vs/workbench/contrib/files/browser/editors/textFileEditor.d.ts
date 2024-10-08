import { IPathService } from '../../../../services/path/common/pathService.js';
import { ITextFileService } from '../../../../services/textfile/common/textfiles.js';
import { AbstractTextCodeEditor } from '../../../../browser/parts/editor/textCodeEditor.js';
import { IEditorOpenContext, IFileEditorInputOptions } from '../../../../common/editor.js';
import { EditorInput } from '../../../../common/editor/editorInput.js';
import { FileEditorInput } from './fileEditorInput.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { ITextResourceConfigurationService } from '../../../../../editor/common/services/textResourceConfiguration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { ICodeEditorViewState } from '../../../../../editor/common/editorCommon.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IEditorGroup, IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { ITextEditorOptions } from '../../../../../platform/editor/common/editor.js';
import { IUriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentity.js';
import { IExplorerService } from '../files.js';
import { IPaneCompositePartService } from '../../../../services/panecomposite/browser/panecomposite.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IPreferencesService } from '../../../../services/preferences/common/preferences.js';
import { IHostService } from '../../../../services/host/browser/host.js';
import { IEditorOptions as ICodeEditorOptions } from '../../../../../editor/common/config/editorOptions.js';
import { IFilesConfigurationService } from '../../../../services/filesConfiguration/common/filesConfigurationService.js';
/**
 * An implementation of editor for file system resources.
 */
export declare class TextFileEditor extends AbstractTextCodeEditor<ICodeEditorViewState> {
    private readonly paneCompositeService;
    private readonly contextService;
    private readonly textFileService;
    private readonly explorerService;
    private readonly uriIdentityService;
    private readonly pathService;
    private readonly configurationService;
    protected readonly preferencesService: IPreferencesService;
    private readonly hostService;
    private readonly filesConfigurationService;
    static readonly ID = "workbench.editors.files.textFileEditor";
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, fileService: IFileService, paneCompositeService: IPaneCompositePartService, instantiationService: IInstantiationService, contextService: IWorkspaceContextService, storageService: IStorageService, textResourceConfigurationService: ITextResourceConfigurationService, editorService: IEditorService, themeService: IThemeService, editorGroupService: IEditorGroupsService, textFileService: ITextFileService, explorerService: IExplorerService, uriIdentityService: IUriIdentityService, pathService: IPathService, configurationService: IConfigurationService, preferencesService: IPreferencesService, hostService: IHostService, filesConfigurationService: IFilesConfigurationService);
    private onDidFilesChange;
    private onDidRunOperation;
    getTitle(): string;
    get input(): FileEditorInput | undefined;
    setInput(input: FileEditorInput, options: IFileEditorInputOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    protected handleSetInputError(error: Error, input: FileEditorInput, options: ITextEditorOptions | undefined): Promise<void>;
    private openAsBinary;
    private doOpenAsBinaryInDifferentEditor;
    private doOpenAsBinaryInSameEditor;
    clearInput(): void;
    protected createEditorControl(parent: HTMLElement, initialOptions: ICodeEditorOptions): void;
    protected tracksEditorViewState(input: EditorInput): boolean;
    protected tracksDisposedEditorViewState(): boolean;
}
