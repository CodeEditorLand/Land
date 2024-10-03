import './media/editorplaceholder.css';
import { IEditorOpenContext } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { EditorPane } from './editorPane.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { Dimension } from '../../../../base/browser/dom.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
import { EditorPaneDescriptor } from '../../editor.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
export interface IEditorPlaceholderContents {
    icon: string;
    label: string;
    actions: IEditorPlaceholderContentsAction[];
}
export interface IEditorPlaceholderContentsAction {
    label: string;
    run: () => unknown;
}
export interface IErrorEditorPlaceholderOptions extends IEditorOptions {
    error?: Error;
}
export declare abstract class EditorPlaceholder extends EditorPane {
    protected static readonly PLACEHOLDER_LABEL_MAX_LENGTH = 1024;
    private container;
    private scrollbar;
    private readonly inputDisposable;
    constructor(id: string, group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService);
    protected createEditor(parent: HTMLElement): void;
    setInput(input: EditorInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    private renderInput;
    protected abstract getContents(input: EditorInput, options: IEditorOptions | undefined, disposables: DisposableStore): Promise<IEditorPlaceholderContents>;
    clearInput(): void;
    layout(dimension: Dimension): void;
    focus(): void;
    dispose(): void;
}
export declare class WorkspaceTrustRequiredPlaceholderEditor extends EditorPlaceholder {
    private readonly commandService;
    private readonly workspaceService;
    static readonly ID = "workbench.editors.workspaceTrustRequiredEditor";
    private static readonly LABEL;
    static readonly DESCRIPTOR: EditorPaneDescriptor;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, commandService: ICommandService, workspaceService: IWorkspaceContextService, storageService: IStorageService);
    getTitle(): string;
    protected getContents(): Promise<IEditorPlaceholderContents>;
}
export declare class ErrorPlaceholderEditor extends EditorPlaceholder {
    private readonly fileService;
    private readonly dialogService;
    private static readonly ID;
    private static readonly LABEL;
    static readonly DESCRIPTOR: EditorPaneDescriptor;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService, fileService: IFileService, dialogService: IDialogService);
    protected getContents(input: EditorInput, options: IErrorEditorPlaceholderOptions, disposables: DisposableStore): Promise<IEditorPlaceholderContents>;
}
