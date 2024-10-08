import { IFileService } from '../../../../platform/files/common/files.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { URI } from '../../../../base/common/uri.js';
import { ISaveDialogOptions, IOpenDialogOptions, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { ICommandHandler } from '../../../../platform/commands/common/commands.js';
import { IPathService } from '../../path/common/pathService.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
export declare namespace OpenLocalFileCommand {
    const ID = "workbench.action.files.openLocalFile";
    const LABEL: string;
    function handler(): ICommandHandler;
}
export declare namespace SaveLocalFileCommand {
    const ID = "workbench.action.files.saveLocalFile";
    const LABEL: string;
    function handler(): ICommandHandler;
}
export declare namespace OpenLocalFolderCommand {
    const ID = "workbench.action.files.openLocalFolder";
    const LABEL: string;
    function handler(): ICommandHandler;
}
export declare namespace OpenLocalFileFolderCommand {
    const ID = "workbench.action.files.openLocalFileFolder";
    const LABEL: string;
    function handler(): ICommandHandler;
}
export declare const RemoteFileDialogContext: RawContextKey<boolean>;
export interface ISimpleFileDialog extends IDisposable {
    showOpenDialog(options: IOpenDialogOptions): Promise<URI | undefined>;
    showSaveDialog(options: ISaveDialogOptions): Promise<URI | undefined>;
}
export declare class SimpleFileDialog extends Disposable implements ISimpleFileDialog {
    private readonly fileService;
    private readonly quickInputService;
    private readonly labelService;
    private readonly workspaceContextService;
    private readonly notificationService;
    private readonly fileDialogService;
    private readonly modelService;
    private readonly languageService;
    protected readonly environmentService: IWorkbenchEnvironmentService;
    private readonly remoteAgentService;
    protected readonly pathService: IPathService;
    private readonly keybindingService;
    private readonly accessibilityService;
    private options;
    private currentFolder;
    private filePickBox;
    private hidden;
    private allowFileSelection;
    private allowFolderSelection;
    private remoteAuthority;
    private requiresTrailing;
    private trailing;
    protected scheme: string;
    private contextKey;
    private userEnteredPathSegment;
    private autoCompletePathSegment;
    private activeItem;
    private userHome;
    private trueHome;
    private isWindows;
    private badPath;
    private remoteAgentEnvironment;
    private separator;
    private readonly onBusyChangeEmitter;
    private updatingPromise;
    constructor(fileService: IFileService, quickInputService: IQuickInputService, labelService: ILabelService, workspaceContextService: IWorkspaceContextService, notificationService: INotificationService, fileDialogService: IFileDialogService, modelService: IModelService, languageService: ILanguageService, environmentService: IWorkbenchEnvironmentService, remoteAgentService: IRemoteAgentService, pathService: IPathService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, accessibilityService: IAccessibilityService);
    set busy(busy: boolean);
    get busy(): boolean;
    showOpenDialog(options?: IOpenDialogOptions): Promise<URI | undefined>;
    showSaveDialog(options: ISaveDialogOptions): Promise<URI | undefined>;
    private getOptions;
    private remoteUriFrom;
    private getScheme;
    private getRemoteAgentEnvironment;
    protected getUserHome(trueHome?: boolean): Promise<URI>;
    private pickResource;
    dispose(): void;
    private handleValueChange;
    private isBadSubpath;
    private isValueChangeFromUser;
    private isSelectionChangeFromUser;
    private constructFullUserPath;
    private filePickBoxValue;
    private onDidAccept;
    private root;
    private tildaReplace;
    private tryAddTrailingSeparatorToDirectory;
    private tryUpdateItems;
    private tryUpdateTrailing;
    private setActiveItems;
    private setAutoComplete;
    private insertText;
    private addPostfix;
    private trimTrailingSlash;
    private yesNoPrompt;
    private validate;
    private updateItems;
    private pathFromUri;
    private pathAppend;
    private checkIsWindowsOS;
    private endsWithSlash;
    private basenameWithTrailingSlash;
    private createBackItem;
    private createItems;
    private filterFile;
    private createItem;
}
