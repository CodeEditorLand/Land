import { URI } from '../../../../base/common/uri.js';
import { IEditorOptions } from '../../../../editor/common/config/editorOptions.js';
import { IWorkbenchEditorConfiguration, IEditorIdentifier } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IFilesConfiguration as PlatformIFilesConfiguration, IFileService } from '../../../../platform/files/common/files.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { ITextModelContentProvider } from '../../../../editor/common/services/resolverService.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
import { ITextEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IExpression } from '../../../../base/common/glob.js';
/**
 * Explorer viewlet id.
 */
export declare const VIEWLET_ID = "workbench.view.explorer";
/**
 * Explorer file view id.
 */
export declare const VIEW_ID = "workbench.explorer.fileView";
/**
 * Context Keys to use with keybindings for the Explorer and Open Editors view
 */
export declare const ExplorerViewletVisibleContext: RawContextKey<boolean>;
export declare const FoldersViewVisibleContext: RawContextKey<boolean>;
export declare const ExplorerFolderContext: RawContextKey<boolean>;
export declare const ExplorerResourceReadonlyContext: RawContextKey<boolean>;
export declare const ExplorerResourceNotReadonlyContext: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
/**
 * Comma separated list of editor ids that can be used for the selected explorer resource.
 */
export declare const ExplorerResourceAvailableEditorIdsContext: RawContextKey<string>;
export declare const ExplorerRootContext: RawContextKey<boolean>;
export declare const ExplorerResourceCut: RawContextKey<boolean>;
export declare const ExplorerResourceMoveableToTrash: RawContextKey<boolean>;
export declare const FilesExplorerFocusedContext: RawContextKey<boolean>;
export declare const OpenEditorsFocusedContext: RawContextKey<boolean>;
export declare const ExplorerFocusedContext: RawContextKey<boolean>;
export declare const ExplorerCompressedFocusContext: RawContextKey<boolean>;
export declare const ExplorerCompressedFirstFocusContext: RawContextKey<boolean>;
export declare const ExplorerCompressedLastFocusContext: RawContextKey<boolean>;
export declare const ViewHasSomeCollapsibleRootItemContext: RawContextKey<boolean>;
export declare const FilesExplorerFocusCondition: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
export declare const ExplorerFocusCondition: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
/**
 * Text file editor id.
 */
export declare const TEXT_FILE_EDITOR_ID = "workbench.editors.files.textFileEditor";
/**
 * File editor input id.
 */
export declare const FILE_EDITOR_INPUT_ID = "workbench.editors.files.fileEditorInput";
/**
 * Binary file editor id.
 */
export declare const BINARY_FILE_EDITOR_ID = "workbench.editors.files.binaryFileEditor";
/**
 * Language identifier for binary files opened as text.
 */
export declare const BINARY_TEXT_FILE_MODE = "code-text-binary";
export interface IFilesConfiguration extends PlatformIFilesConfiguration, IWorkbenchEditorConfiguration {
    explorer: {
        openEditors: {
            visible: number;
            sortOrder: 'editorOrder' | 'alphabetical' | 'fullPath';
        };
        autoReveal: boolean | 'focusNoScroll';
        autoRevealExclude: IExpression;
        enableDragAndDrop: boolean;
        confirmDelete: boolean;
        enableUndo: boolean;
        confirmUndo: UndoConfirmLevel;
        expandSingleFolderWorkspaces: boolean;
        sortOrder: SortOrder;
        sortOrderLexicographicOptions: LexicographicOptions;
        sortOrderReverse: boolean;
        decorations: {
            colors: boolean;
            badges: boolean;
        };
        incrementalNaming: 'simple' | 'smart' | 'disabled';
        excludeGitIgnore: boolean;
        fileNesting: {
            enabled: boolean;
            expand: boolean;
            patterns: {
                [parent: string]: string;
            };
        };
        autoOpenDroppedFile: boolean;
    };
    editor: IEditorOptions;
}
export interface IFileResource {
    resource: URI;
    isDirectory?: boolean;
}
export declare const enum SortOrder {
    Default = "default",
    Mixed = "mixed",
    FilesFirst = "filesFirst",
    Type = "type",
    Modified = "modified",
    FoldersNestsFiles = "foldersNestsFiles"
}
export declare const enum UndoConfirmLevel {
    Verbose = "verbose",
    Default = "default",
    Light = "light"
}
export declare const enum LexicographicOptions {
    Default = "default",
    Upper = "upper",
    Lower = "lower",
    Unicode = "unicode"
}
export interface ISortOrderConfiguration {
    sortOrder: SortOrder;
    lexicographicOptions: LexicographicOptions;
    reverse: boolean;
}
export declare class TextFileContentProvider extends Disposable implements ITextModelContentProvider {
    private readonly textFileService;
    private readonly fileService;
    private readonly languageService;
    private readonly modelService;
    private readonly fileWatcherDisposable;
    constructor(textFileService: ITextFileService, fileService: IFileService, languageService: ILanguageService, modelService: IModelService);
    static open(resource: URI, scheme: string, label: string, editorService: IEditorService, options?: ITextEditorOptions): Promise<void>;
    private static resourceToTextFile;
    private static textFileToResource;
    provideTextContent(resource: URI): Promise<ITextModel | null>;
    private resolveEditorModel;
}
export declare class OpenEditor implements IEditorIdentifier {
    private _editor;
    private _group;
    private id;
    private static COUNTER;
    constructor(_editor: EditorInput, _group: IEditorGroup);
    get editor(): EditorInput;
    get group(): IEditorGroup;
    get groupId(): number;
    getId(): string;
    isPreview(): boolean;
    isSticky(): boolean;
    getResource(): URI | undefined;
}
