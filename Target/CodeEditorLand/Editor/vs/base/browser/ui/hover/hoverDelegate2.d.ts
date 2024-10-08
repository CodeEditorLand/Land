import type { IHoverDelegate2 } from './hover.js';
/**
 * Sets the hover delegate for use **only in the `base/` layer**.
 */
export declare function setBaseLayerHoverDelegate(hoverDelegate: IHoverDelegate2): void;
/**
 * Gets the hover delegate for use **only in the `base/` layer**.
 *
 * Since the hover service depends on various platform services, this delegate essentially bypasses
 * the standard dependency injection mechanism by injecting a global hover service at start up. The
 * only reason this should be used is if `IHoverService` is not available.
 */
export declare function getBaseLayerHoverDelegate(): IHoverDelegate2;
