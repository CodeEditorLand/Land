import { refineServiceDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
export const IWorkbenchEnvironmentService = refineServiceDecorator(IEnvironmentService);
