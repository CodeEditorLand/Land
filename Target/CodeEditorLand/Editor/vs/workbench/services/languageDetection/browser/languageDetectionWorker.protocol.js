/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class LanguageDetectionWorkerHost {
    static { this.CHANNEL_NAME = 'languageDetectionWorkerHost'; }
    static getChannel(workerServer) {
        return workerServer.getChannel(LanguageDetectionWorkerHost.CHANNEL_NAME);
    }
    static setChannel(workerClient, obj) {
        workerClient.setChannel(LanguageDetectionWorkerHost.CHANNEL_NAME, obj);
    }
}
