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
    readonly onDidChangeActivity: Event<string | ViewContainer>;
    showViewContainerActivity(viewContainerId: string, badge: IActivity): IDisposable;
    getViewContainerActivities(viewContainerId: string): IActivity[];
    showViewActivity(viewId: string, badge: IActivity): IDisposable;
    showAccountsActivity(activity: IActivity): IDisposable;
    showGlobalActivity(activity: IActivity): IDisposable;
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
