import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ITerminalConfigurationService, LinuxDistro } from './terminal.js';
import type { IXtermCore } from './xterm-private.js';
import { ITerminalConfiguration, type ITerminalFont } from '../common/terminal.js';
export declare class TerminalConfigurationService extends Disposable implements ITerminalConfigurationService {
    private readonly _configurationService;
    _serviceBrand: undefined;
    protected _fontMetrics: TerminalFontMetrics;
    protected _config: Readonly<ITerminalConfiguration>;
    get config(): Readonly<ITerminalConfiguration>;
    private readonly _onConfigChanged;
    get onConfigChanged(): Event<void>;
    constructor(_configurationService: IConfigurationService);
    setPanelContainer(panelContainer: HTMLElement): void;
    configFontIsMonospace(): boolean;
    getFont(w: Window, xtermCore?: IXtermCore, excludeDimensions?: boolean): ITerminalFont;
    private _updateConfig;
    private _normalizeFontWeight;
}
export declare class TerminalFontMetrics extends Disposable {
    private readonly _terminalConfigurationService;
    private readonly _configurationService;
    private _panelContainer;
    private _charMeasureElement;
    private _lastFontMeasurement;
    linuxDistro: LinuxDistro;
    constructor(_terminalConfigurationService: ITerminalConfigurationService, _configurationService: IConfigurationService);
    setPanelContainer(panelContainer: HTMLElement): void;
    configFontIsMonospace(): boolean;
    getFont(w: Window, xtermCore?: IXtermCore, excludeDimensions?: boolean): ITerminalFont;
    private _createCharMeasureElementIfNecessary;
    private _getBoundingRectFor;
    private _measureFont;
}
