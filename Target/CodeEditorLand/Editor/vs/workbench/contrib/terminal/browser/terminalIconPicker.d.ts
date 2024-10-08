import { Disposable } from '../../../../base/common/lifecycle.js';
import type { ThemeIcon } from '../../../../base/common/themables.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
export declare class TerminalIconPicker extends Disposable {
    private readonly _hoverService;
    private readonly _iconSelectBox;
    constructor(instantiationService: IInstantiationService, _hoverService: IHoverService);
    pickIcons(): Promise<ThemeIcon | undefined>;
}
