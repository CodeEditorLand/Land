import { Action2 } from '../../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
export declare class SignOutOfAccountAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, { providerId, accountLabel }: {
        providerId: string;
        accountLabel: string;
    }): Promise<void>;
}
