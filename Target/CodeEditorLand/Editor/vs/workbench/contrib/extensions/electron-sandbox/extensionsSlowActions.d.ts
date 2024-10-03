import { Action } from '../../../../base/common/actions.js';
import { IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
import { IExtensionHostProfile } from '../../../services/extensions/common/extensions.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare class SlowExtensionAction extends Action {
    readonly extension: IExtensionDescription;
    readonly profile: IExtensionHostProfile;
    private readonly _instantiationService;
    constructor(extension: IExtensionDescription, profile: IExtensionHostProfile, _instantiationService: IInstantiationService);
    run(): Promise<void>;
}
export declare function createSlowExtensionAction(accessor: ServicesAccessor, extension: IExtensionDescription, profile: IExtensionHostProfile): Promise<Action | undefined>;
