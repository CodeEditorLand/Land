import { Event } from '../../../base/common/event.js';
import { RawContextKey } from '../../contextkey/common/contextkey.js';
export declare const IAccessibilityService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IAccessibilityService>;
export interface IAccessibilityService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeScreenReaderOptimized: Event<void>;
    readonly onDidChangeReducedMotion: Event<void>;
    alwaysUnderlineAccessKeys(): Promise<boolean>;
    isScreenReaderOptimized(): boolean;
    isMotionReduced(): boolean;
    getAccessibilitySupport(): AccessibilitySupport;
    setAccessibilitySupport(accessibilitySupport: AccessibilitySupport): void;
    alert(message: string): void;
    status(message: string): void;
}
export declare const enum AccessibilitySupport {
    /**
     * This should be the browser case where it is not known if a screen reader is attached or no.
     */
    Unknown = 0,
    Disabled = 1,
    Enabled = 2
}
export declare const CONTEXT_ACCESSIBILITY_MODE_ENABLED: RawContextKey<boolean>;
export interface IAccessibilityInformation {
    label: string;
    role?: string;
}
export declare function isAccessibilityInformation(obj: any): obj is IAccessibilityInformation;
export declare const ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX = "ACCESSIBLE_VIEW_SHOWN_";
