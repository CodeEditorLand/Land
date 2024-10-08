import { Disposable } from '../../../../base/common/lifecycle.js';
import { IEditorOpenContext, IVisibleEditorPane } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IDomNodePagePosition } from '../../../../base/browser/dom.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { EditorPane } from './editorPane.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorProgressService } from '../../../../platform/progress/common/progress.js';
import { IEditorGroupView, IInternalEditorOpenOptions } from './editor.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IBoundarySashes } from '../../../../base/browser/ui/sash/sash.js';
import { IHostService } from '../../../services/host/browser/host.js';
export interface IOpenEditorResult {
    /**
     * The editor pane used for opening. This can be a generic
     * placeholder in certain cases, e.g. when workspace trust
     * is required, or an editor fails to restore.
     *
     * Will be `undefined` if an error occurred while trying to
     * open the editor and in cases where no placeholder is being
     * used.
     */
    readonly pane?: EditorPane;
    /**
     * Whether the editor changed as a result of opening.
     */
    readonly changed?: boolean;
    /**
     * This property is set when an editor fails to restore and
     * is shown with a generic place holder. It allows callers
     * to still present the error to the user in that case.
     */
    readonly error?: Error;
    /**
     * This property indicates whether the open editor operation was
     * cancelled or not. The operation may have been cancelled
     * in case another editor open operation was triggered right
     * after cancelling this one out.
     */
    readonly cancelled?: boolean;
}
export declare class EditorPanes extends Disposable {
    private readonly editorGroupParent;
    private readonly editorPanesParent;
    private readonly groupView;
    private readonly layoutService;
    private readonly instantiationService;
    private readonly editorProgressService;
    private readonly workspaceTrustService;
    private readonly logService;
    private readonly dialogService;
    private readonly hostService;
    private readonly _onDidFocus;
    readonly onDidFocus: import("../../../workbench.web.main.internal.js").Event<void>;
    private _onDidChangeSizeConstraints;
    readonly onDidChangeSizeConstraints: import("../../../workbench.web.main.internal.js").Event<{
        width: number;
        height: number;
    } | undefined>;
    get minimumWidth(): number;
    get minimumHeight(): number;
    get maximumWidth(): number;
    get maximumHeight(): number;
    private _activeEditorPane;
    get activeEditorPane(): IVisibleEditorPane | null;
    private readonly editorPanes;
    private readonly mapEditorPaneToPendingSetInput;
    private readonly activeEditorPaneDisposables;
    private pagePosition;
    private boundarySashes;
    private readonly editorOperation;
    private readonly editorPanesRegistry;
    constructor(editorGroupParent: HTMLElement, editorPanesParent: HTMLElement, groupView: IEditorGroupView, layoutService: IWorkbenchLayoutService, instantiationService: IInstantiationService, editorProgressService: IEditorProgressService, workspaceTrustService: IWorkspaceTrustManagementService, logService: ILogService, dialogService: IDialogService, hostService: IHostService);
    private registerListeners;
    private onDidChangeWorkspaceTrust;
    openEditor(editor: EditorInput, options: IEditorOptions | undefined, internalOptions: IInternalEditorOpenOptions | undefined, context?: IEditorOpenContext): Promise<IOpenEditorResult>;
    private doShowError;
    private doShowErrorDialog;
    private doOpenEditor;
    private shouldRestoreFocus;
    private getEditorPaneDescriptor;
    private doShowEditorPane;
    private doCreateEditorPane;
    private doInstantiateEditorPane;
    private doSetActiveEditorPane;
    private doSetInput;
    private doHideActiveEditorPane;
    closeEditor(editor: EditorInput): void;
    setVisible(visible: boolean): void;
    layout(pagePosition: IDomNodePagePosition): void;
    setBoundarySashes(sashes: IBoundarySashes): void;
    private safeRun;
}
