import { Composite, CompositeDescriptor, CompositeRegistry } from './composite.js';
import { BrandedService, IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
import { URI } from '../../base/common/uri.js';
import { Dimension } from '../../base/browser/dom.js';
import { IActionViewItem } from '../../base/browser/ui/actionbar/actionbar.js';
import { IAction } from '../../base/common/actions.js';
import { MenuId } from '../../platform/actions/common/actions.js';
import { IContextMenuService } from '../../platform/contextview/browser/contextView.js';
import { IStorageService } from '../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../platform/theme/common/themeService.js';
import { IWorkspaceContextService } from '../../platform/workspace/common/workspace.js';
import { ViewPaneContainer } from './parts/views/viewPaneContainer.js';
import { IPaneComposite } from '../common/panecomposite.js';
import { IView } from '../common/views.js';
import { IExtensionService } from '../services/extensions/common/extensions.js';
import { IBoundarySashes } from '../../base/browser/ui/sash/sash.js';
import { IBaseActionViewItemOptions } from '../../base/browser/ui/actionbar/actionViewItems.js';
export declare abstract class PaneComposite extends Composite implements IPaneComposite {
    protected storageService: IStorageService;
    protected instantiationService: IInstantiationService;
    protected contextMenuService: IContextMenuService;
    protected extensionService: IExtensionService;
    protected contextService: IWorkspaceContextService;
    private viewPaneContainer?;
    constructor(id: string, telemetryService: ITelemetryService, storageService: IStorageService, instantiationService: IInstantiationService, themeService: IThemeService, contextMenuService: IContextMenuService, extensionService: IExtensionService, contextService: IWorkspaceContextService);
    create(parent: HTMLElement): void;
    setVisible(visible: boolean): void;
    layout(dimension: Dimension): void;
    setBoundarySashes(sashes: IBoundarySashes): void;
    getOptimalWidth(): number;
    openView<T extends IView>(id: string, focus?: boolean): T | undefined;
    getViewPaneContainer(): ViewPaneContainer | undefined;
    getActionsContext(): unknown;
    getContextMenuActions(): readonly IAction[];
    getMenuIds(): MenuId[];
    getActions(): readonly IAction[];
    getSecondaryActions(): readonly IAction[];
    getActionViewItem(action: IAction, options: IBaseActionViewItemOptions): IActionViewItem | undefined;
    getTitle(): string;
    focus(): void;
    protected abstract createViewPaneContainer(parent: HTMLElement): ViewPaneContainer;
}
export declare class PaneCompositeDescriptor extends CompositeDescriptor<PaneComposite> {
    readonly iconUrl?: URI | undefined;
    static create<Services extends BrandedService[]>(ctor: {
        new (...services: Services): PaneComposite;
    }, id: string, name: string, cssClass?: string, order?: number, requestedIndex?: number, iconUrl?: URI): PaneCompositeDescriptor;
    private constructor();
}
export declare const Extensions: {
    Viewlets: string;
    Panels: string;
    Auxiliary: string;
};
export declare class PaneCompositeRegistry extends CompositeRegistry<PaneComposite> {
    registerPaneComposite(descriptor: PaneCompositeDescriptor): void;
    deregisterPaneComposite(id: string): void;
    getPaneComposite(id: string): PaneCompositeDescriptor;
    getPaneComposites(): PaneCompositeDescriptor[];
}
