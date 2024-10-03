import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { SnippetsAction } from './abstractSnippetsActions.js';
export declare class ConfigureSnippetsAction extends SnippetsAction {
    constructor();
    run(accessor: ServicesAccessor): Promise<any>;
}
