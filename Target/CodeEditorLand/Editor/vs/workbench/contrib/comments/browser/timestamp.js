import * as dom from '../../../../base/browser/dom.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { fromNow } from '../../../../base/common/date.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { language } from '../../../../base/common/platform.js';
import { COMMENTS_SECTION } from '../common/commentsConfiguration.js';
export class TimestampWidget extends Disposable {
    constructor(configurationService, hoverService, container, timeStamp) {
        super();
        this.configurationService = configurationService;
        this._date = dom.append(container, dom.$('span.timestamp'));
        this._date.style.display = 'none';
        this._useRelativeTime = this.useRelativeTimeSetting;
        this.hover = this._register(hoverService.setupManagedHover(getDefaultHoverDelegate('mouse'), this._date, ''));
        this.setTimestamp(timeStamp);
    }
    get useRelativeTimeSetting() {
        return this.configurationService.getValue(COMMENTS_SECTION).useRelativeTime;
    }
    async setTimestamp(timestamp) {
        if ((timestamp !== this._timestamp) || (this.useRelativeTimeSetting !== this._useRelativeTime)) {
            this.updateDate(timestamp);
        }
        this._timestamp = timestamp;
        this._useRelativeTime = this.useRelativeTimeSetting;
    }
    updateDate(timestamp) {
        if (!timestamp) {
            this._date.textContent = '';
            this._date.style.display = 'none';
        }
        else if ((timestamp !== this._timestamp)
            || (this.useRelativeTimeSetting !== this._useRelativeTime)) {
            this._date.style.display = '';
            let textContent;
            let tooltip;
            if (this.useRelativeTimeSetting) {
                textContent = this.getRelative(timestamp);
                tooltip = this.getDateString(timestamp);
            }
            else {
                textContent = this.getDateString(timestamp);
            }
            this._date.textContent = textContent;
            this.hover.update(tooltip ?? '');
        }
    }
    getRelative(date) {
        return fromNow(date, true, true);
    }
    getDateString(date) {
        return date.toLocaleString(language);
    }
}
