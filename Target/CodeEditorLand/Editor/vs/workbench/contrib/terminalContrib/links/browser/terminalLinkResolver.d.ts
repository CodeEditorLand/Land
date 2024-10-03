import { ITerminalLinkResolver, ResolvedLink } from './links.js';
import { URI } from '../../../../../base/common/uri.js';
import { ITerminalProcessManager } from '../../../terminal/common/terminal.js';
import { OperatingSystem } from '../../../../../base/common/platform.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { ITerminalBackend } from '../../../../../platform/terminal/common/terminal.js';
export declare class TerminalLinkResolver implements ITerminalLinkResolver {
    private readonly _fileService;
    private readonly _resolvedLinkCaches;
    constructor(_fileService: IFileService);
    resolveLink(processManager: Pick<ITerminalProcessManager, 'initialCwd' | 'os' | 'remoteAuthority' | 'userHome'> & {
        backend?: Pick<ITerminalBackend, 'getWslPath'>;
    }, link: string, uri?: URI): Promise<ResolvedLink>;
    protected _preprocessPath(link: string, initialCwd: string, os: OperatingSystem | undefined, userHome: string | undefined): string | null;
    private _getOsPath;
}
