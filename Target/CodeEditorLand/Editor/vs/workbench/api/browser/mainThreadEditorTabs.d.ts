import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { MainThreadEditorTabsShape } from '../common/extHost.protocol.js';
import { EditorGroupColumn } from '../../services/editor/common/editorGroupColumn.js';
import { IEditorGroupsService } from '../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../services/editor/common/editorService.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
export declare class MainThreadEditorTabs implements MainThreadEditorTabsShape {
    private readonly _editorGroupsService;
    private readonly _configurationService;
    private readonly _logService;
    private readonly _dispoables;
    private readonly _proxy;
    private _tabGroupModel;
    private readonly _groupLookup;
    private readonly _tabInfoLookup;
    private readonly _multiDiffEditorInputListeners;
    constructor(extHostContext: IExtHostContext, _editorGroupsService: IEditorGroupsService, _configurationService: IConfigurationService, _logService: ILogService, editorService: IEditorService);
    dispose(): void;
    private _buildTabObject;
    private _editorInputToDto;
    private _generateTabId;
    private _onDidGroupActivate;
    private _onDidTabLabelChange;
    private _onDidTabOpen;
    private _onDidTabClose;
    private _onDidTabActiveChange;
    private _onDidTabDirty;
    private _onDidTabPinChange;
    private _onDidTabPreviewChange;
    private _onDidTabMove;
    private _createTabsModel;
    private _updateTabsModel;
    $moveTab(tabId: string, index: number, viewColumn: EditorGroupColumn, preserveFocus?: boolean): void;
    $closeTab(tabIds: string[], preserveFocus?: boolean): Promise<boolean>;
    $closeGroup(groupIds: number[], preserveFocus?: boolean): Promise<boolean>;
}
