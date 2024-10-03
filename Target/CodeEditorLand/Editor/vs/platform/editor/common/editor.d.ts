import { IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
export interface IResolvableEditorModel extends IDisposable {
    resolve(): Promise<void>;
    isResolved(): boolean;
}
export declare function isResolvedEditorModel(model: IDisposable | undefined | null): model is IResolvableEditorModel;
export interface IBaseUntypedEditorInput {
    options?: IEditorOptions;
    readonly label?: string;
    readonly description?: string;
}
export interface IBaseResourceEditorInput extends IBaseUntypedEditorInput {
    readonly forceUntitled?: boolean;
}
export interface IBaseTextResourceEditorInput extends IBaseResourceEditorInput {
    options?: ITextEditorOptions;
    contents?: string;
    encoding?: string;
    languageId?: string;
}
export interface IResourceEditorInput extends IBaseResourceEditorInput {
    readonly resource: URI;
}
export interface ITextResourceEditorInput extends IResourceEditorInput, IBaseTextResourceEditorInput {
    options?: ITextEditorOptions;
}
export interface IResourceEditorInputIdentifier {
    readonly typeId: string;
    readonly editorId: string | undefined;
    readonly resource: URI;
}
export declare enum EditorActivation {
    ACTIVATE = 1,
    RESTORE = 2,
    PRESERVE = 3
}
export declare enum EditorResolution {
    PICK = 0,
    EXCLUSIVE_ONLY = 1
}
export declare enum EditorOpenSource {
    API = 0,
    USER = 1
}
export interface IEditorOptions {
    preserveFocus?: boolean;
    activation?: EditorActivation;
    forceReload?: boolean;
    revealIfVisible?: boolean;
    revealIfOpened?: boolean;
    pinned?: boolean;
    sticky?: boolean;
    index?: number;
    inactive?: boolean;
    ignoreError?: boolean;
    override?: string | EditorResolution;
    source?: EditorOpenSource;
    viewState?: object;
    transient?: boolean;
}
export interface ITextEditorSelection {
    readonly startLineNumber: number;
    readonly startColumn: number;
    readonly endLineNumber?: number;
    readonly endColumn?: number;
}
export declare const enum TextEditorSelectionRevealType {
    Center = 0,
    CenterIfOutsideViewport = 1,
    NearTop = 2,
    NearTopIfOutsideViewport = 3
}
export declare const enum TextEditorSelectionSource {
    PROGRAMMATIC = "api",
    NAVIGATION = "code.navigation",
    JUMP = "code.jump"
}
export interface ITextEditorOptions extends IEditorOptions {
    selection?: ITextEditorSelection;
    selectionRevealType?: TextEditorSelectionRevealType;
    selectionSource?: TextEditorSelectionSource | string;
}
