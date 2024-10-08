import { Action2 } from '../../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
export declare class ManageTrustedExtensionsForAccountAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, options?: {
        providerId: string;
        accountLabel: string;
    }): Promise<void>;
}
