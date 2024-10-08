import { ITitleProperties, ITitleVariable } from './titlebarPart.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorGroupsContainer } from '../../../services/editor/common/editorGroupsService.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { CodeWindow } from '../../../../base/browser/window.js';
export declare const defaultWindowTitle: string;
export declare const defaultWindowTitleSeparator: string;
export declare class WindowTitle extends Disposable {
    protected readonly configurationService: IConfigurationService;
    private readonly contextKeyService;
    protected readonly environmentService: IBrowserWorkbenchEnvironmentService;
    private readonly contextService;
    private readonly labelService;
    private readonly userDataProfileService;
    private readonly productService;
    private readonly viewsService;
    private static readonly NLS_USER_IS_ADMIN;
    private static readonly NLS_EXTENSION_HOST;
    private static readonly TITLE_DIRTY;
    private readonly properties;
    private readonly variables;
    private readonly activeEditorListeners;
    private readonly titleUpdater;
    private readonly onDidChangeEmitter;
    readonly onDidChange: import("../../../workbench.web.main.internal.js").Event<void>;
    get value(): string;
    get workspaceName(): string;
    get fileName(): string | undefined;
    private title;
    private titleIncludesFocusedView;
    private readonly editorService;
    private readonly windowId;
    constructor(targetWindow: CodeWindow, editorGroupsContainer: IEditorGroupsContainer | 'main', configurationService: IConfigurationService, contextKeyService: IContextKeyService, editorService: IEditorService, environmentService: IBrowserWorkbenchEnvironmentService, contextService: IWorkspaceContextService, labelService: ILabelService, userDataProfileService: IUserDataProfileService, productService: IProductService, viewsService: IViewsService);
    private registerListeners;
    private onConfigurationChanged;
    private updateTitleIncludesFocusedView;
    private onActiveEditorChange;
    private doUpdateTitle;
    private getFullWindowTitle;
    getTitleDecorations(): {
        prefix: string | undefined;
        suffix: string | undefined;
    };
    updateProperties(properties: ITitleProperties): void;
    registerVariables(variables: ITitleVariable[]): void;
    /**
     * Possible template values:
     *
     * {activeEditorLong}: e.g. /Users/Development/myFolder/myFileFolder/myFile.txt
     * {activeEditorMedium}: e.g. myFolder/myFileFolder/myFile.txt
     * {activeEditorShort}: e.g. myFile.txt
     * {activeFolderLong}: e.g. /Users/Development/myFolder/myFileFolder
     * {activeFolderMedium}: e.g. myFolder/myFileFolder
     * {activeFolderShort}: e.g. myFileFolder
     * {rootName}: e.g. myFolder1, myFolder2, myFolder3
     * {rootPath}: e.g. /Users/Development
     * {folderName}: e.g. myFolder
     * {folderPath}: e.g. /Users/Development/myFolder
     * {appName}: e.g. VS Code
     * {remoteName}: e.g. SSH
     * {dirty}: indicator
     * {focusedView}: e.g. Terminal
     * {separator}: conditional separator
     */
    getWindowTitle(): string;
    isCustomTitleFormat(): boolean;
}
