/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class TextMateWorkerHost {
    static { this.CHANNEL_NAME = 'textMateWorkerHost'; }
    static getChannel(workerServer) {
        return workerServer.getChannel(TextMateWorkerHost.CHANNEL_NAME);
    }
    static setChannel(workerClient, obj) {
        workerClient.setChannel(TextMateWorkerHost.CHANNEL_NAME, obj);
    }
}
