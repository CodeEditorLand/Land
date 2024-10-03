import { CodeWindow } from '../../../../base/browser/window.js';
import { URI } from '../../../../base/common/uri.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { EditorInputCapabilities, GroupIdentifier, IUntypedEditorInput, Verbosity } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IOverlayWebview } from '../../webview/browser/webview.js';
import { WebviewIconManager, WebviewIcons } from './webviewIconManager.js';
export interface WebviewInputInitInfo {
    readonly viewType: string;
    readonly providedId: string | undefined;
    readonly name: string;
}
export declare class WebviewInput extends EditorInput {
    private readonly _iconManager;
    static typeId: string;
    get typeId(): string;
    get editorId(): string;
    get capabilities(): EditorInputCapabilities;
    private readonly _resourceId;
    private _name;
    private _iconPath?;
    private _group?;
    private _webview;
    private _hasTransfered;
    get resource(): URI;
    readonly viewType: string;
    readonly providedId: string | undefined;
    constructor(init: WebviewInputInitInfo, webview: IOverlayWebview, _iconManager: WebviewIconManager);
    dispose(): void;
    getName(): string;
    getTitle(_verbosity?: Verbosity): string;
    getDescription(): string | undefined;
    setName(value: string): void;
    get webview(): IOverlayWebview;
    get extension(): import("../../webview/browser/webview.js").WebviewExtensionDescription | undefined;
    get iconPath(): WebviewIcons | undefined;
    set iconPath(value: WebviewIcons | undefined);
    matches(other: EditorInput | IUntypedEditorInput): boolean;
    get group(): GroupIdentifier | undefined;
    updateGroup(group: GroupIdentifier): void;
    protected transfer(other: WebviewInput): WebviewInput | undefined;
    claim(claimant: unknown, targetWindow: CodeWindow, scopedContextKeyService: IContextKeyService | undefined): void;
}
