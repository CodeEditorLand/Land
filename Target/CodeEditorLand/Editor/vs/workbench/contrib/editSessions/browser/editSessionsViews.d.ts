import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ViewContainer } from '../../../common/views.js';
export declare class EditSessionsDataViews extends Disposable {
    private readonly instantiationService;
    constructor(container: ViewContainer, instantiationService: IInstantiationService);
    private registerViews;
}
