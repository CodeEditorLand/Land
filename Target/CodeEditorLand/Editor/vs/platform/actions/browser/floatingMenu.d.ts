import { Widget } from '../../../base/browser/ui/widget.js';
import { IAction } from '../../../base/common/actions.js';
import { Disposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { IMenuService, MenuId } from '../common/actions.js';
import { IContextKeyService } from '../../contextkey/common/contextkey.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
export declare class FloatingClickWidget extends Widget {
    private label;
    private readonly _onClick;
    readonly onClick: import("../../../workbench/workbench.web.main.internal.js").Event<void>;
    private _domNode;
    constructor(label: string);
    getDomNode(): HTMLElement;
    render(): void;
}
export declare abstract class AbstractFloatingClickMenu extends Disposable {
    private readonly renderEmitter;
    protected readonly onDidRender: import("../../../workbench/workbench.web.main.internal.js").Event<FloatingClickWidget>;
    private readonly menu;
    constructor(menuId: MenuId, menuService: IMenuService, contextKeyService: IContextKeyService);
    /** Should be called in implementation constructors after they initialized */
    protected render(): void;
    protected abstract createWidget(action: IAction, disposables: DisposableStore): FloatingClickWidget;
    protected getActionArg(): unknown;
    protected isVisible(): boolean;
}
export declare class FloatingClickMenu extends AbstractFloatingClickMenu {
    private readonly options;
    private readonly instantiationService;
    constructor(options: {
        /** Element the menu should be rendered into. */
        container: HTMLElement;
        /** Menu to show. If no actions are present, the button is hidden. */
        menuId: MenuId;
        /** Argument provided to the menu action */
        getActionArg: () => void;
    }, instantiationService: IInstantiationService, menuService: IMenuService, contextKeyService: IContextKeyService);
    protected createWidget(action: IAction, disposable: DisposableStore): FloatingClickWidget;
    protected getActionArg(): unknown;
}
