import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
export declare class TestingViewPaneContainer extends ViewPaneContainer {
    constructor(layoutService: IWorkbenchLayoutService, telemetryService: ITelemetryService, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, themeService: IThemeService, storageService: IStorageService, configurationService: IConfigurationService, extensionService: IExtensionService, contextService: IWorkspaceContextService, viewDescriptorService: IViewDescriptorService);
    create(parent: HTMLElement): void;
    getOptimalWidth(): number;
    getTitle(): string;
}
