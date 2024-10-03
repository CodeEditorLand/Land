import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { ITerminalCommand } from '../../../../../platform/terminal/common/capabilities/capabilities.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
export declare const enum DecorationSelector {
    CommandDecoration = "terminal-command-decoration",
    Hide = "hide",
    ErrorColor = "error",
    DefaultColor = "default-color",
    Default = "default",
    Codicon = "codicon",
    XtermDecoration = "xterm-decoration",
    OverviewRuler = ".xterm-decoration-overview-ruler"
}
export declare class TerminalDecorationHoverManager extends Disposable {
    private readonly _hoverService;
    private _hoverDelayer;
    private _contextMenuVisible;
    constructor(_hoverService: IHoverService, configurationService: IConfigurationService, contextMenuService: IContextMenuService);
    hideHover(): void;
    createHover(element: HTMLElement, command: ITerminalCommand | undefined, hoverMessage?: string): IDisposable;
}
export declare function updateLayout(configurationService: IConfigurationService, element?: HTMLElement): void;
