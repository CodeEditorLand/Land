import * as nls from '../../../../nls.js';
import { OperatingSystem } from '../../../../base/common/platform.js';
import { URI } from '../../../../base/common/uri.js';
import { Action } from '../../../../base/common/actions.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { ExplorerItem } from '../common/explorerModel.js';
import { IWorkingCopyService } from '../../../services/workingCopy/common/workingCopyService.js';
import { IExplorerService } from './files.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ILocalizedString } from '../../../../platform/action/common/action.js';
export declare const NEW_FILE_COMMAND_ID = "explorer.newFile";
export declare const NEW_FILE_LABEL: nls.ILocalizedString;
export declare const NEW_FOLDER_COMMAND_ID = "explorer.newFolder";
export declare const NEW_FOLDER_LABEL: nls.ILocalizedString;
export declare const TRIGGER_RENAME_LABEL: string;
export declare const MOVE_FILE_TO_TRASH_LABEL: string;
export declare const COPY_FILE_LABEL: string;
export declare const PASTE_FILE_LABEL: string;
export declare const FileCopiedContext: RawContextKey<boolean>;
export declare const DOWNLOAD_COMMAND_ID = "explorer.download";
export declare const DOWNLOAD_LABEL: string;
export declare const UPLOAD_COMMAND_ID = "explorer.upload";
export declare const UPLOAD_LABEL: string;
export declare function findValidPasteFileTarget(explorerService: IExplorerService, fileService: IFileService, dialogService: IDialogService, targetFolder: ExplorerItem, fileToPaste: {
    resource: URI | string;
    isDirectory?: boolean;
    allowOverwrite: boolean;
}, incrementalNaming: 'simple' | 'smart' | 'disabled'): Promise<URI | undefined>;
export declare function incrementFileName(name: string, isFolder: boolean, incrementalNaming: 'simple' | 'smart'): string;
export declare class GlobalCompareResourcesAction extends Action2 {
    static readonly ID = "workbench.files.action.compareFileWith";
    static readonly LABEL: nls.ILocalizedString;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ToggleAutoSaveAction extends Action2 {
    static readonly ID = "workbench.action.toggleAutoSave";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
declare abstract class BaseSaveAllAction extends Action {
    protected commandService: ICommandService;
    private notificationService;
    private readonly workingCopyService;
    private lastDirtyState;
    constructor(id: string, label: string, commandService: ICommandService, notificationService: INotificationService, workingCopyService: IWorkingCopyService);
    protected abstract doRun(context: unknown): Promise<void>;
    private registerListeners;
    private updateEnablement;
    run(context?: unknown): Promise<void>;
}
export declare class SaveAllInGroupAction extends BaseSaveAllAction {
    static readonly ID = "workbench.files.action.saveAllInGroup";
    static readonly LABEL: string;
    get class(): string;
    protected doRun(context: unknown): Promise<void>;
}
export declare class CloseGroupAction extends Action {
    private readonly commandService;
    static readonly ID = "workbench.files.action.closeGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(context?: unknown): Promise<void>;
}
export declare class FocusFilesExplorer extends Action2 {
    static readonly ID = "workbench.files.action.focusFilesExplorer";
    static readonly LABEL: nls.ILocalizedString;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ShowActiveFileInExplorer extends Action2 {
    static readonly ID = "workbench.files.action.showActiveFileInExplorer";
    static readonly LABEL: nls.ILocalizedString;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class OpenActiveFileInEmptyWorkspace extends Action2 {
    static readonly ID = "workbench.action.files.showOpenedFileInNewWindow";
    static readonly LABEL: nls.ILocalizedString;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare function validateFileName(pathService: IPathService, item: ExplorerItem, name: string, os: OperatingSystem): {
    content: string;
    severity: Severity;
} | null;
export declare class CompareNewUntitledTextFilesAction extends Action2 {
    static readonly ID = "workbench.files.action.compareNewUntitledTextFiles";
    static readonly LABEL: nls.ILocalizedString;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class CompareWithClipboardAction extends Action2 {
    static readonly ID = "workbench.files.action.compareWithClipboard";
    static readonly LABEL: nls.ILocalizedString;
    private registrationDisposal;
    private static SCHEME_COUNTER;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
    dispose(): void;
}
export declare const renameHandler: (accessor: ServicesAccessor) => Promise<void>;
export declare const moveFileToTrashHandler: (accessor: ServicesAccessor) => Promise<void>;
export declare const deleteFileHandler: (accessor: ServicesAccessor) => Promise<void>;
export declare const copyFileHandler: (accessor: ServicesAccessor) => Promise<void>;
export declare const cutFileHandler: (accessor: ServicesAccessor) => Promise<void>;
export declare const pasteFileHandler: (accessor: ServicesAccessor, fileList?: FileList) => Promise<void>;
export declare const openFilePreserveFocusHandler: (accessor: ServicesAccessor) => Promise<void>;
declare class BaseSetActiveEditorReadonlyInSession extends Action2 {
    private readonly newReadonlyState;
    constructor(id: string, title: ILocalizedString, newReadonlyState: true | false | 'toggle' | 'reset');
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class SetActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
    static readonly ID = "workbench.action.files.setActiveEditorReadonlyInSession";
    static readonly LABEL: nls.ILocalizedString;
    constructor();
}
export declare class SetActiveEditorWriteableInSession extends BaseSetActiveEditorReadonlyInSession {
    static readonly ID = "workbench.action.files.setActiveEditorWriteableInSession";
    static readonly LABEL: nls.ILocalizedString;
    constructor();
}
export declare class ToggleActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
    static readonly ID = "workbench.action.files.toggleActiveEditorReadonlyInSession";
    static readonly LABEL: nls.ILocalizedString;
    constructor();
}
export declare class ResetActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
    static readonly ID = "workbench.action.files.resetActiveEditorReadonlyInSession";
    static readonly LABEL: nls.ILocalizedString;
    constructor();
}
export {};
