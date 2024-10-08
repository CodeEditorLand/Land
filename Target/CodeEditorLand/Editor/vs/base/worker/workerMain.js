"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function () {
    function loadCode(moduleId) {
        const moduleUrl = new URL(`${moduleId}.js`, globalThis._VSCODE_FILE_ROOT);
        return import(moduleUrl.href);
    }
    function setupWorkerServer(ws) {
        setTimeout(function () {
            const messageHandler = ws.create((msg, transfer) => {
                globalThis.postMessage(msg, transfer);
            });
            self.onmessage = (e) => messageHandler.onmessage(e.data, e.ports);
            while (beforeReadyMessages.length > 0) {
                self.onmessage(beforeReadyMessages.shift());
            }
        }, 0);
    }
    let isFirstMessage = true;
    const beforeReadyMessages = [];
    globalThis.onmessage = (message) => {
        if (!isFirstMessage) {
            beforeReadyMessages.push(message);
            return;
        }
        isFirstMessage = false;
        loadCode(message.data).then((ws) => {
            setupWorkerServer(ws);
        }, (err) => {
            console.error(err);
        });
    };
})();
