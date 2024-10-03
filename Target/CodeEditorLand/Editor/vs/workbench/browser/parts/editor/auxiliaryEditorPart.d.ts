import { Event } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IEditorGroupView, IEditorPartsView } from './editor.js';
import { EditorPart, IEditorPartUIState } from './editorPart.js';
import { IAuxiliaryWindowOpenOptions, IAuxiliaryWindowService } from '../../../services/auxiliaryWindow/browser/auxiliaryWindowService.js';
import { IAuxiliaryEditorPart } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
import { ITitleService } from '../../../services/title/browser/titleService.js';
export interface IAuxiliaryEditorPartOpenOptions extends IAuxiliaryWindowOpenOptions {
    readonly state?: IEditorPartUIState;
}
export interface ICreateAuxiliaryEditorPartResult {
    readonly part: AuxiliaryEditorPartImpl;
    readonly instantiationService: IInstantiationService;
    readonly disposables: DisposableStore;
}
export declare class AuxiliaryEditorPart {
    private readonly editorPartsView;
    private readonly instantiationService;
    private readonly auxiliaryWindowService;
    private readonly lifecycleService;
    private readonly configurationService;
    private readonly statusbarService;
    private readonly titleService;
    private readonly editorService;
    private readonly layoutService;
    private static STATUS_BAR_VISIBILITY;
    constructor(editorPartsView: IEditorPartsView, instantiationService: IInstantiationService, auxiliaryWindowService: IAuxiliaryWindowService, lifecycleService: ILifecycleService, configurationService: IConfigurationService, statusbarService: IStatusbarService, titleService: ITitleService, editorService: IEditorService, layoutService: IWorkbenchLayoutService);
    create(label: string, options?: IAuxiliaryEditorPartOpenOptions): Promise<ICreateAuxiliaryEditorPartResult>;
}
declare class AuxiliaryEditorPartImpl extends EditorPart implements IAuxiliaryEditorPart {
    private readonly state;
    private static COUNTER;
    private readonly _onWillClose;
    readonly onWillClose: Event<void>;
    constructor(windowId: number, editorPartsView: IEditorPartsView, state: IEditorPartUIState | undefined, groupsLabel: string, instantiationService: IInstantiationService, themeService: IThemeService, configurationService: IConfigurationService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, hostService: IHostService, contextKeyService: IContextKeyService);
    removeGroup(group: number | IEditorGroupView, preserveFocus?: boolean): void;
    private doRemoveLastGroup;
    protected loadState(): IEditorPartUIState | undefined;
    protected saveState(): void;
    close(): boolean;
    private doClose;
    private mergeGroupsToMainPart;
}
export {};
