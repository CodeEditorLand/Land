/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { streamToBuffer } from '../../../base/common/buffer.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import * as https from 'https';
import { AbstractOneDataSystemAppender } from '../common/1dsAppender.js';
/**
 * Completes a request to submit telemetry to the server utilizing the request service
 * @param options The options which will be used to make the request
 * @param requestService The request service
 * @returns An object containing the headers, statusCode, and responseData
 */
async function makeTelemetryRequest(options, requestService) {
    const response = await requestService.request(options, CancellationToken.None);
    const responseData = (await streamToBuffer(response.stream)).toString();
    const statusCode = response.res.statusCode ?? 200;
    const headers = response.res.headers;
    return {
        headers,
        statusCode,
        responseData
    };
}
/**
 * Complete a request to submit telemetry to the server utilizing the https module. Only used when the request service is not available
 * @param options The options which will be used to make the request
 * @returns An object containing the headers, statusCode, and responseData
 */
async function makeLegacyTelemetryRequest(options) {
    const httpsOptions = {
        method: options.type,
        headers: options.headers
    };
    const responsePromise = new Promise((resolve, reject) => {
        const req = https.request(options.url ?? '', httpsOptions, res => {
            res.on('data', function (responseData) {
                resolve({
                    headers: res.headers,
                    statusCode: res.statusCode ?? 200,
                    responseData: responseData.toString()
                });
            });
            // On response with error send status of 0 and a blank response to oncomplete so we can retry events
            res.on('error', function (err) {
                reject(err);
            });
        });
        req.write(options.data, (err) => {
            if (err) {
                reject(err);
            }
        });
        req.end();
    });
    return responsePromise;
}
async function sendPostAsync(requestService, payload, oncomplete) {
    const telemetryRequestData = typeof payload.data === 'string' ? payload.data : new TextDecoder().decode(payload.data);
    const requestOptions = {
        type: 'POST',
        headers: {
            ...payload.headers,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload.data).toString()
        },
        url: payload.urlString,
        data: telemetryRequestData
    };
    try {
        const responseData = requestService ? await makeTelemetryRequest(requestOptions, requestService) : await makeLegacyTelemetryRequest(requestOptions);
        oncomplete(responseData.statusCode, responseData.headers, responseData.responseData);
    }
    catch {
        // If it errors out, send status of 0 and a blank response to oncomplete so we can retry events
        oncomplete(0, {});
    }
}
export class OneDataSystemAppender extends AbstractOneDataSystemAppender {
    constructor(requestService, isInternalTelemetry, eventPrefix, defaultData, iKeyOrClientFactory) {
        // Override the way events get sent since node doesn't have XHTMLRequest
        const customHttpXHROverride = {
            sendPOST: (payload, oncomplete) => {
                // Fire off the async request without awaiting it
                sendPostAsync(requestService, payload, oncomplete);
            }
        };
        super(isInternalTelemetry, eventPrefix, defaultData, iKeyOrClientFactory, customHttpXHROverride);
    }
}
