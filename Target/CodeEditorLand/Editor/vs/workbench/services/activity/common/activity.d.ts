import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { Event } from '../../../../base/common/event.js';
import { ViewContainer } from '../../../common/views.js';
import { IColorTheme } from '../../../../platform/theme/common/themeService.js';
import { Color } from '../../../../base/common/color.js';
export interface IActivity {
    readonly badge: IBadge;
    readonly priority?: number;
}
export declare const IActivityService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IActivityService>;
export interface IActivityService {
    readonly _serviceBrand: undefined;
    /**
     * Emitted when activity changes for a view container or when the activity of the global actions change.
     */
    readonly onDidChangeActivity: Event<string | ViewContainer>;
    /**
     * Show activity for the given view container
     */
    showViewContainerActivity(viewContainerId: string, badge: IActivity): IDisposable;
    /**
     * Returns the activity for the given view container
     */
    getViewContainerActivities(viewContainerId: string): IActivity[];
    /**
     * Show activity for the given view
     */
    showViewActivity(viewId: string, badge: IActivity): IDisposable;
    /**
     * Show accounts activity
     */
    showAccountsActivity(activity: IActivity): IDisposable;
    /**
     * Show global activity
     */
    showGlobalActivity(activity: IActivity): IDisposable;
    /**
     * Return the activity for the given action
     */
    getActivity(id: string): IActivity[];
}
export interface IBadge {
    getDescription(): string;
    getColors(theme: IColorTheme): IBadgeStyles | undefined;
}
export interface IBadgeStyles {
    readonly badgeBackground: Color | undefined;
    readonly badgeForeground: Color | undefined;
    readonly badgeBorder: Color | undefined;
}
declare class BaseBadge implements IBadge {
    protected readonly descriptorFn: (arg: any) => string;
    private readonly stylesFn;
    constructor(descriptorFn: (arg: any) => string, stylesFn: ((theme: IColorTheme) => IBadgeStyles | undefined) | undefined);
    getDescription(): string;
    getColors(theme: IColorTheme): IBadgeStyles | undefined;
}
export declare class NumberBadge extends BaseBadge {
    readonly number: number;
    constructor(number: number, descriptorFn: (num: number) => string);
    getDescription(): string;
}
export declare class IconBadge extends BaseBadge {
    readonly icon: ThemeIcon;
    constructor(icon: ThemeIcon, descriptorFn: () => string, stylesFn?: (theme: IColorTheme) => IBadgeStyles | undefined);
}
export declare class ProgressBadge extends BaseBadge {
    constructor(descriptorFn: () => string);
}
export declare class WarningBadge extends IconBadge {
    constructor(descriptorFn: () => string);
}
export declare class ErrorBadge extends IconBadge {
    constructor(descriptorFn: () => string);
}
export {};
