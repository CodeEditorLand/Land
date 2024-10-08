import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare class ShowSignalSoundHelp extends Action2 {
    static readonly ID = "signals.sounds.help";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ShowAccessibilityAnnouncementHelp extends Action2 {
    static readonly ID = "accessibility.announcement.help";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
