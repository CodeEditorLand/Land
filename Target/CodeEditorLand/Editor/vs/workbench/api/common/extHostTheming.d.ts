import { ColorTheme } from './extHostTypes.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { ExtHostThemingShape } from './extHost.protocol.js';
import { Event } from '../../../base/common/event.js';
export declare class ExtHostTheming implements ExtHostThemingShape {
    readonly _serviceBrand: undefined;
    private _actual;
    private _onDidChangeActiveColorTheme;
    constructor(_extHostRpc: IExtHostRpcService);
    get activeColorTheme(): ColorTheme;
    $onColorThemeChange(type: string): void;
    get onDidChangeActiveColorTheme(): Event<ColorTheme>;
}
