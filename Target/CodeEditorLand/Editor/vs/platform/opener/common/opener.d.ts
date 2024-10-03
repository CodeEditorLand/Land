import { CancellationToken } from '../../../base/common/cancellation.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IEditorOptions, ITextEditorSelection } from '../../editor/common/editor.js';
export declare const IOpenerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IOpenerService>;
export type OpenInternalOptions = {
    readonly openToSide?: boolean;
    readonly editorOptions?: IEditorOptions;
    readonly fromUserGesture?: boolean;
    readonly allowCommands?: boolean | readonly string[];
};
export type OpenExternalOptions = {
    readonly openExternal?: boolean;
    readonly allowTunneling?: boolean;
    readonly allowContributedOpeners?: boolean | string;
    readonly fromWorkspace?: boolean;
};
export type OpenOptions = OpenInternalOptions & OpenExternalOptions;
export type ResolveExternalUriOptions = {
    readonly allowTunneling?: boolean;
};
export interface IResolvedExternalUri extends IDisposable {
    resolved: URI;
}
export interface IOpener {
    open(resource: URI | string, options?: OpenInternalOptions | OpenExternalOptions): Promise<boolean>;
}
export interface IExternalOpener {
    openExternal(href: string, ctx: {
        sourceUri: URI;
        preferredOpenerId?: string;
    }, token: CancellationToken): Promise<boolean>;
    dispose?(): void;
}
export interface IValidator {
    shouldOpen(resource: URI | string, openOptions?: OpenOptions): Promise<boolean>;
}
export interface IExternalUriResolver {
    resolveExternalUri(resource: URI, options?: OpenOptions): Promise<{
        resolved: URI;
        dispose(): void;
    } | undefined>;
}
export interface IOpenerService {
    readonly _serviceBrand: undefined;
    registerOpener(opener: IOpener): IDisposable;
    registerValidator(validator: IValidator): IDisposable;
    registerExternalUriResolver(resolver: IExternalUriResolver): IDisposable;
    setDefaultExternalOpener(opener: IExternalOpener): void;
    registerExternalOpener(opener: IExternalOpener): IDisposable;
    open(resource: URI | string, options?: OpenInternalOptions | OpenExternalOptions): Promise<boolean>;
    resolveExternalUri(resource: URI, options?: ResolveExternalUriOptions): Promise<IResolvedExternalUri>;
}
export declare function withSelection(uri: URI, selection: ITextEditorSelection): URI;
export declare function extractSelection(uri: URI): {
    selection: ITextEditorSelection | undefined;
    uri: URI;
};
