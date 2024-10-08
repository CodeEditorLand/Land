/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { net } from 'electron';
import { RequestService as NodeRequestService } from '../node/requestService.js';
function getRawRequest(options) {
    return net.request;
}
export class RequestService extends NodeRequestService {
    request(options, token) {
        return super.request({ ...(options || {}), getRawRequest, isChromiumNetwork: true }, token);
    }
}
