import { IHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegate.js';
import { Event } from '../../../../base/common/event.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { WindowTitle } from './windowTitle.js';
export declare class CommandCenterControl {
    private readonly _disposables;
    private readonly _onDidChangeVisibility;
    readonly onDidChangeVisibility: Event<void>;
    readonly element: HTMLElement;
    constructor(windowTitle: WindowTitle, hoverDelegate: IHoverDelegate, instantiationService: IInstantiationService, quickInputService: IQuickInputService);
    private _setVisibility;
    dispose(): void;
}
