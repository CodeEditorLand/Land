import { createDecorator, refineServiceDecorator } from '../../instantiation/common/instantiation.js';
export const IEnvironmentService = createDecorator('environmentService');
export const INativeEnvironmentService = refineServiceDecorator(IEnvironmentService);
