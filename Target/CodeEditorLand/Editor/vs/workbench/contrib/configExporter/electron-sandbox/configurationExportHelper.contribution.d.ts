import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
export declare class ExtensionPoints implements IWorkbenchContribution {
    constructor(instantiationService: IInstantiationService, environmentService: INativeWorkbenchEnvironmentService);
}
