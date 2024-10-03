import './media/extensionsWidgets.css';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IExtension, IExtensionsWorkbenchService, IExtensionContainer } from '../common/extensions.js';
import { IExtensionManagementServerService } from '../../../services/extensionManagement/common/extensionManagement.js';
import { IExtensionIgnoredRecommendationsService, IExtensionRecommendationsService } from '../../../services/extensionRecommendations/common/extensionRecommendations.js';
import { ExtensionStatusAction } from './extensionsActions.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { Event } from '../../../../base/common/event.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IUserDataSyncEnablementService } from '../../../../platform/userDataSync/common/userDataSync.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { HoverPosition } from '../../../../base/browser/ui/hover/hoverWidget.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
export declare abstract class ExtensionWidget extends Disposable implements IExtensionContainer {
    private _extension;
    get extension(): IExtension | null;
    set extension(extension: IExtension | null);
    update(): void;
    abstract render(): void;
}
export declare function onClick(element: HTMLElement, callback: () => void): IDisposable;
export declare class InstallCountWidget extends ExtensionWidget {
    private container;
    private small;
    constructor(container: HTMLElement, small: boolean);
    render(): void;
    static getInstallLabel(extension: IExtension, small: boolean): string | undefined;
}
export declare class RatingsWidget extends ExtensionWidget {
    private container;
    private small;
    private readonly containerHover;
    constructor(container: HTMLElement, small: boolean, hoverService: IHoverService);
    render(): void;
}
export declare class VerifiedPublisherWidget extends ExtensionWidget {
    private container;
    private small;
    private readonly openerService;
    private readonly disposables;
    private readonly containerHover;
    constructor(container: HTMLElement, small: boolean, hoverService: IHoverService, openerService: IOpenerService);
    render(): void;
}
export declare class SponsorWidget extends ExtensionWidget {
    private container;
    private readonly hoverService;
    private readonly openerService;
    private readonly telemetryService;
    private readonly disposables;
    constructor(container: HTMLElement, hoverService: IHoverService, openerService: IOpenerService, telemetryService: ITelemetryService);
    render(): void;
}
export declare class RecommendationWidget extends ExtensionWidget {
    private parent;
    private readonly extensionRecommendationsService;
    private element?;
    private readonly disposables;
    constructor(parent: HTMLElement, extensionRecommendationsService: IExtensionRecommendationsService);
    private clear;
    render(): void;
}
export declare class PreReleaseBookmarkWidget extends ExtensionWidget {
    private parent;
    private element?;
    private readonly disposables;
    constructor(parent: HTMLElement);
    private clear;
    render(): void;
}
export declare class RemoteBadgeWidget extends ExtensionWidget {
    private readonly tooltip;
    private readonly extensionManagementServerService;
    private readonly instantiationService;
    private readonly remoteBadge;
    private element;
    constructor(parent: HTMLElement, tooltip: boolean, extensionManagementServerService: IExtensionManagementServerService, instantiationService: IInstantiationService);
    private clear;
    render(): void;
}
export declare class ExtensionPackCountWidget extends ExtensionWidget {
    private readonly parent;
    private element;
    constructor(parent: HTMLElement);
    private clear;
    render(): void;
}
export declare class SyncIgnoredWidget extends ExtensionWidget {
    private readonly container;
    private readonly configurationService;
    private readonly extensionsWorkbenchService;
    private readonly hoverService;
    private readonly userDataSyncEnablementService;
    private readonly disposables;
    constructor(container: HTMLElement, configurationService: IConfigurationService, extensionsWorkbenchService: IExtensionsWorkbenchService, hoverService: IHoverService, userDataSyncEnablementService: IUserDataSyncEnablementService);
    render(): void;
}
export declare class ExtensionActivationStatusWidget extends ExtensionWidget {
    private readonly container;
    private readonly small;
    private readonly extensionsWorkbenchService;
    constructor(container: HTMLElement, small: boolean, extensionService: IExtensionService, extensionsWorkbenchService: IExtensionsWorkbenchService);
    render(): void;
}
export type ExtensionHoverOptions = {
    position: () => HoverPosition;
    readonly target: HTMLElement;
};
export declare class ExtensionHoverWidget extends ExtensionWidget {
    private readonly options;
    private readonly extensionStatusAction;
    private readonly extensionsWorkbenchService;
    private readonly hoverService;
    private readonly configurationService;
    private readonly extensionRecommendationsService;
    private readonly themeService;
    private readonly contextService;
    private readonly hover;
    constructor(options: ExtensionHoverOptions, extensionStatusAction: ExtensionStatusAction, extensionsWorkbenchService: IExtensionsWorkbenchService, hoverService: IHoverService, configurationService: IConfigurationService, extensionRecommendationsService: IExtensionRecommendationsService, themeService: IThemeService, contextService: IWorkspaceContextService);
    render(): void;
    private getHoverMarkdown;
    private getRecommendationMessage;
    static getPreReleaseMessage(extension: IExtension): string | undefined;
}
export declare class ExtensionStatusWidget extends ExtensionWidget {
    private readonly container;
    private readonly extensionStatusAction;
    private readonly openerService;
    private readonly renderDisposables;
    private readonly _onDidRender;
    readonly onDidRender: Event<void>;
    constructor(container: HTMLElement, extensionStatusAction: ExtensionStatusAction, openerService: IOpenerService);
    render(): void;
}
export declare class ExtensionRecommendationWidget extends ExtensionWidget {
    private readonly container;
    private readonly extensionRecommendationsService;
    private readonly extensionIgnoredRecommendationsService;
    private readonly _onDidRender;
    readonly onDidRender: Event<void>;
    constructor(container: HTMLElement, extensionRecommendationsService: IExtensionRecommendationsService, extensionIgnoredRecommendationsService: IExtensionIgnoredRecommendationsService);
    render(): void;
    private getRecommendationStatus;
}
export declare const extensionRatingIconColor: string;
export declare const extensionVerifiedPublisherIconColor: string;
export declare const extensionPreReleaseIconColor: string;
export declare const extensionSponsorIconColor: string;
