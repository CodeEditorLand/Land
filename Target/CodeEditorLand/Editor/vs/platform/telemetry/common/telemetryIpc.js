export class TelemetryAppenderChannel {
    constructor(appenders) {
        this.appenders = appenders;
    }
    listen(_, event) {
        throw new Error(`Event not found: ${event}`);
    }
    call(_, command, { eventName, data }) {
        this.appenders.forEach(a => a.log(eventName, data));
        return Promise.resolve(null);
    }
}
export class TelemetryAppenderClient {
    constructor(channel) {
        this.channel = channel;
    }
    log(eventName, data) {
        this.channel.call('log', { eventName, data })
            .then(undefined, err => `Failed to log telemetry: ${console.warn(err)}`);
        return Promise.resolve(null);
    }
    flush() {
        return Promise.resolve();
    }
}
