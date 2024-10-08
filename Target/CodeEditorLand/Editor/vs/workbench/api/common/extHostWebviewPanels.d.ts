import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ExtHostWebview, ExtHostWebviews } from './extHostWebview.js';
import { IExtHostWorkspace } from './extHostWorkspace.js';
import { EditorGroupColumn } from '../../services/editor/common/editorGroupColumn.js';
import type * as vscode from 'vscode';
import * as extHostProtocol from './extHost.protocol.js';
type IconPath = URI | {
    readonly light: URI;
    readonly dark: URI;
};
declare class ExtHostWebviewPanel extends Disposable implements vscode.WebviewPanel {
    #private;
    readonly onDidDispose: import("../../workbench.web.main.internal.js").Event<void>;
    readonly onDidChangeViewState: import("../../workbench.web.main.internal.js").Event<vscode.WebviewPanelOnDidChangeViewStateEvent>;
    constructor(handle: extHostProtocol.WebviewHandle, proxy: extHostProtocol.MainThreadWebviewPanelsShape, webview: ExtHostWebview, params: {
        viewType: string;
        title: string;
        viewColumn: vscode.ViewColumn | undefined;
        panelOptions: vscode.WebviewPanelOptions;
        active: boolean;
    });
    dispose(): void;
    get webview(): ExtHostWebview;
    get viewType(): string;
    get title(): string;
    set title(value: string);
    get iconPath(): IconPath | undefined;
    set iconPath(value: IconPath | undefined);
    get options(): vscode.WebviewPanelOptions;
    get viewColumn(): vscode.ViewColumn | undefined;
    get active(): boolean;
    get visible(): boolean;
    _updateViewState(newState: {
        active: boolean;
        visible: boolean;
        viewColumn: vscode.ViewColumn;
    }): void;
    reveal(viewColumn?: vscode.ViewColumn, preserveFocus?: boolean): void;
    private assertNotDisposed;
}
export declare class ExtHostWebviewPanels extends Disposable implements extHostProtocol.ExtHostWebviewPanelsShape {
    private readonly webviews;
    private readonly workspace;
    private static newHandle;
    private readonly _proxy;
    private readonly _webviewPanels;
    private readonly _serializers;
    constructor(mainContext: extHostProtocol.IMainContext, webviews: ExtHostWebviews, workspace: IExtHostWorkspace | undefined);
    dispose(): void;
    createWebviewPanel(extension: IExtensionDescription, viewType: string, title: string, showOptions: vscode.ViewColumn | {
        viewColumn: vscode.ViewColumn;
        preserveFocus?: boolean;
    }, options?: (vscode.WebviewPanelOptions & vscode.WebviewOptions)): vscode.WebviewPanel;
    $onDidChangeWebviewPanelViewStates(newStates: extHostProtocol.WebviewPanelViewStateData): void;
    $onDidDisposeWebviewPanel(handle: extHostProtocol.WebviewHandle): Promise<void>;
    registerWebviewPanelSerializer(extension: IExtensionDescription, viewType: string, serializer: vscode.WebviewPanelSerializer): vscode.Disposable;
    $deserializeWebviewPanel(webviewHandle: extHostProtocol.WebviewHandle, viewType: string, initData: {
        title: string;
        state: any;
        webviewOptions: extHostProtocol.IWebviewContentOptions;
        panelOptions: extHostProtocol.IWebviewPanelOptions;
        active: boolean;
    }, position: EditorGroupColumn): Promise<void>;
    createNewWebviewPanel(webviewHandle: string, viewType: string, title: string, position: vscode.ViewColumn, options: extHostProtocol.IWebviewPanelOptions, webview: ExtHostWebview, active: boolean): ExtHostWebviewPanel;
    getWebviewPanel(handle: extHostProtocol.WebviewHandle): ExtHostWebviewPanel | undefined;
}
export {};
