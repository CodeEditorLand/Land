import { Disposable } from '../../../base/common/lifecycle.js';
import { IHoverDelegate, IHoverDelegateOptions } from '../../../base/browser/ui/hover/hoverDelegate.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import type { IHoverDelegate2, IHoverOptions, IHoverWidget } from '../../../base/browser/ui/hover/hover.js';
export declare const IHoverService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IHoverService>;
export interface IHoverService extends IHoverDelegate2 {
    readonly _serviceBrand: undefined;
}
export declare class WorkbenchHoverDelegate extends Disposable implements IHoverDelegate {
    readonly placement: 'mouse' | 'element';
    private readonly instantHover;
    private overrideOptions;
    private readonly configurationService;
    private readonly hoverService;
    private lastHoverHideTime;
    private timeLimit;
    private _delay;
    get delay(): number;
    private readonly hoverDisposables;
    constructor(placement: 'mouse' | 'element', instantHover: boolean, overrideOptions: (Partial<IHoverOptions> | ((options: IHoverDelegateOptions, focus?: boolean) => Partial<IHoverOptions>)) | undefined, configurationService: IConfigurationService, hoverService: IHoverService);
    showHover(options: IHoverDelegateOptions, focus?: boolean): IHoverWidget | undefined;
    private isInstantlyHovering;
    setInstantHoverTimeLimit(timeLimit: number): void;
    onDidHideHover(): void;
}
export declare const nativeHoverDelegate: IHoverDelegate;
