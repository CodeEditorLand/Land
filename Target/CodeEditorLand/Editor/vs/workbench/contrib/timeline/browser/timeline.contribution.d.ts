import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { IViewDescriptor } from '../../../common/views.js';
import { TimelinePane } from './timelinePane.js';
import { ILocalizedString } from '../../../../platform/action/common/action.js';
export declare class TimelinePaneDescriptor implements IViewDescriptor {
    readonly id = "timeline";
    readonly name: ILocalizedString;
    readonly containerIcon: import("../../../../base/common/themables.js").ThemeIcon;
    readonly ctorDescriptor: SyncDescriptor<TimelinePane>;
    readonly order = 2;
    readonly weight = 30;
    readonly collapsed = true;
    readonly canToggleVisibility = true;
    readonly hideByDefault = false;
    readonly canMoveView = true;
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").RawContextKey<boolean>;
    focusCommand: {
        id: string;
    };
}
