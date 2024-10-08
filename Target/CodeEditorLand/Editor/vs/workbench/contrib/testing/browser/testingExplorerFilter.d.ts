import { BaseActionViewItem, IBaseActionViewItemOptions } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IAction } from '../../../../base/common/actions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITestExplorerFilterState } from '../common/testExplorerFilterState.js';
import { ITestService } from '../common/testService.js';
export declare class TestingExplorerFilter extends BaseActionViewItem {
    private readonly state;
    private readonly instantiationService;
    private readonly testService;
    private input;
    private wrapper;
    private readonly focusEmitter;
    readonly onDidFocus: import("../../../workbench.web.main.internal.js").Event<void>;
    private readonly history;
    private readonly filtersAction;
    constructor(action: IAction, options: IBaseActionViewItemOptions, state: ITestExplorerFilterState, instantiationService: IInstantiationService, testService: ITestService);
    /**
     * @override
     */
    render(container: HTMLElement): void;
    layout(width: number): void;
    /**
     * Focuses the filter input.
     */
    focus(): void;
    /**
     * Persists changes to the input history.
     */
    saveState(): void;
    /**
     * @override
     */
    dispose(): void;
    /**
     * Updates the 'checked' state of the filter submenu.
     */
    private updateFilterActiveState;
}
