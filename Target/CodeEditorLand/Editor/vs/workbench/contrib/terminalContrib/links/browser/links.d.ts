import type { IBufferLine, IBufferRange, Terminal } from '@xterm/xterm';
import { URI } from '../../../../../base/common/uri.js';
import { ITerminalProcessManager } from '../../../terminal/common/terminal.js';
import { IParsedLink } from './terminalLinkParsing.js';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { ITerminalExternalLinkProvider } from '../../../terminal/browser/terminal.js';
import { Event } from '../../../../../base/common/event.js';
import { ITerminalBackend } from '../../../../../platform/terminal/common/terminal.js';
import { ITextEditorSelection } from '../../../../../platform/editor/common/editor.js';
import type { IHoverAction } from '../../../../../base/browser/ui/hover/hover.js';
export declare const ITerminalLinkProviderService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalLinkProviderService>;
export interface ITerminalLinkProviderService {
    readonly _serviceBrand: undefined;
    readonly linkProviders: ReadonlySet<ITerminalExternalLinkProvider>;
    readonly onDidAddLinkProvider: Event<ITerminalExternalLinkProvider>;
    readonly onDidRemoveLinkProvider: Event<ITerminalExternalLinkProvider>;
    registerLinkProvider(provider: ITerminalExternalLinkProvider): IDisposable;
}
export interface ITerminalLinkResolver {
    resolveLink(processManager: Pick<ITerminalProcessManager, 'initialCwd' | 'os' | 'remoteAuthority' | 'userHome'> & {
        backend?: Pick<ITerminalBackend, 'getWslPath'>;
    }, link: string, uri?: URI): Promise<ResolvedLink>;
}
export interface ITerminalLinkDetector {
    readonly xterm: Terminal;
    readonly maxLinkLength: number;
    detect(lines: IBufferLine[], startLine: number, endLine: number): ITerminalSimpleLink[] | Promise<ITerminalSimpleLink[]>;
}
export interface ITerminalSimpleLink {
    text: string;
    parsedLink?: IParsedLink;
    readonly bufferRange: IBufferRange;
    readonly type: TerminalLinkType;
    uri?: URI;
    contextLine?: string;
    selection?: ITextEditorSelection;
    disableTrimColon?: boolean;
    label?: string;
    actions?: IHoverAction[];
    activate?(text: string): void;
}
export type TerminalLinkType = TerminalBuiltinLinkType | ITerminalExternalLinkType;
export declare const enum TerminalBuiltinLinkType {
    LocalFile = "LocalFile",
    LocalFolderOutsideWorkspace = "LocalFolderOutsideWorkspace",
    LocalFolderInWorkspace = "LocalFolderInWorkspace",
    Search = "Search",
    Url = "Url"
}
export interface ITerminalExternalLinkType {
    id: string;
}
export interface ITerminalLinkOpener {
    open(link: ITerminalSimpleLink): Promise<void>;
}
export type ResolvedLink = IResolvedValidLink | null;
export interface IResolvedValidLink {
    uri: URI;
    link: string;
    isDirectory: boolean;
}
export type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;
