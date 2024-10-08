import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IConfigurationService, IConfigurationChangeEvent } from '../../../../platform/configuration/common/configuration.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { BrowserTitlebarPart as BrowserTitlebarPart, BrowserTitleService, IAuxiliaryTitlebarPart } from '../../../browser/parts/titlebar/titlebarPart.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorGroupsContainer, IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { CodeWindow } from '../../../../base/browser/window.js';
export declare class NativeTitlebarPart extends BrowserTitlebarPart {
    private readonly nativeHostService;
    get minimumHeight(): number;
    get maximumHeight(): number;
    private bigSurOrNewer;
    private get macTitlebarSize();
    private maxRestoreControl;
    private resizer;
    private cachedWindowControlStyles;
    private cachedWindowControlHeight;
    constructor(id: string, targetWindow: CodeWindow, editorGroupsContainer: IEditorGroupsContainer | 'main', contextMenuService: IContextMenuService, configurationService: IConfigurationService, environmentService: INativeWorkbenchEnvironmentService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService, nativeHostService: INativeHostService, editorGroupService: IEditorGroupsService, editorService: IEditorService, menuService: IMenuService, keybindingService: IKeybindingService);
    protected onMenubarVisibilityChanged(visible: boolean): void;
    protected onConfigurationChanged(event: IConfigurationChangeEvent): void;
    private onUpdateAppIconDragBehavior;
    protected installMenubar(): void;
    private onMenubarFocusChanged;
    protected createContentArea(parent: HTMLElement): HTMLElement;
    private onDidChangeWindowMaximized;
    updateStyles(): void;
    layout(width: number, height: number): void;
}
export declare class MainNativeTitlebarPart extends NativeTitlebarPart {
    constructor(contextMenuService: IContextMenuService, configurationService: IConfigurationService, environmentService: INativeWorkbenchEnvironmentService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService, nativeHostService: INativeHostService, editorGroupService: IEditorGroupsService, editorService: IEditorService, menuService: IMenuService, keybindingService: IKeybindingService);
}
export declare class AuxiliaryNativeTitlebarPart extends NativeTitlebarPart implements IAuxiliaryTitlebarPart {
    readonly container: HTMLElement;
    private readonly mainTitlebar;
    private static COUNTER;
    get height(): number;
    constructor(container: HTMLElement, editorGroupsContainer: IEditorGroupsContainer, mainTitlebar: BrowserTitlebarPart, contextMenuService: IContextMenuService, configurationService: IConfigurationService, environmentService: INativeWorkbenchEnvironmentService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService, nativeHostService: INativeHostService, editorGroupService: IEditorGroupsService, editorService: IEditorService, menuService: IMenuService, keybindingService: IKeybindingService);
    get preventZoom(): boolean;
}
export declare class NativeTitleService extends BrowserTitleService {
    protected createMainTitlebarPart(): MainNativeTitlebarPart;
    protected doCreateAuxiliaryTitlebarPart(container: HTMLElement, editorGroupsContainer: IEditorGroupsContainer): AuxiliaryNativeTitlebarPart;
}
