import { Event } from '../../../base/common/event.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IWorkspace, ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from '../../workspace/common/workspace.js';
export declare const ILabelService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ILabelService>;
export interface ILabelService {
    readonly _serviceBrand: undefined;
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
