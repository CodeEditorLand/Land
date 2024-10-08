/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { bufferToStream, streamToBuffer } from '../../../base/common/buffer.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
export class RequestChannel {
    constructor(service) {
        this.service = service;
    }
    listen(context, event) {
        throw new Error('Invalid listen');
    }
    call(context, command, args, token = CancellationToken.None) {
        switch (command) {
            case 'request': return this.service.request(args[0], token)
                .then(async ({ res, stream }) => {
                const buffer = await streamToBuffer(stream);
                return [{ statusCode: res.statusCode, headers: res.headers }, buffer];
            });
            case 'resolveProxy': return this.service.resolveProxy(args[0]);
            case 'lookupAuthorization': return this.service.lookupAuthorization(args[0]);
            case 'lookupKerberosAuthorization': return this.service.lookupKerberosAuthorization(args[0]);
            case 'loadCertificates': return this.service.loadCertificates();
        }
        throw new Error('Invalid call');
    }
}
export class RequestChannelClient {
    constructor(channel) {
        this.channel = channel;
    }
    async request(options, token) {
        const [res, buffer] = await this.channel.call('request', [options], token);
        return { res, stream: bufferToStream(buffer) };
    }
    async resolveProxy(url) {
        return this.channel.call('resolveProxy', [url]);
    }
    async lookupAuthorization(authInfo) {
        return this.channel.call('lookupAuthorization', [authInfo]);
    }
    async lookupKerberosAuthorization(url) {
        return this.channel.call('lookupKerberosAuthorization', [url]);
    }
    async loadCertificates() {
        return this.channel.call('loadCertificates');
    }
}
