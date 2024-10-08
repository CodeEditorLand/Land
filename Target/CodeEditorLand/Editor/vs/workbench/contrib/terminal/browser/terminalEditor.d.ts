import * as dom from '../../../../base/browser/dom.js';
import { IActionViewItem } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { IAction } from '../../../../base/common/actions.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { IEditorOpenContext } from '../../../common/editor.js';
import { ITerminalConfigurationService, ITerminalEditorService, ITerminalService } from './terminal.js';
import { TerminalEditorInput } from './terminalEditorInput.js';
import { ITerminalProfileResolverService, ITerminalProfileService } from '../common/terminal.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IBaseActionViewItemOptions } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
export declare class TerminalEditor extends EditorPane {
    private readonly _terminalEditorService;
    private readonly _terminalProfileResolverService;
    private readonly _terminalService;
    private readonly _terminalConfigurationService;
    private readonly _instantiationService;
    private readonly _contextMenuService;
    private readonly _terminalProfileService;
    private readonly _workbenchLayoutService;
    private _editorInstanceElement;
    private _overflowGuardElement;
    private _editorInput?;
    private _lastDimension?;
    private readonly _dropdownMenu;
    private readonly _instanceMenu;
    private _cancelContextMenu;
    private readonly _disposableStore;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService, _terminalEditorService: ITerminalEditorService, _terminalProfileResolverService: ITerminalProfileResolverService, _terminalService: ITerminalService, _terminalConfigurationService: ITerminalConfigurationService, contextKeyService: IContextKeyService, menuService: IMenuService, _instantiationService: IInstantiationService, _contextMenuService: IContextMenuService, _terminalProfileService: ITerminalProfileService, _workbenchLayoutService: IWorkbenchLayoutService);
    setInput(newInput: TerminalEditorInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    clearInput(): void;
    private _setActiveInstance;
    focus(): void;
    protected createEditor(parent: HTMLElement): void;
    private _registerListeners;
    layout(dimension: dom.Dimension): void;
    setVisible(visible: boolean): void;
    getActionViewItem(action: IAction, options: IBaseActionViewItemOptions): IActionViewItem | undefined;
    /**
     * Actions might be of type Action (disposable) or Separator or SubmenuAction, which don't extend Disposable
     */
    private _registerDisposableActions;
    private _getDefaultProfileName;
}
