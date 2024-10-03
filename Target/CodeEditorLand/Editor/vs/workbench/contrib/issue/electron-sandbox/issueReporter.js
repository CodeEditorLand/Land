"use strict";
(async function () {
    const bootstrapWindow = window.MonacoBootstrapWindow;
    const { result, configuration } = await bootstrapWindow.load('vs/workbench/contrib/issue/electron-sandbox/issueReporterMain', {
        configureDeveloperSettings: function () {
            return {
                forceEnableDeveloperKeybindings: true,
                disallowReloadKeybinding: true
            };
        }
    });
    result.startup(configuration);
}());
