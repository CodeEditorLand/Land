var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Emitter } from '../../../../base/common/event.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { TimelinePaneId } from './timeline.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export const TimelineHasProviderContext = new RawContextKey('timelineHasProvider', false);
let TimelineService = class TimelineService {
    constructor(logService, viewsService, configurationService, contextKeyService) {
        this.logService = logService;
        this.viewsService = viewsService;
        this.configurationService = configurationService;
        this.contextKeyService = contextKeyService;
        this._onDidChangeProviders = new Emitter();
        this.onDidChangeProviders = this._onDidChangeProviders.event;
        this._onDidChangeTimeline = new Emitter();
        this.onDidChangeTimeline = this._onDidChangeTimeline.event;
        this._onDidChangeUri = new Emitter();
        this.onDidChangeUri = this._onDidChangeUri.event;
        this.providers = new Map();
        this.providerSubscriptions = new Map();
        this.hasProviderContext = TimelineHasProviderContext.bindTo(this.contextKeyService);
        this.updateHasProviderContext();
    }
    getSources() {
        return [...this.providers.values()].map(p => ({ id: p.id, label: p.label }));
    }
    getTimeline(id, uri, options, tokenSource) {
        this.logService.trace(`TimelineService#getTimeline(${id}): uri=${uri.toString()}`);
        const provider = this.providers.get(id);
        if (provider === undefined) {
            return undefined;
        }
        if (typeof provider.scheme === 'string') {
            if (provider.scheme !== '*' && provider.scheme !== uri.scheme) {
                return undefined;
            }
        }
        else if (!provider.scheme.includes(uri.scheme)) {
            return undefined;
        }
        return {
            result: provider.provideTimeline(uri, options, tokenSource.token)
                .then(result => {
                if (result === undefined) {
                    return undefined;
                }
                result.items = result.items.map(item => ({ ...item, source: provider.id }));
                result.items.sort((a, b) => (b.timestamp - a.timestamp) || b.source.localeCompare(a.source, undefined, { numeric: true, sensitivity: 'base' }));
                return result;
            }),
            options: options,
            source: provider.id,
            tokenSource: tokenSource,
            uri: uri
        };
    }
    registerTimelineProvider(provider) {
        this.logService.trace(`TimelineService#registerTimelineProvider: id=${provider.id}`);
        const id = provider.id;
        const existing = this.providers.get(id);
        if (existing) {
            try {
                existing?.dispose();
            }
            catch { }
        }
        this.providers.set(id, provider);
        this.updateHasProviderContext();
        if (provider.onDidChange) {
            this.providerSubscriptions.set(id, provider.onDidChange(e => this._onDidChangeTimeline.fire(e)));
        }
        this._onDidChangeProviders.fire({ added: [id] });
        return {
            dispose: () => {
                this.providers.delete(id);
                this._onDidChangeProviders.fire({ removed: [id] });
            }
        };
    }
    unregisterTimelineProvider(id) {
        this.logService.trace(`TimelineService#unregisterTimelineProvider: id=${id}`);
        if (!this.providers.has(id)) {
            return;
        }
        this.providers.delete(id);
        this.providerSubscriptions.delete(id);
        this.updateHasProviderContext();
        this._onDidChangeProviders.fire({ removed: [id] });
    }
    setUri(uri) {
        this.viewsService.openView(TimelinePaneId, true);
        this._onDidChangeUri.fire(uri);
    }
    updateHasProviderContext() {
        this.hasProviderContext.set(this.providers.size !== 0);
    }
};
TimelineService = __decorate([
    __param(0, ILogService),
    __param(1, IViewsService),
    __param(2, IConfigurationService),
    __param(3, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], TimelineService);
export { TimelineService };
