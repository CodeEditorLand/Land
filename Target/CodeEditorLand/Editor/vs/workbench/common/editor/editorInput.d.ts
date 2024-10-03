import { Emitter } from '../../../base/common/event.js';
import { URI } from '../../../base/common/uri.js';
import { EditorInputCapabilities, Verbosity, GroupIdentifier, ISaveOptions, IRevertOptions, IMoveResult, IEditorDescriptor, IEditorPane, IUntypedEditorInput, AbstractEditorInput, IEditorIdentifier } from '../editor.js';
import { ConfirmResult } from '../../../platform/dialogs/common/dialogs.js';
import { IMarkdownString } from '../../../base/common/htmlContent.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../base/common/themables.js';
export interface IEditorCloseHandler {
    showConfirm(): boolean;
    confirm(editors: ReadonlyArray<IEditorIdentifier>): Promise<ConfirmResult>;
}
export interface IUntypedEditorOptions {
    readonly preserveViewState?: GroupIdentifier;
    readonly preserveResource?: boolean;
}
export declare abstract class EditorInput extends AbstractEditorInput {
    protected readonly _onDidChangeDirty: Emitter<void>;
    protected readonly _onDidChangeLabel: Emitter<void>;
    protected readonly _onDidChangeCapabilities: Emitter<void>;
    private readonly _onWillDispose;
    readonly onDidChangeDirty: import("../../workbench.web.main.internal.js").Event<void>;
    readonly onDidChangeLabel: import("../../workbench.web.main.internal.js").Event<void>;
    readonly onDidChangeCapabilities: import("../../workbench.web.main.internal.js").Event<void>;
    readonly onWillDispose: import("../../workbench.web.main.internal.js").Event<void>;
    readonly closeHandler?: IEditorCloseHandler;
    abstract get typeId(): string;
    abstract get resource(): URI | undefined;
    get editorId(): string | undefined;
    get capabilities(): EditorInputCapabilities;
    hasCapability(capability: EditorInputCapabilities): boolean;
    isReadonly(): boolean | IMarkdownString;
    getName(): string;
    getDescription(verbosity?: Verbosity): string | undefined;
    getTitle(verbosity?: Verbosity): string;
    getLabelExtraClasses(): string[];
    getAriaLabel(): string;
    getIcon(): ThemeIcon | undefined;
    getTelemetryDescriptor(): {
        [key: string]: unknown;
    };
    isDirty(): boolean;
    isModified(): boolean;
    isSaving(): boolean;
    resolve(): Promise<IDisposable | null>;
    save(group: GroupIdentifier, options?: ISaveOptions): Promise<EditorInput | IUntypedEditorInput | undefined>;
    saveAs(group: GroupIdentifier, options?: ISaveOptions): Promise<EditorInput | IUntypedEditorInput | undefined>;
    revert(group: GroupIdentifier, options?: IRevertOptions): Promise<void>;
    rename(group: GroupIdentifier, target: URI): Promise<IMoveResult | undefined>;
    copy(): EditorInput;
    canMove(sourceGroup: GroupIdentifier, targetGroup: GroupIdentifier): true | string;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    prefersEditorPane<T extends IEditorDescriptor<IEditorPane>>(editorPanes: T[]): T | undefined;
    toUntyped(options?: IUntypedEditorOptions): IUntypedEditorInput | undefined;
    isDisposed(): boolean;
    dispose(): void;
}
