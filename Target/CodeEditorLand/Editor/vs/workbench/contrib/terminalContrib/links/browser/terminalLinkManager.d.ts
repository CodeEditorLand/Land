import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ITunnelService } from '../../../../../platform/tunnel/common/tunnel.js';
import { ITerminalLinkResolver, OmitFirstArg } from './links.js';
import { TerminalLink } from './terminalLink.js';
import { ITerminalConfigurationService, ITerminalExternalLinkProvider } from '../../../terminal/browser/terminal.js';
import { TerminalWidgetManager } from '../../../terminal/browser/widgets/widgetManager.js';
import { ITerminalCapabilityStore } from '../../../../../platform/terminal/common/capabilities/capabilities.js';
import { ITerminalProcessInfo } from '../../../terminal/common/terminal.js';
import type { ILink, Terminal } from '@xterm/xterm';
import { ITerminalLogService } from '../../../../../platform/terminal/common/terminal.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
export type XtermLinkMatcherHandler = (event: MouseEvent | undefined, link: string) => Promise<void>;
/**
 * An object responsible for managing registration of link matchers and link providers.
 */
export declare class TerminalLinkManager extends DisposableStore {
    private readonly _xterm;
    private readonly _processInfo;
    private readonly _linkResolver;
    private readonly _configurationService;
    private readonly _instantiationService;
    private readonly _logService;
    private readonly _tunnelService;
    private _widgetManager;
    private readonly _standardLinkProviders;
    private readonly _linkProvidersDisposables;
    private readonly _externalLinkProviders;
    private readonly _openers;
    externalProvideLinksCb?: OmitFirstArg<ITerminalExternalLinkProvider['provideLinks']>;
    constructor(_xterm: Terminal, _processInfo: ITerminalProcessInfo, capabilities: ITerminalCapabilityStore, _linkResolver: ITerminalLinkResolver, _configurationService: IConfigurationService, _instantiationService: IInstantiationService, notificationService: INotificationService, terminalConfigurationService: ITerminalConfigurationService, _logService: ITerminalLogService, _tunnelService: ITunnelService);
    private _setupLinkDetector;
    private _openLink;
    openRecentLink(type: 'localFile' | 'url'): Promise<ILink | undefined>;
    getLinks(): Promise<{
        viewport: IDetectedLinks;
        all: Promise<IDetectedLinks>;
    }>;
    private _getLinksForLine;
    protected _getLinksForType(y: number, type: 'word' | 'url' | 'localFile' | 'localFolder'): Promise<ILink[] | undefined>;
    private _tooltipCallback;
    private _showHover;
    setWidgetManager(widgetManager: TerminalWidgetManager): void;
    private _clearLinkProviders;
    private _registerStandardLinkProviders;
    protected _isLinkActivationModifierDown(event: MouseEvent): boolean;
    private _getLinkHoverString;
}
export interface ILineColumnInfo {
    lineNumber: number;
    columnNumber: number;
}
export interface IDetectedLinks {
    wordLinks?: ILink[];
    webLinks?: ILink[];
    fileLinks?: (ILink | TerminalLink)[];
    folderLinks?: ILink[];
}
