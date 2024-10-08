import { ITerminalLinkDetector, ITerminalSimpleLink, OmitFirstArg } from './links.js';
import { ITerminalExternalLinkProvider } from '../../../terminal/browser/terminal.js';
import type { IBufferLine, Terminal } from '@xterm/xterm';
export declare class TerminalExternalLinkDetector implements ITerminalLinkDetector {
    readonly id: string;
    readonly xterm: Terminal;
    private readonly _provideLinks;
    readonly maxLinkLength = 2000;
    constructor(id: string, xterm: Terminal, _provideLinks: OmitFirstArg<ITerminalExternalLinkProvider['provideLinks']>);
    detect(lines: IBufferLine[], startLine: number, endLine: number): Promise<ITerminalSimpleLink[]>;
}
