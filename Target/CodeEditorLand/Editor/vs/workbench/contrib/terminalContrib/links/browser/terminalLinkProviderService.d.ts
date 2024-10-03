import { ITerminalExternalLinkProvider } from '../../../terminal/browser/terminal.js';
import { ITerminalLinkProviderService } from './links.js';
import { Event } from '../../../../../base/common/event.js';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
export declare class TerminalLinkProviderService implements ITerminalLinkProviderService {
    _serviceBrand: undefined;
    private _linkProviders;
    get linkProviders(): ReadonlySet<ITerminalExternalLinkProvider>;
    private readonly _onDidAddLinkProvider;
    get onDidAddLinkProvider(): Event<ITerminalExternalLinkProvider>;
    private readonly _onDidRemoveLinkProvider;
    get onDidRemoveLinkProvider(): Event<ITerminalExternalLinkProvider>;
    registerLinkProvider(linkProvider: ITerminalExternalLinkProvider): IDisposable;
}
