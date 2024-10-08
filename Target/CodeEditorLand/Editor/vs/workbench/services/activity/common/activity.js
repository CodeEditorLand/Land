/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Color } from '../../../../base/common/color.js';
import { registerColor } from '../../../../platform/theme/common/colorUtils.js';
import { localize } from '../../../../nls.js';
import { Codicon } from '../../../../base/common/codicons.js';
export const IActivityService = createDecorator('activityService');
class BaseBadge {
    constructor(descriptorFn, stylesFn) {
        this.descriptorFn = descriptorFn;
        this.stylesFn = stylesFn;
    }
    getDescription() {
        return this.descriptorFn(null);
    }
    getColors(theme) {
        return this.stylesFn?.(theme);
    }
}
export class NumberBadge extends BaseBadge {
    constructor(number, descriptorFn) {
        super(descriptorFn, undefined);
        this.number = number;
        this.number = number;
    }
    getDescription() {
        return this.descriptorFn(this.number);
    }
}
export class IconBadge extends BaseBadge {
    constructor(icon, descriptorFn, stylesFn) {
        super(descriptorFn, stylesFn);
        this.icon = icon;
    }
}
export class ProgressBadge extends BaseBadge {
    constructor(descriptorFn) {
        super(descriptorFn, undefined);
    }
}
export class WarningBadge extends IconBadge {
    constructor(descriptorFn) {
        super(Codicon.warning, descriptorFn, (theme) => ({
            badgeBackground: theme.getColor(activityWarningBadgeBackground),
            badgeForeground: theme.getColor(activityWarningBadgeForeground),
            badgeBorder: undefined,
        }));
    }
}
export class ErrorBadge extends IconBadge {
    constructor(descriptorFn) {
        super(Codicon.error, descriptorFn, (theme) => ({
            badgeBackground: theme.getColor(activityErrorBadgeBackground),
            badgeForeground: theme.getColor(activityErrorBadgeForeground),
            badgeBorder: undefined,
        }));
    }
}
const activityWarningBadgeForeground = registerColor('activityWarningBadge.foreground', { dark: Color.black.lighten(0.2), light: Color.white, hcDark: null, hcLight: Color.black.lighten(0.2) }, localize('activityWarningBadge.foreground', 'Foreground color of the warning activity badge'));
const activityWarningBadgeBackground = registerColor('activityWarningBadge.background', { dark: '#CCA700', light: '#BF8803', hcDark: null, hcLight: '#CCA700' }, localize('activityWarningBadge.background', 'Background color of the warning activity badge'));
const activityErrorBadgeForeground = registerColor('activityErrorBadge.foreground', { dark: Color.black.lighten(0.2), light: Color.white, hcDark: null, hcLight: Color.black.lighten(0.2) }, localize('activityErrorBadge.foreground', 'Foreground color of the error activity badge'));
const activityErrorBadgeBackground = registerColor('activityErrorBadge.background', { dark: '#F14C4C', light: '#E51400', hcDark: null, hcLight: '#F14C4C' }, localize('activityErrorBadge.background', 'Background color of the error activity badge'));
