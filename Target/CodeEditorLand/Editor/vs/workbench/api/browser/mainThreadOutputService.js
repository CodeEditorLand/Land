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
var MainThreadOutputService_1;
import { Registry } from '../../../platform/registry/common/platform.js';
import { Extensions, IOutputService, OUTPUT_VIEW_ID, OutputChannelUpdateMode } from '../../services/output/common/output.js';
import { MainContext, ExtHostContext } from '../common/extHost.protocol.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { URI } from '../../../base/common/uri.js';
import { Disposable, toDisposable } from '../../../base/common/lifecycle.js';
import { Event } from '../../../base/common/event.js';
import { IViewsService } from '../../services/views/common/viewsService.js';
import { isNumber } from '../../../base/common/types.js';
let MainThreadOutputService = class MainThreadOutputService extends Disposable {
    static { MainThreadOutputService_1 = this; }
    static { this._extensionIdPool = new Map(); }
    constructor(extHostContext, outputService, viewsService) {
        super();
        this._outputService = outputService;
        this._viewsService = viewsService;
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostOutputService);
        const setVisibleChannel = () => {
            const visibleChannel = this._viewsService.isViewVisible(OUTPUT_VIEW_ID) ? this._outputService.getActiveChannel() : undefined;
            this._proxy.$setVisibleChannel(visibleChannel ? visibleChannel.id : null);
        };
        this._register(Event.any(this._outputService.onActiveOutputChannel, Event.filter(this._viewsService.onDidChangeViewVisibility, ({ id }) => id === OUTPUT_VIEW_ID))(() => setVisibleChannel()));
        setVisibleChannel();
    }
    async $register(label, file, languageId, extensionId) {
        const idCounter = (MainThreadOutputService_1._extensionIdPool.get(extensionId) || 0) + 1;
        MainThreadOutputService_1._extensionIdPool.set(extensionId, idCounter);
        const id = `extension-output-${extensionId}-#${idCounter}-${label}`;
        const resource = URI.revive(file);
        Registry.as(Extensions.OutputChannels).registerChannel({ id, label, file: resource, log: false, languageId, extensionId });
        this._register(toDisposable(() => this.$dispose(id)));
        return id;
    }
    async $update(channelId, mode, till) {
        const channel = this._getChannel(channelId);
        if (channel) {
            if (mode === OutputChannelUpdateMode.Append) {
                channel.update(mode);
            }
            else if (isNumber(till)) {
                channel.update(mode, till);
            }
        }
    }
    async $reveal(channelId, preserveFocus) {
        const channel = this._getChannel(channelId);
        if (channel) {
            this._outputService.showChannel(channel.id, preserveFocus);
        }
    }
    async $close(channelId) {
        if (this._viewsService.isViewVisible(OUTPUT_VIEW_ID)) {
            const activeChannel = this._outputService.getActiveChannel();
            if (activeChannel && channelId === activeChannel.id) {
                this._viewsService.closeView(OUTPUT_VIEW_ID);
            }
        }
    }
    async $dispose(channelId) {
        const channel = this._getChannel(channelId);
        channel?.dispose();
    }
    _getChannel(channelId) {
        return this._outputService.getChannel(channelId);
    }
};
MainThreadOutputService = MainThreadOutputService_1 = __decorate([
    extHostNamedCustomer(MainContext.MainThreadOutputService),
    __param(1, IOutputService),
    __param(2, IViewsService),
    __metadata("design:paramtypes", [Object, Object, Object])
], MainThreadOutputService);
export { MainThreadOutputService };
