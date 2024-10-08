import { CancellationToken } from '../../../base/common/cancellation.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IEditorOptions, ITextEditorSelection } from '../../editor/common/editor.js';
export declare const IOpenerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IOpenerService>;
export type OpenInternalOptions = {
    /**
     * Signals that the intent is to open an editor to the side
     * of the currently active editor.
     */
    readonly openToSide?: boolean;
    /**
     * Extra editor options to apply in case an editor is used to open.
     */
    readonly editorOptions?: IEditorOptions;
    /**
     * Signals that the editor to open was triggered through a user
     * action, such as keyboard or mouse usage.
     */
    readonly fromUserGesture?: boolean;
    /**
     * Allow command links to be handled.
     *
     * If this is an array, then only the commands included in the array can be run.
     */
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
    /**
     * Register a participant that can handle the open() call.
     */
    registerOpener(opener: IOpener): IDisposable;
    /**
     * Register a participant that can validate if the URI resource be opened.
     * Validators are run before openers.
     */
    registerValidator(validator: IValidator): IDisposable;
    /**
     * Register a participant that can resolve an external URI resource to be opened.
     */
    registerExternalUriResolver(resolver: IExternalUriResolver): IDisposable;
    /**
     * Sets the handler for opening externally. If not provided,
     * a default handler will be used.
     */
    setDefaultExternalOpener(opener: IExternalOpener): void;
    /**
     * Registers a new opener external resources openers.
     */
    registerExternalOpener(opener: IExternalOpener): IDisposable;
    /**
     * Opens a resource, like a webaddress, a document uri, or executes command.
     *
     * @param resource A resource
     * @return A promise that resolves when the opening is done.
     */
    open(resource: URI | string, options?: OpenInternalOptions | OpenExternalOptions): Promise<boolean>;
    /**
     * Resolve a resource to its external form.
     * @throws whenever resolvers couldn't resolve this resource externally.
     */
    resolveExternalUri(resource: URI, options?: ResolveExternalUriOptions): Promise<IResolvedExternalUri>;
}
/**
 * Encodes selection into the `URI`.
 *
 * IMPORTANT: you MUST use `extractSelection` to separate the selection
 * again from the original `URI` before passing the `URI` into any
 * component that is not aware of selections.
 */
export declare function withSelection(uri: URI, selection: ITextEditorSelection): URI;
/**
 * file:///some/file.js#73
 * file:///some/file.js#L73
 * file:///some/file.js#73,84
 * file:///some/file.js#L73,84
 * file:///some/file.js#73-83
 * file:///some/file.js#L73-L83
 * file:///some/file.js#73,84-83,52
 * file:///some/file.js#L73,84-L83,52
 */
export declare function extractSelection(uri: URI): {
    selection: ITextEditorSelection | undefined;
    uri: URI;
};
