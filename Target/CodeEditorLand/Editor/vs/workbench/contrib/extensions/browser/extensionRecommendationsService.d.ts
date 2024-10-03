import { Disposable } from '../../../../base/common/lifecycle.js';
import { IExtensionManagementService, IExtensionGalleryService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IExtensionRecommendationsService, ExtensionRecommendationReason, IExtensionIgnoredRecommendationsService } from '../../../services/extensionRecommendations/common/extensionRecommendations.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { Event } from '../../../../base/common/event.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { IExtensionRecommendationNotificationService } from '../../../../platform/extensionRecommendations/common/extensionRecommendations.js';
import { URI } from '../../../../base/common/uri.js';
import { IExtensionsWorkbenchService } from '../common/extensions.js';
import { IRemoteExtensionsScannerService } from '../../../../platform/remote/common/remoteExtensionsScanner.js';
import { IUserDataInitializationService } from '../../../services/userData/browser/userDataInit.js';
export declare class ExtensionRecommendationsService extends Disposable implements IExtensionRecommendationsService {
    private readonly lifecycleService;
    private readonly galleryService;
    private readonly telemetryService;
    private readonly environmentService;
    private readonly extensionManagementService;
    private readonly extensionRecommendationsManagementService;
    private readonly extensionRecommendationNotificationService;
    private readonly extensionsWorkbenchService;
    private readonly remoteExtensionsScannerService;
    private readonly userDataInitializationService;
    readonly _serviceBrand: undefined;
    private readonly fileBasedRecommendations;
    private readonly workspaceRecommendations;
    private readonly configBasedRecommendations;
    private readonly exeBasedRecommendations;
    private readonly keymapRecommendations;
    private readonly webRecommendations;
    private readonly languageRecommendations;
    private readonly remoteRecommendations;
    readonly activationPromise: Promise<void>;
    private sessionSeed;
    private _onDidChangeRecommendations;
    readonly onDidChangeRecommendations: Event<void>;
    constructor(instantiationService: IInstantiationService, lifecycleService: ILifecycleService, galleryService: IExtensionGalleryService, telemetryService: ITelemetryService, environmentService: IEnvironmentService, extensionManagementService: IExtensionManagementService, extensionRecommendationsManagementService: IExtensionIgnoredRecommendationsService, extensionRecommendationNotificationService: IExtensionRecommendationNotificationService, extensionsWorkbenchService: IExtensionsWorkbenchService, remoteExtensionsScannerService: IRemoteExtensionsScannerService, userDataInitializationService: IUserDataInitializationService);
    private activate;
    private isEnabled;
    private activateProactiveRecommendations;
    getAllRecommendationsWithReason(): {
        [id: string]: {
            reasonId: ExtensionRecommendationReason;
            reasonText: string;
        };
    };
    getConfigBasedRecommendations(): Promise<{
        important: string[];
        others: string[];
    }>;
    getOtherRecommendations(): Promise<string[]>;
    getImportantRecommendations(): Promise<string[]>;
    getKeymapRecommendations(): string[];
    getLanguageRecommendations(): string[];
    getRemoteRecommendations(): string[];
    getWorkspaceRecommendations(): Promise<Array<string | URI>>;
    getExeBasedRecommendations(exe?: string): Promise<{
        important: string[];
        others: string[];
    }>;
    getFileBasedRecommendations(): string[];
    private onDidInstallExtensions;
    private toExtensionIds;
    private isExtensionAllowedToBeRecommended;
    private promptWorkspaceRecommendations;
    private _registerP;
}
