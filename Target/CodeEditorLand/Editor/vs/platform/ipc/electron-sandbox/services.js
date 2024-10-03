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
import { ProxyChannel } from '../../../base/parts/ipc/common/ipc.js';
import { SyncDescriptor } from '../../instantiation/common/descriptors.js';
import { registerSingleton } from '../../instantiation/common/extensions.js';
import { createDecorator, IInstantiationService } from '../../instantiation/common/instantiation.js';
import { IMainProcessService } from '../common/mainProcessService.js';
class RemoteServiceStub {
    constructor(channelName, options, remote, instantiationService) {
        const channel = remote.getChannel(channelName);
        if (isRemoteServiceWithChannelClientOptions(options)) {
            return instantiationService.createInstance(new SyncDescriptor(options.channelClientCtor, [channel]));
        }
        return ProxyChannel.toService(channel, options?.proxyOptions);
    }
}
function isRemoteServiceWithChannelClientOptions(obj) {
    const candidate = obj;
    return !!candidate?.channelClientCtor;
}
let MainProcessRemoteServiceStub = class MainProcessRemoteServiceStub extends RemoteServiceStub {
    constructor(channelName, options, ipcService, instantiationService) {
        super(channelName, options, ipcService, instantiationService);
    }
};
MainProcessRemoteServiceStub = __decorate([
    __param(2, IMainProcessService),
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [String, Object, Object, Object])
], MainProcessRemoteServiceStub);
export function registerMainProcessRemoteService(id, channelName, options) {
    registerSingleton(id, new SyncDescriptor(MainProcessRemoteServiceStub, [channelName, options], true));
}
export const ISharedProcessService = createDecorator('sharedProcessService');
let SharedProcessRemoteServiceStub = class SharedProcessRemoteServiceStub extends RemoteServiceStub {
    constructor(channelName, options, ipcService, instantiationService) {
        super(channelName, options, ipcService, instantiationService);
    }
};
SharedProcessRemoteServiceStub = __decorate([
    __param(2, ISharedProcessService),
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [String, Object, Object, Object])
], SharedProcessRemoteServiceStub);
export function registerSharedProcessRemoteService(id, channelName, options) {
    registerSingleton(id, new SyncDescriptor(SharedProcessRemoteServiceStub, [channelName, options], true));
}
