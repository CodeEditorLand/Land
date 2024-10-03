import { Disposable } from '../../../base/common/lifecycle.js';
export class ServerTelemetryChannel extends Disposable {
    constructor(telemetryService, telemetryAppender) {
        super();
        this.telemetryService = telemetryService;
        this.telemetryAppender = telemetryAppender;
    }
    async call(_, command, arg) {
        switch (command) {
            case 'updateTelemetryLevel': {
                const { telemetryLevel } = arg;
                return this.telemetryService.updateInjectedTelemetryLevel(telemetryLevel);
            }
            case 'logTelemetry': {
                const { eventName, data } = arg;
                if (this.telemetryAppender) {
                    return this.telemetryAppender.log(eventName, data);
                }
                return Promise.resolve();
            }
            case 'flushTelemetry': {
                if (this.telemetryAppender) {
                    return this.telemetryAppender.flush();
                }
                return Promise.resolve();
            }
            case 'ping': {
                return;
            }
        }
        throw new Error(`IPC Command ${command} not found`);
    }
    listen(_, event, arg) {
        throw new Error('Not supported');
    }
    dispose() {
        this.telemetryService.updateInjectedTelemetryLevel(0);
        super.dispose();
    }
}
