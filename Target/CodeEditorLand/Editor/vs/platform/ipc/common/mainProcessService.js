import { createDecorator } from '../../instantiation/common/instantiation.js';
export const IMainProcessService = createDecorator('mainProcessService');
export class MainProcessService {
    constructor(server, router) {
        this.server = server;
        this.router = router;
    }
    getChannel(channelName) {
        return this.server.getChannel(channelName, this.router);
    }
    registerChannel(channelName, channel) {
        this.server.registerChannel(channelName, channel);
    }
}
