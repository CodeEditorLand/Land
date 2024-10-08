import { IEditorTabGroupDto, IExtHostEditorTabsShape, TabOperation } from './extHost.protocol.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import type * as vscode from 'vscode';
export interface IExtHostEditorTabs extends IExtHostEditorTabsShape {
    readonly _serviceBrand: undefined;
    tabGroups: vscode.TabGroups;
}
export declare const IExtHostEditorTabs: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostEditorTabs>;
export declare class ExtHostEditorTabs implements IExtHostEditorTabs {
    readonly _serviceBrand: undefined;
    private readonly _proxy;
    private readonly _onDidChangeTabs;
    private readonly _onDidChangeTabGroups;
    private _activeGroupId;
    private _extHostTabGroups;
    private _apiObject;
    constructor(extHostRpc: IExtHostRpcService);
    get tabGroups(): vscode.TabGroups;
    $acceptEditorTabModel(tabGroups: IEditorTabGroupDto[]): void;
    $acceptTabGroupUpdate(groupDto: IEditorTabGroupDto): void;
    $acceptTabOperation(operation: TabOperation): void;
    private _findExtHostTabFromApi;
    private _findExtHostTabGroupFromApi;
    private _closeTabs;
    private _closeGroups;
}
