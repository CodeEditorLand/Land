import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export const INTERNAL_AUTH_PROVIDER_PREFIX = '__';
export const IAuthenticationService = createDecorator('IAuthenticationService');
export const IAuthenticationExtensionsService = createDecorator('IAuthenticationExtensionsService');
