import { IStringDictionary } from '../../../base/common/collections.js';
import { PerformanceMark } from '../../../base/common/performance.js';
import { URI, UriComponents, UriDto } from '../../../base/common/uri.js';
import { ISandboxConfiguration } from '../../../base/parts/sandbox/common/sandboxTypes.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEditorOptions } from '../../editor/common/editor.js';
import { NativeParsedArgs } from '../../environment/common/argv.js';
import { FileType } from '../../files/common/files.js';
import { ILoggerResource, LogLevel } from '../../log/common/log.js';
import { PolicyDefinition, PolicyValue } from '../../policy/common/policy.js';
import { IPartsSplash } from '../../theme/common/themeService.js';
import { IUserDataProfile } from '../../userDataProfile/common/userDataProfile.js';
import { IAnyWorkspaceIdentifier, ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from '../../workspace/common/workspace.js';
export declare const WindowMinimumSize: {
    WIDTH: number;
    WIDTH_WITH_VERTICAL_PANEL: number;
    HEIGHT: number;
};
export interface IPoint {
    readonly x: number;
    readonly y: number;
}
export interface IRectangle extends IPoint {
    readonly width: number;
    readonly height: number;
}
export interface IBaseOpenWindowsOptions {
    /**
     * Whether to reuse the window or open a new one.
     */
    readonly forceReuseWindow?: boolean;
    /**
     * The remote authority to use when windows are opened with either
     * - no workspace (empty window)
     * - a workspace that is neither `file://` nor `vscode-remote://`
     * Use 'null' for a local window.
     * If not set, defaults to the remote authority of the current window.
     */
    readonly remoteAuthority?: string | null;
    readonly forceProfile?: string;
    readonly forceTempProfile?: boolean;
}
export interface IOpenWindowOptions extends IBaseOpenWindowsOptions {
    readonly forceNewWindow?: boolean;
    readonly preferNewWindow?: boolean;
    readonly noRecentEntry?: boolean;
    readonly addMode?: boolean;
    readonly diffMode?: boolean;
    readonly mergeMode?: boolean;
    readonly gotoLineMode?: boolean;
    readonly waitMarkerFileURI?: URI;
}
export interface IAddFoldersRequest {
    readonly foldersToAdd: UriComponents[];
}
interface IOpenedWindow {
    readonly id: number;
    readonly title: string;
    readonly filename?: string;
}
export interface IOpenedMainWindow extends IOpenedWindow {
    readonly workspace?: IAnyWorkspaceIdentifier;
    readonly dirty: boolean;
}
export interface IOpenedAuxiliaryWindow extends IOpenedWindow {
    readonly parentId: number;
}
export declare function isOpenedAuxiliaryWindow(candidate: IOpenedMainWindow | IOpenedAuxiliaryWindow): candidate is IOpenedAuxiliaryWindow;
export interface IOpenEmptyWindowOptions extends IBaseOpenWindowsOptions {
}
export type IWindowOpenable = IWorkspaceToOpen | IFolderToOpen | IFileToOpen;
export interface IBaseWindowOpenable {
    label?: string;
}
export interface IWorkspaceToOpen extends IBaseWindowOpenable {
    readonly workspaceUri: URI;
}
export interface IFolderToOpen extends IBaseWindowOpenable {
    readonly folderUri: URI;
}
export interface IFileToOpen extends IBaseWindowOpenable {
    readonly fileUri: URI;
}
export declare function isWorkspaceToOpen(uriToOpen: IWindowOpenable): uriToOpen is IWorkspaceToOpen;
export declare function isFolderToOpen(uriToOpen: IWindowOpenable): uriToOpen is IFolderToOpen;
export declare function isFileToOpen(uriToOpen: IWindowOpenable): uriToOpen is IFileToOpen;
export type MenuBarVisibility = 'classic' | 'visible' | 'toggle' | 'hidden' | 'compact';
export declare function getMenuBarVisibility(configurationService: IConfigurationService): MenuBarVisibility;
export interface IWindowsConfiguration {
    readonly window: IWindowSettings;
}
export interface IWindowSettings {
    readonly openFilesInNewWindow: 'on' | 'off' | 'default';
    readonly openFoldersInNewWindow: 'on' | 'off' | 'default';
    readonly openWithoutArgumentsInNewWindow: 'on' | 'off';
    readonly restoreWindows: 'preserve' | 'all' | 'folders' | 'one' | 'none';
    readonly restoreFullscreen: boolean;
    readonly zoomLevel: number;
    readonly titleBarStyle: TitlebarStyle;
    readonly autoDetectHighContrast: boolean;
    readonly autoDetectColorScheme: boolean;
    readonly menuBarVisibility: MenuBarVisibility;
    readonly newWindowDimensions: 'default' | 'inherit' | 'offset' | 'maximized' | 'fullscreen';
    readonly nativeTabs: boolean;
    readonly nativeFullScreen: boolean;
    readonly enableMenuBarMnemonics: boolean;
    readonly closeWhenEmpty: boolean;
    readonly clickThroughInactive: boolean;
    readonly newWindowProfile: string;
    readonly density: IDensitySettings;
    readonly experimentalControlOverlay?: boolean;
}
export interface IDensitySettings {
    readonly editorTabHeight: 'default' | 'compact';
}
export declare const enum TitleBarSetting {
    TITLE_BAR_STYLE = "window.titleBarStyle",
    CUSTOM_TITLE_BAR_VISIBILITY = "window.customTitleBarVisibility"
}
export declare const enum TitlebarStyle {
    NATIVE = "native",
    CUSTOM = "custom"
}
export declare const enum CustomTitleBarVisibility {
    AUTO = "auto",
    WINDOWED = "windowed",
    NEVER = "never"
}
export declare function hasCustomTitlebar(configurationService: IConfigurationService, titleBarStyle?: TitlebarStyle): boolean;
export declare function hasNativeTitlebar(configurationService: IConfigurationService, titleBarStyle?: TitlebarStyle): boolean;
export declare function getTitleBarStyle(configurationService: IConfigurationService): TitlebarStyle;
export declare const DEFAULT_CUSTOM_TITLEBAR_HEIGHT = 35;
export declare function useWindowControlsOverlay(configurationService: IConfigurationService): boolean;
export declare function useNativeFullScreen(configurationService: IConfigurationService): boolean;
export interface IPath<T = IEditorOptions> extends IPathData<T> {
    /**
     * The file path to open within the instance
     */
    fileUri?: URI;
}
export interface IPathData<T = IEditorOptions> {
    /**
     * The file path to open within the instance
     */
    readonly fileUri?: UriComponents;
    /**
     * Optional editor options to apply in the file
     */
    readonly options?: T;
    /**
     * A hint that the file exists. if true, the
     * file exists, if false it does not. with
     * `undefined` the state is unknown.
     */
    readonly exists?: boolean;
    /**
     * A hint about the file type of this path.
     * with `undefined` the type is unknown.
     */
    readonly type?: FileType;
    /**
     * Specifies if the file should be only be opened
     * if it exists.
     */
    readonly openOnlyIfExists?: boolean;
}
export interface IPathsToWaitFor extends IPathsToWaitForData {
    paths: IPath[];
    waitMarkerFileUri: URI;
}
interface IPathsToWaitForData {
    readonly paths: IPathData[];
    readonly waitMarkerFileUri: UriComponents;
}
export interface IOpenFileRequest {
    readonly filesToOpenOrCreate?: IPathData[];
    readonly filesToDiff?: IPathData[];
    readonly filesToMerge?: IPathData[];
}
/**
 * Additional context for the request on native only.
 */
export interface INativeOpenFileRequest extends IOpenFileRequest {
    readonly termProgram?: string;
    readonly filesToWait?: IPathsToWaitForData;
}
export interface INativeRunActionInWindowRequest {
    readonly id: string;
    readonly from: 'menu' | 'touchbar' | 'mouse';
    readonly args?: any[];
}
export interface INativeRunKeybindingInWindowRequest {
    readonly userSettingsLabel: string;
}
export interface IColorScheme {
    readonly dark: boolean;
    readonly highContrast: boolean;
}
export interface IWindowConfiguration {
    remoteAuthority?: string;
    filesToOpenOrCreate?: IPath[];
    filesToDiff?: IPath[];
    filesToMerge?: IPath[];
}
export interface IOSConfiguration {
    readonly release: string;
    readonly hostname: string;
    readonly arch: string;
}
export interface INativeWindowConfiguration extends IWindowConfiguration, NativeParsedArgs, ISandboxConfiguration {
    mainPid: number;
    machineId: string;
    sqmId: string;
    devDeviceId: string;
    execPath: string;
    backupPath?: string;
    profiles: {
        home: UriComponents;
        all: readonly UriDto<IUserDataProfile>[];
        profile: UriDto<IUserDataProfile>;
    };
    homeDir: string;
    tmpDir: string;
    userDataDir: string;
    partsSplash?: IPartsSplash;
    workspace?: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier;
    isInitialStartup?: boolean;
    logLevel: LogLevel;
    loggers: {
        global: UriDto<ILoggerResource>[];
        window: UriDto<ILoggerResource>[];
    };
    fullscreen?: boolean;
    maximized?: boolean;
    accessibilitySupport?: boolean;
    colorScheme: IColorScheme;
    autoDetectHighContrast?: boolean;
    autoDetectColorScheme?: boolean;
    isCustomZoomLevel?: boolean;
    perfMarks: PerformanceMark[];
    filesToWait?: IPathsToWaitFor;
    os: IOSConfiguration;
    policiesData?: IStringDictionary<{
        definition: PolicyDefinition;
        value: PolicyValue;
    }>;
}
/**
 * According to Electron docs: `scale := 1.2 ^ level`.
 * https://github.com/electron/electron/blob/master/docs/api/web-contents.md#contentssetzoomlevellevel
 */
export declare function zoomLevelToZoomFactor(zoomLevel?: number): number;
export {};
