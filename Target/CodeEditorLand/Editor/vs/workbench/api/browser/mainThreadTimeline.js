/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { Emitter } from '../../../base/common/event.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { MainContext, ExtHostContext } from '../common/extHost.protocol.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ITimelineService } from '../../contrib/timeline/common/timeline.js';
import { revive } from '../../../base/common/marshalling.js';
let MainThreadTimeline = class MainThreadTimeline {
    constructor(context, logService, _timelineService) {
        this.logService = logService;
        this._timelineService = _timelineService;
        this._providerEmitters = new Map();
        this._proxy = context.getProxy(ExtHostContext.ExtHostTimeline);
    }
    $registerTimelineProvider(provider) {
        this.logService.trace(`MainThreadTimeline#registerTimelineProvider: id=${provider.id}`);
        const proxy = this._proxy;
        const emitters = this._providerEmitters;
        let onDidChange = emitters.get(provider.id);
        if (onDidChange === undefined) {
            onDidChange = new Emitter();
            emitters.set(provider.id, onDidChange);
        }
        this._timelineService.registerTimelineProvider({
            ...provider,
            onDidChange: onDidChange.event,
            async provideTimeline(uri, options, token) {
                return revive(await proxy.$getTimeline(provider.id, uri, options, token));
            },
            dispose() {
                emitters.delete(provider.id);
                onDidChange?.dispose();
            }
        });
    }
    $unregisterTimelineProvider(id) {
        this.logService.trace(`MainThreadTimeline#unregisterTimelineProvider: id=${id}`);
        this._timelineService.unregisterTimelineProvider(id);
    }
    $emitTimelineChangeEvent(e) {
        this.logService.trace(`MainThreadTimeline#emitChangeEvent: id=${e.id}, uri=${e.uri?.toString(true)}`);
        const emitter = this._providerEmitters.get(e.id);
        emitter?.fire(e);
    }
    dispose() {
        // noop
    }
};
MainThreadTimeline = __decorate([
    extHostNamedCustomer(MainContext.MainThreadTimeline),
    __param(1, ILogService),
    __param(2, ITimelineService),
    __metadata("design:paramtypes", [Object, Object, Object])
], MainThreadTimeline);
export { MainThreadTimeline };
