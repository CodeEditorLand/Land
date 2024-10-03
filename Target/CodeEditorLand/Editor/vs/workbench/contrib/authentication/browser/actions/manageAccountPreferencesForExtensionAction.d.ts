import { Action2 } from '../../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
export declare class ManageAccountPreferencesForExtensionAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, extensionId?: string, providerId?: string): Promise<void>;
}
