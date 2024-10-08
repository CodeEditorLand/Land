import { Action } from '../../../../base/common/actions.js';
import { StatusbarViewModel } from './statusbarModel.js';
export declare class ToggleStatusbarEntryVisibilityAction extends Action {
    private model;
    constructor(id: string, label: string, model: StatusbarViewModel);
    run(): Promise<void>;
}
export declare class HideStatusbarEntryAction extends Action {
    private model;
    constructor(id: string, name: string, model: StatusbarViewModel);
    run(): Promise<void>;
}
