import { URI } from '../../../base/common/uri.js';
export class DownloadServiceChannel {
    constructor(service) {
        this.service = service;
    }
    listen(_, event, arg) {
        throw new Error('Invalid listen');
    }
    call(context, command, args) {
        switch (command) {
            case 'download': return this.service.download(URI.revive(args[0]), URI.revive(args[1]));
        }
        throw new Error('Invalid call');
    }
}
export class DownloadServiceChannelClient {
    constructor(channel, getUriTransformer) {
        this.channel = channel;
        this.getUriTransformer = getUriTransformer;
    }
    async download(from, to) {
        const uriTransformer = this.getUriTransformer();
        if (uriTransformer) {
            from = uriTransformer.transformOutgoingURI(from);
            to = uriTransformer.transformOutgoingURI(to);
        }
        await this.channel.call('download', [from, to]);
    }
}
