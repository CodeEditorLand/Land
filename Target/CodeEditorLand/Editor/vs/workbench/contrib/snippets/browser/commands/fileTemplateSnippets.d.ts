import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { SnippetsAction } from './abstractSnippetsActions.js';
export declare class ApplyFileSnippetAction extends SnippetsAction {
    static readonly Id = "workbench.action.populateFileFromSnippet";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
    private _pick;
}
