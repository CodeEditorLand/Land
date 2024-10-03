import './media/editordroptarget.css';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService, Themable } from '../../../../platform/theme/common/themeService.js';
import { IEditorDropTargetDelegate, IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
export declare class EditorDropTarget extends Themable {
    private readonly container;
    private readonly delegate;
    private readonly editorGroupService;
    private readonly configurationService;
    private readonly instantiationService;
    private _overlay?;
    private counter;
    private readonly editorTransfer;
    private readonly groupTransfer;
    constructor(container: HTMLElement, delegate: IEditorDropTargetDelegate, editorGroupService: IEditorGroupsService, themeService: IThemeService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    private get overlay();
    private registerListeners;
    private onDragEnter;
    private onDragLeave;
    private onDragEnd;
    private findTargetGroupView;
    private updateContainer;
    dispose(): void;
    private disposeOverlay;
}
