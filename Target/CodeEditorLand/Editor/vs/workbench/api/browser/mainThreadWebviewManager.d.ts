import { Disposable } from '../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
export declare class MainThreadWebviewManager extends Disposable {
    constructor(context: IExtHostContext, instantiationService: IInstantiationService);
}
