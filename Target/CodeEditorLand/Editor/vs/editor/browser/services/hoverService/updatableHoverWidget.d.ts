import type { IManagedHoverContent, IManagedHoverOptions } from '../../../../base/browser/ui/hover/hover.js';
import type { IHoverDelegate, IHoverDelegateTarget } from '../../../../base/browser/ui/hover/hoverDelegate.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
export declare class ManagedHoverWidget implements IDisposable {
    private hoverDelegate;
    private target;
    private fadeInAnimation;
    private _hoverWidget;
    private _cancellationTokenSource;
    constructor(hoverDelegate: IHoverDelegate, target: IHoverDelegateTarget | HTMLElement, fadeInAnimation: boolean);
    update(content: IManagedHoverContent, focus?: boolean, options?: IManagedHoverOptions): Promise<void>;
    private show;
    private hasContent;
    get isDisposed(): boolean | undefined;
    dispose(): void;
}
