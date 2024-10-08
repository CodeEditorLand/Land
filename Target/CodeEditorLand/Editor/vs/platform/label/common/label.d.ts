import { Event } from '../../../base/common/event.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IWorkspace, ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from '../../workspace/common/workspace.js';
export declare const ILabelService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ILabelService>;
export interface ILabelService {
    readonly _serviceBrand: undefined;
    /**
     * Gets the human readable label for a uri.
     * If `relative` is passed returns a label relative to the workspace root that the uri belongs to.
     * If `noPrefix` is passed does not tildify the label and also does not prepand the root name for relative labels in a multi root scenario.
     * If `separator` is passed, will use that over the defined path separator of the formatter.
     */
    getUriLabel(resource: URI, options?: {
        relative?: boolean;
        noPrefix?: boolean;
        separator?: '/' | '\\';
    }): string;
    getUriBasenameLabel(resource: URI): string;
    getWorkspaceLabel(workspace: (IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | URI | IWorkspace), options?: {
        verbose: Verbosity;
    }): string;
    getHostLabel(scheme: string, authority?: string): string;
    getHostTooltip(scheme: string, authority?: string): string | undefined;
    getSeparator(scheme: string, authority?: string): '/' | '\\';
    registerFormatter(formatter: ResourceLabelFormatter): IDisposable;
    onDidChangeFormatters: Event<IFormatterChangeEvent>;
    /**
     * Registers a formatter that's cached for the machine beyond the lifecycle
     * of the current window. Disposing the formatter _will not_ remove it from
     * the cache.
     */
    registerCachedFormatter(formatter: ResourceLabelFormatter): IDisposable;
}
export declare const enum Verbosity {
    SHORT = 0,
    MEDIUM = 1,
    LONG = 2
}
export interface IFormatterChangeEvent {
    scheme: string;
}
export interface ResourceLabelFormatter {
    scheme: string;
    authority?: string;
    priority?: boolean;
    formatting: ResourceLabelFormatting;
}
export interface ResourceLabelFormatting {
    label: string;
    separator: '/' | '\\' | '';
    tildify?: boolean;
    normalizeDriveLetter?: boolean;
    workspaceSuffix?: string;
    workspaceTooltip?: string;
    authorityPrefix?: string;
    stripPathStartingSeparator?: boolean;
}
