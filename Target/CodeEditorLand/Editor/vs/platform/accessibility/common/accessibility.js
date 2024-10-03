import { RawContextKey } from '../../contextkey/common/contextkey.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
export const IAccessibilityService = createDecorator('accessibilityService');
export const CONTEXT_ACCESSIBILITY_MODE_ENABLED = new RawContextKey('accessibilityModeEnabled', false);
export function isAccessibilityInformation(obj) {
    return obj && typeof obj === 'object'
        && typeof obj.label === 'string'
        && (typeof obj.role === 'undefined' || typeof obj.role === 'string');
}
export const ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX = 'ACCESSIBLE_VIEW_SHOWN_';
