import { ResourceMap } from '../../../base/common/map.js';
import { Event } from '../../../base/common/event.js';
import { refineServiceDecorator } from '../../instantiation/common/instantiation.js';
import { ILoggerService, isLogLevel } from '../common/log.js';
import { LoggerService } from '../node/loggerService.js';
export const ILoggerMainService = refineServiceDecorator(ILoggerService);
export class LoggerMainService extends LoggerService {
    constructor() {
        super(...arguments);
        this.loggerResourcesByWindow = new ResourceMap();
    }
    createLogger(idOrResource, options, windowId) {
        if (windowId !== undefined) {
            this.loggerResourcesByWindow.set(this.toResource(idOrResource), windowId);
        }
        try {
            return super.createLogger(idOrResource, options);
        }
        catch (error) {
            this.loggerResourcesByWindow.delete(this.toResource(idOrResource));
            throw error;
        }
    }
    registerLogger(resource, windowId) {
        if (windowId !== undefined) {
            this.loggerResourcesByWindow.set(resource.resource, windowId);
        }
        super.registerLogger(resource);
    }
    deregisterLogger(resource) {
        this.loggerResourcesByWindow.delete(resource);
        super.deregisterLogger(resource);
    }
    getRegisteredLoggers(windowId) {
        const resources = [];
        for (const resource of super.getRegisteredLoggers()) {
            if (windowId === this.loggerResourcesByWindow.get(resource.resource)) {
                resources.push(resource);
            }
        }
        return resources;
    }
    getOnDidChangeLogLevelEvent(windowId) {
        return Event.filter(this.onDidChangeLogLevel, arg => isLogLevel(arg) || this.isInterestedLoggerResource(arg[0], windowId));
    }
    getOnDidChangeVisibilityEvent(windowId) {
        return Event.filter(this.onDidChangeVisibility, ([resource]) => this.isInterestedLoggerResource(resource, windowId));
    }
    getOnDidChangeLoggersEvent(windowId) {
        return Event.filter(Event.map(this.onDidChangeLoggers, e => {
            const r = {
                added: [...e.added].filter(loggerResource => this.isInterestedLoggerResource(loggerResource.resource, windowId)),
                removed: [...e.removed].filter(loggerResource => this.isInterestedLoggerResource(loggerResource.resource, windowId)),
            };
            return r;
        }), e => e.added.length > 0 || e.removed.length > 0);
    }
    deregisterLoggers(windowId) {
        for (const [resource, resourceWindow] of this.loggerResourcesByWindow) {
            if (resourceWindow === windowId) {
                this.deregisterLogger(resource);
            }
        }
    }
    isInterestedLoggerResource(resource, windowId) {
        const loggerWindowId = this.loggerResourcesByWindow.get(resource);
        return loggerWindowId === undefined || loggerWindowId === windowId;
    }
    dispose() {
        super.dispose();
        this.loggerResourcesByWindow.clear();
    }
}
