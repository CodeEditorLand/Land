import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import type { IHoverService } from '../../../../platform/hover/browser/hover.js';
export declare class TimestampWidget extends Disposable {
    private configurationService;
    private _date;
    private _timestamp;
    private _useRelativeTime;
    private hover;
    constructor(configurationService: IConfigurationService, hoverService: IHoverService, container: HTMLElement, timeStamp?: Date);
    private get useRelativeTimeSetting();
    setTimestamp(timestamp: Date | undefined): Promise<void>;
    private updateDate;
    private getRelative;
    private getDateString;
}
