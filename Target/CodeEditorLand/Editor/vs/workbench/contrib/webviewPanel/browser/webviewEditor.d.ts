import * as DOM from '../../../../base/browser/dom.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { IEditorOpenContext } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IEditorGroup, IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
/**
 * Tracks the id of the actively focused webview.
 */
export declare const CONTEXT_ACTIVE_WEBVIEW_PANEL_ID: RawContextKey<string>;
export declare class WebviewEditor extends EditorPane {
    private readonly _editorGroupsService;
    private readonly _editorService;
    private readonly _workbenchLayoutService;
    private readonly _hostService;
    private readonly _contextKeyService;
    static readonly ID = "WebviewEditor";
    private _element?;
    private _dimension?;
    private _visible;
    private _isDisposed;
    private readonly _webviewVisibleDisposables;
    private readonly _onFocusWindowHandler;
    private readonly _onDidFocusWebview;
    get onDidFocus(): Event<any>;
    private readonly _scopedContextKeyService;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService, _editorGroupsService: IEditorGroupsService, _editorService: IEditorService, _workbenchLayoutService: IWorkbenchLayoutService, _hostService: IHostService, _contextKeyService: IContextKeyService);
    private get webview();
    get scopedContextKeyService(): IContextKeyService | undefined;
    protected createEditor(parent: HTMLElement): void;
    dispose(): void;
    layout(dimension: DOM.Dimension): void;
    focus(): void;
    protected setEditorVisible(visible: boolean): void;
    clearInput(): void;
    setInput(input: EditorInput, options: IEditorOptions, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    private claimWebview;
    private synchronizeWebviewContainerDimensions;
    private trackFocus;
}
