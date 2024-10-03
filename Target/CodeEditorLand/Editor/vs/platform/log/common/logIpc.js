import { URI } from '../../../base/common/uri.js';
import { Event } from '../../../base/common/event.js';
import { AbstractLoggerService, AbstractMessageLogger, AdapterLogger, isLogLevel } from './log.js';
import { Disposable } from '../../../base/common/lifecycle.js';
export class LoggerChannelClient extends AbstractLoggerService {
    constructor(windowId, logLevel, logsHome, loggers, channel) {
        super(logLevel, logsHome, loggers);
        this.windowId = windowId;
        this.channel = channel;
        this._register(channel.listen('onDidChangeLogLevel', windowId)(arg => {
            if (isLogLevel(arg)) {
                super.setLogLevel(arg);
            }
            else {
                super.setLogLevel(URI.revive(arg[0]), arg[1]);
            }
        }));
        this._register(channel.listen('onDidChangeVisibility', windowId)(([resource, visibility]) => super.setVisibility(URI.revive(resource), visibility)));
        this._register(channel.listen('onDidChangeLoggers', windowId)(({ added, removed }) => {
            for (const loggerResource of added) {
                super.registerLogger({ ...loggerResource, resource: URI.revive(loggerResource.resource) });
            }
            for (const loggerResource of removed) {
                super.deregisterLogger(loggerResource.resource);
            }
        }));
    }
    createConsoleMainLogger() {
        return new AdapterLogger({
            log: (level, args) => {
                this.channel.call('consoleLog', [level, args]);
            }
        });
    }
    registerLogger(logger) {
        super.registerLogger(logger);
        this.channel.call('registerLogger', [logger, this.windowId]);
    }
    deregisterLogger(resource) {
        super.deregisterLogger(resource);
        this.channel.call('deregisterLogger', [resource, this.windowId]);
    }
    setLogLevel(arg1, arg2) {
        super.setLogLevel(arg1, arg2);
        this.channel.call('setLogLevel', [arg1, arg2]);
    }
    setVisibility(resourceOrId, visibility) {
        super.setVisibility(resourceOrId, visibility);
        this.channel.call('setVisibility', [this.toResource(resourceOrId), visibility]);
    }
    doCreateLogger(file, logLevel, options) {
        return new Logger(this.channel, file, logLevel, options, this.windowId);
    }
    static setLogLevel(channel, arg1, arg2) {
        return channel.call('setLogLevel', [arg1, arg2]);
    }
}
class Logger extends AbstractMessageLogger {
    constructor(channel, file, logLevel, loggerOptions, windowId) {
        super(loggerOptions?.logLevel === 'always');
        this.channel = channel;
        this.file = file;
        this.isLoggerCreated = false;
        this.buffer = [];
        this.setLevel(logLevel);
        this.channel.call('createLogger', [file, loggerOptions, windowId])
            .then(() => {
            this.doLog(this.buffer);
            this.isLoggerCreated = true;
        });
    }
    log(level, message) {
        const messages = [[level, message]];
        if (this.isLoggerCreated) {
            this.doLog(messages);
        }
        else {
            this.buffer.push(...messages);
        }
    }
    doLog(messages) {
        this.channel.call('log', [this.file, messages]);
    }
}
export class LoggerChannel {
    constructor(loggerService, getUriTransformer) {
        this.loggerService = loggerService;
        this.getUriTransformer = getUriTransformer;
    }
    listen(context, event) {
        const uriTransformer = this.getUriTransformer(context);
        switch (event) {
            case 'onDidChangeLoggers': return Event.map(this.loggerService.onDidChangeLoggers, (e) => ({
                added: [...e.added].map(logger => this.transformLogger(logger, uriTransformer)),
                removed: [...e.removed].map(logger => this.transformLogger(logger, uriTransformer)),
            }));
            case 'onDidChangeVisibility': return Event.map(this.loggerService.onDidChangeVisibility, e => [uriTransformer.transformOutgoingURI(e[0]), e[1]]);
            case 'onDidChangeLogLevel': return Event.map(this.loggerService.onDidChangeLogLevel, e => isLogLevel(e) ? e : [uriTransformer.transformOutgoingURI(e[0]), e[1]]);
        }
        throw new Error(`Event not found: ${event}`);
    }
    async call(context, command, arg) {
        const uriTransformer = this.getUriTransformer(context);
        switch (command) {
            case 'setLogLevel': return isLogLevel(arg[0]) ? this.loggerService.setLogLevel(arg[0]) : this.loggerService.setLogLevel(URI.revive(uriTransformer.transformIncoming(arg[0][0])), arg[0][1]);
            case 'getRegisteredLoggers': return Promise.resolve([...this.loggerService.getRegisteredLoggers()].map(logger => this.transformLogger(logger, uriTransformer)));
        }
        throw new Error(`Call not found: ${command}`);
    }
    transformLogger(logger, transformer) {
        return {
            ...logger,
            resource: transformer.transformOutgoingURI(logger.resource)
        };
    }
}
export class RemoteLoggerChannelClient extends Disposable {
    constructor(loggerService, channel) {
        super();
        channel.call('setLogLevel', [loggerService.getLogLevel()]);
        this._register(loggerService.onDidChangeLogLevel(arg => channel.call('setLogLevel', [arg])));
        channel.call('getRegisteredLoggers').then(loggers => {
            for (const loggerResource of loggers) {
                loggerService.registerLogger({ ...loggerResource, resource: URI.revive(loggerResource.resource) });
            }
        });
        this._register(channel.listen('onDidChangeVisibility')(([resource, visibility]) => loggerService.setVisibility(URI.revive(resource), visibility)));
        this._register(channel.listen('onDidChangeLoggers')(({ added, removed }) => {
            for (const loggerResource of added) {
                loggerService.registerLogger({ ...loggerResource, resource: URI.revive(loggerResource.resource) });
            }
            for (const loggerResource of removed) {
                loggerService.deregisterLogger(loggerResource.resource);
            }
        }));
    }
}
