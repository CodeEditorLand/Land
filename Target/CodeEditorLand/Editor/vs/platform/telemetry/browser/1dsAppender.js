import { AbstractOneDataSystemAppender } from '../common/1dsAppender.js';
export class OneDataSystemWebAppender extends AbstractOneDataSystemAppender {
    constructor(isInternalTelemetry, eventPrefix, defaultData, iKeyOrClientFactory) {
        super(isInternalTelemetry, eventPrefix, defaultData, iKeyOrClientFactory);
        fetch(this.endPointHealthUrl, { method: 'GET' }).catch(err => {
            this._aiCoreOrKey = undefined;
        });
    }
}
