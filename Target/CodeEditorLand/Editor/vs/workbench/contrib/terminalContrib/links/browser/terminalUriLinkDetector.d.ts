import { IUriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { ITerminalLinkDetector, ITerminalLinkResolver, ITerminalSimpleLink } from './links.js';
import { ITerminalProcessManager } from '../../../terminal/common/terminal.js';
import type { IBufferLine, Terminal } from '@xterm/xterm';
import { ITerminalBackend, ITerminalLogService } from '../../../../../platform/terminal/common/terminal.js';
export declare class TerminalUriLinkDetector implements ITerminalLinkDetector {
    readonly xterm: Terminal;
    private readonly _processManager;
    private readonly _linkResolver;
    private readonly _logService;
    private readonly _uriIdentityService;
    private readonly _workspaceContextService;
    static id: string;
    readonly maxLinkLength = 2048;
    constructor(xterm: Terminal, _processManager: Pick<ITerminalProcessManager, 'initialCwd' | 'os' | 'remoteAuthority' | 'userHome'> & {
        backend?: Pick<ITerminalBackend, 'getWslPath'>;
    }, _linkResolver: ITerminalLinkResolver, _logService: ITerminalLogService, _uriIdentityService: IUriIdentityService, _workspaceContextService: IWorkspaceContextService);
    detect(lines: IBufferLine[], startLine: number, endLine: number): Promise<ITerminalSimpleLink[]>;
    private _isDirectoryInsideWorkspace;
    private _excludeLineAndColSuffix;
}
