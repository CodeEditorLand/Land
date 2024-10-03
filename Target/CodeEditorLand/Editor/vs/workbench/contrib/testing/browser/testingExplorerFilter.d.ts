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
    render(container: HTMLElement): void;
    layout(width: number): void;
    focus(): void;
    saveState(): void;
    dispose(): void;
    private updateFilterActiveState;
}
