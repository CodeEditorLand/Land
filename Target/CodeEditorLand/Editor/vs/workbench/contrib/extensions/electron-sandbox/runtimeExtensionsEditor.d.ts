import { Action } from '../../../../base/common/actions.js';
import { Event } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { Action2, IMenuService } from '../../../../platform/actions/common/actions.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IExtensionFeaturesManagementService } from '../../../services/extensionManagement/common/extensionFeatures.js';
import { IExtensionHostProfile, IExtensionService } from '../../../services/extensions/common/extensions.js';
import { AbstractRuntimeExtensionsEditor, IRuntimeExtension } from '../browser/abstractRuntimeExtensionsEditor.js';
import { IExtensionsWorkbenchService } from '../common/extensions.js';
export declare const IExtensionHostProfileService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionHostProfileService>;
export declare const CONTEXT_PROFILE_SESSION_STATE: RawContextKey<string>;
export declare const CONTEXT_EXTENSION_HOST_PROFILE_RECORDED: RawContextKey<boolean>;
export declare enum ProfileSessionState {
    None = 0,
    Starting = 1,
    Running = 2,
    Stopping = 3
}
export interface IExtensionHostProfileService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeState: Event<void>;
    readonly onDidChangeLastProfile: Event<void>;
    readonly state: ProfileSessionState;
    readonly lastProfile: IExtensionHostProfile | null;
    lastProfileSavedTo: URI | undefined;
    startProfiling(): void;
    stopProfiling(): void;
    getUnresponsiveProfile(extensionId: ExtensionIdentifier): IExtensionHostProfile | undefined;
    setUnresponsiveProfile(extensionId: ExtensionIdentifier, profile: IExtensionHostProfile): void;
}
export declare class RuntimeExtensionsEditor extends AbstractRuntimeExtensionsEditor {
    private readonly _extensionHostProfileService;
    private _profileInfo;
    private _extensionsHostRecorded;
    private _profileSessionState;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, contextKeyService: IContextKeyService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionService: IExtensionService, notificationService: INotificationService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, storageService: IStorageService, labelService: ILabelService, environmentService: IWorkbenchEnvironmentService, clipboardService: IClipboardService, _extensionHostProfileService: IExtensionHostProfileService, extensionFeaturesManagementService: IExtensionFeaturesManagementService, hoverService: IHoverService, menuService: IMenuService);
    protected _getProfileInfo(): IExtensionHostProfile | null;
    protected _getUnresponsiveProfile(extensionId: ExtensionIdentifier): IExtensionHostProfile | undefined;
    protected _createSlowExtensionAction(element: IRuntimeExtension): Action | null;
    protected _createReportExtensionIssueAction(element: IRuntimeExtension): Action | null;
}
export declare class StartExtensionHostProfileAction extends Action2 {
    static readonly ID = "workbench.extensions.action.extensionHostProfile";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<any>;
}
export declare class StopExtensionHostProfileAction extends Action2 {
    static readonly ID = "workbench.extensions.action.stopExtensionHostProfile";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<any>;
}
export declare class OpenExtensionHostProfileACtion extends Action2 {
    static readonly LABEL: string;
    static readonly ID = "workbench.extensions.action.openExtensionHostProfile";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class SaveExtensionHostProfileAction extends Action2 {
    static readonly LABEL: string;
    static readonly ID = "workbench.extensions.action.saveExtensionHostProfile";
    constructor();
    run(accessor: ServicesAccessor): Promise<any>;
    private _asyncRun;
}
