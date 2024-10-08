import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
/**
 * Use this if you don't want the onDidChangeSessions event to fire in the extension host
 */
export const INTERNAL_AUTH_PROVIDER_PREFIX = '__';
export const IAuthenticationService = createDecorator('IAuthenticationService');
// TODO: Move this into MainThreadAuthentication
export const IAuthenticationExtensionsService = createDecorator('IAuthenticationExtensionsService');
