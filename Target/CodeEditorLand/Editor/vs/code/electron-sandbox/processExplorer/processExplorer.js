"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable no-restricted-globals */
(async function () {
    const bootstrapWindow = window.MonacoBootstrapWindow; // defined by bootstrap-window.ts
    const { result, configuration } = await bootstrapWindow.load('vs/code/electron-sandbox/processExplorer/processExplorerMain', {
        configureDeveloperSettings: function () {
            return {
                forceEnableDeveloperKeybindings: true
            };
        },
    });
    result.startup(configuration);
}());
