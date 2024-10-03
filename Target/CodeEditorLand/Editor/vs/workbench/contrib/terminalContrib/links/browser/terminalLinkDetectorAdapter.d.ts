import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ITerminalLinkDetector, ITerminalSimpleLink } from './links.js';
import { TerminalLink } from './terminalLink.js';
import type { ILink, ILinkProvider, IViewportRange } from '@xterm/xterm';
export interface IActivateLinkEvent {
    link: ITerminalSimpleLink;
    event?: MouseEvent;
}
export interface IShowHoverEvent {
    link: TerminalLink;
    viewportRange: IViewportRange;
    modifierDownCallback?: () => void;
    modifierUpCallback?: () => void;
}
export declare class TerminalLinkDetectorAdapter extends Disposable implements ILinkProvider {
    private readonly _detector;
    private readonly _instantiationService;
    private _activeLinks;
    private readonly _onDidActivateLink;
    readonly onDidActivateLink: import("../../../../workbench.web.main.internal.js").Event<IActivateLinkEvent>;
    private readonly _onDidShowHover;
    readonly onDidShowHover: import("../../../../workbench.web.main.internal.js").Event<IShowHoverEvent>;
    constructor(_detector: ITerminalLinkDetector, _instantiationService: IInstantiationService);
    private _activeProvideLinkRequests;
    provideLinks(bufferLineNumber: number, callback: (links: ILink[] | undefined) => void): Promise<void>;
    private _provideLinks;
    private _createTerminalLink;
    private _getLabel;
}
