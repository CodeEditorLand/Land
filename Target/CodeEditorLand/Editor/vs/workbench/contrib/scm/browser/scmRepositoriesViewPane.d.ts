import './media/scm.css';
import { ViewPane, IViewPaneOptions } from '../../../browser/parts/views/viewPane.js';
import { ISCMViewService } from '../common/scm.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
export declare class SCMRepositoriesViewPane extends ViewPane {
    protected scmViewService: ISCMViewService;
    private list;
    private readonly disposables;
    constructor(options: IViewPaneOptions, scmViewService: ISCMViewService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, hoverService: IHoverService);
    protected renderBody(container: HTMLElement): void;
    private onDidChangeRepositories;
    focus(): void;
    protected layoutBody(height: number, width: number): void;
    private updateBodySize;
    private onListContextMenu;
    private onListSelectionChange;
    private updateListSelection;
    dispose(): void;
}
