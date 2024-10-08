import { UriComponents } from '../../../../base/common/uri.js';
import { ISandboxConfiguration } from '../../../../base/parts/sandbox/common/sandboxTypes.js';
import { OldIssueReporterData } from '../../../../platform/issue/common/issue.js';
export interface WindowStyles {
    backgroundColor?: string;
    color?: string;
}
export interface WindowData {
    styles: WindowStyles;
    zoomLevel: number;
}
export declare const enum IssueType {
    Bug = 0,
    PerformanceIssue = 1,
    FeatureRequest = 2
}
export declare enum IssueSource {
    VSCode = "vscode",
    Extension = "extension",
    Marketplace = "marketplace"
}
export interface IssueReporterStyles extends WindowStyles {
    textLinkColor?: string;
    textLinkActiveForeground?: string;
    inputBackground?: string;
    inputForeground?: string;
    inputBorder?: string;
    inputErrorBorder?: string;
    inputErrorBackground?: string;
    inputErrorForeground?: string;
    inputActiveBorder?: string;
    buttonBackground?: string;
    buttonForeground?: string;
    buttonHoverBackground?: string;
    sliderBackgroundColor?: string;
    sliderHoverColor?: string;
    sliderActiveColor?: string;
}
export interface IssueReporterExtensionData {
    name: string;
    publisher: string | undefined;
    version: string;
    id: string;
    isTheme: boolean;
    isBuiltin: boolean;
    displayName: string | undefined;
    repositoryUrl: string | undefined;
    bugsUrl: string | undefined;
    extensionData?: string;
    extensionTemplate?: string;
    data?: string;
    uri?: UriComponents;
}
export interface IssueReporterData extends WindowData {
    styles: IssueReporterStyles;
    enabledExtensions: IssueReporterExtensionData[];
    issueType?: IssueType;
    issueSource?: IssueSource;
    extensionId?: string;
    experiments?: string;
    restrictedMode: boolean;
    isUnsupported: boolean;
    githubAccessToken: string;
    issueTitle?: string;
    issueBody?: string;
    data?: string;
    uri?: UriComponents;
}
export interface ISettingSearchResult {
    extensionId: string;
    key: string;
    score: number;
}
export interface ProcessExplorerStyles extends WindowStyles {
    listHoverBackground?: string;
    listHoverForeground?: string;
    listFocusBackground?: string;
    listFocusForeground?: string;
    listFocusOutline?: string;
    listActiveSelectionBackground?: string;
    listActiveSelectionForeground?: string;
    listHoverOutline?: string;
    scrollbarShadowColor?: string;
    scrollbarSliderBackgroundColor?: string;
    scrollbarSliderHoverBackgroundColor?: string;
    scrollbarSliderActiveBackgroundColor?: string;
}
export interface ProcessExplorerData extends WindowData {
    pid: number;
    styles: ProcessExplorerStyles;
    platform: string;
    applicationName: string;
}
export interface IssueReporterWindowConfiguration extends ISandboxConfiguration {
    disableExtensions: boolean;
    data: IssueReporterData | OldIssueReporterData;
    os: {
        type: string;
        arch: string;
        release: string;
    };
}
export interface ProcessExplorerWindowConfiguration extends ISandboxConfiguration {
    data: ProcessExplorerData;
}
export declare const IIssueFormService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IIssueFormService>;
export interface IIssueFormService {
    readonly _serviceBrand: undefined;
    openReporter(data: IssueReporterData): Promise<void>;
    reloadWithExtensionsDisabled(): Promise<void>;
    showConfirmCloseDialog(): Promise<void>;
    showClipboardDialog(): Promise<boolean>;
    sendReporterMenu(extensionId: string): Promise<IssueReporterData | undefined>;
    closeReporter(): Promise<void>;
}
export declare const IWorkbenchIssueService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchIssueService>;
export interface IWorkbenchIssueService {
    readonly _serviceBrand: undefined;
    openReporter(dataOverrides?: Partial<IssueReporterData>): Promise<void>;
}
export declare const IWorkbenchProcessService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchProcessService>;
export interface IWorkbenchProcessService {
    readonly _serviceBrand: undefined;
    openProcessExplorer(): Promise<void>;
}
