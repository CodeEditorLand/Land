"use strict";
(async function () {
    performance.mark('code/didStartRenderer');
    const bootstrapWindow = window.MonacoBootstrapWindow;
    const preloadGlobals = window.vscode;
    function showSplash(configuration) {
        performance.mark('code/willShowPartsSplash');
        let data = configuration.partsSplash;
        if (data) {
            if (configuration.autoDetectHighContrast && configuration.colorScheme.highContrast) {
                if ((configuration.colorScheme.dark && data.baseTheme !== 'hc-black') || (!configuration.colorScheme.dark && data.baseTheme !== 'hc-light')) {
                    data = undefined;
                }
            }
            else if (configuration.autoDetectColorScheme) {
                if ((configuration.colorScheme.dark && data.baseTheme !== 'vs-dark') || (!configuration.colorScheme.dark && data.baseTheme !== 'vs')) {
                    data = undefined;
                }
            }
        }
        if (data && configuration.extensionDevelopmentPath) {
            data.layoutInfo = undefined;
        }
        let baseTheme;
        let shellBackground;
        let shellForeground;
        if (data) {
            baseTheme = data.baseTheme;
            shellBackground = data.colorInfo.editorBackground;
            shellForeground = data.colorInfo.foreground;
        }
        else if (configuration.autoDetectHighContrast && configuration.colorScheme.highContrast) {
            if (configuration.colorScheme.dark) {
                baseTheme = 'hc-black';
                shellBackground = '#000000';
                shellForeground = '#FFFFFF';
            }
            else {
                baseTheme = 'hc-light';
                shellBackground = '#FFFFFF';
                shellForeground = '#000000';
            }
        }
        else if (configuration.autoDetectColorScheme) {
            if (configuration.colorScheme.dark) {
                baseTheme = 'vs-dark';
                shellBackground = '#1E1E1E';
                shellForeground = '#CCCCCC';
            }
            else {
                baseTheme = 'vs';
                shellBackground = '#FFFFFF';
                shellForeground = '#000000';
            }
        }
        const style = document.createElement('style');
        style.className = 'initialShellColors';
        window.document.head.appendChild(style);
        style.textContent = `body {	background-color: ${shellBackground}; color: ${shellForeground}; margin: 0; padding: 0; }`;
        if (typeof data?.zoomLevel === 'number' && typeof preloadGlobals?.webFrame?.setZoomLevel === 'function') {
            preloadGlobals.webFrame.setZoomLevel(data.zoomLevel);
        }
        if (data?.layoutInfo) {
            const { layoutInfo, colorInfo } = data;
            const splash = document.createElement('div');
            splash.id = 'monaco-parts-splash';
            splash.className = baseTheme ?? 'vs-dark';
            if (layoutInfo.windowBorder && colorInfo.windowBorder) {
                splash.style.position = 'relative';
                splash.style.height = 'calc(100vh - 2px)';
                splash.style.width = 'calc(100vw - 2px)';
                splash.style.border = `1px solid var(--window-border-color)`;
                splash.style.setProperty('--window-border-color', colorInfo.windowBorder);
                if (layoutInfo.windowBorderRadius) {
                    splash.style.borderRadius = layoutInfo.windowBorderRadius;
                }
            }
            layoutInfo.sideBarWidth = Math.min(layoutInfo.sideBarWidth, window.innerWidth - (layoutInfo.activityBarWidth + layoutInfo.editorPartMinWidth));
            const titleDiv = document.createElement('div');
            titleDiv.style.position = 'absolute';
            titleDiv.style.width = '100%';
            titleDiv.style.height = `${layoutInfo.titleBarHeight}px`;
            titleDiv.style.left = '0';
            titleDiv.style.top = '0';
            titleDiv.style.backgroundColor = `${colorInfo.titleBarBackground}`;
            titleDiv.style['-webkit-app-region'] = 'drag';
            splash.appendChild(titleDiv);
            if (colorInfo.titleBarBorder && layoutInfo.titleBarHeight > 0) {
                const titleBorder = document.createElement('div');
                titleBorder.style.position = 'absolute';
                titleBorder.style.width = '100%';
                titleBorder.style.height = '1px';
                titleBorder.style.left = '0';
                titleBorder.style.bottom = '0';
                titleBorder.style.borderBottom = `1px solid ${colorInfo.titleBarBorder}`;
                titleDiv.appendChild(titleBorder);
            }
            const activityDiv = document.createElement('div');
            activityDiv.style.position = 'absolute';
            activityDiv.style.width = `${layoutInfo.activityBarWidth}px`;
            activityDiv.style.height = `calc(100% - ${layoutInfo.titleBarHeight + layoutInfo.statusBarHeight}px)`;
            activityDiv.style.top = `${layoutInfo.titleBarHeight}px`;
            if (layoutInfo.sideBarSide === 'left') {
                activityDiv.style.left = '0';
            }
            else {
                activityDiv.style.right = '0';
            }
            activityDiv.style.backgroundColor = `${colorInfo.activityBarBackground}`;
            splash.appendChild(activityDiv);
            if (colorInfo.activityBarBorder && layoutInfo.activityBarWidth > 0) {
                const activityBorderDiv = document.createElement('div');
                activityBorderDiv.style.position = 'absolute';
                activityBorderDiv.style.width = '1px';
                activityBorderDiv.style.height = '100%';
                activityBorderDiv.style.top = '0';
                if (layoutInfo.sideBarSide === 'left') {
                    activityBorderDiv.style.right = '0';
                    activityBorderDiv.style.borderRight = `1px solid ${colorInfo.activityBarBorder}`;
                }
                else {
                    activityBorderDiv.style.left = '0';
                    activityBorderDiv.style.borderLeft = `1px solid ${colorInfo.activityBarBorder}`;
                }
                activityDiv.appendChild(activityBorderDiv);
            }
            if (configuration.workspace) {
                const sideDiv = document.createElement('div');
                sideDiv.style.position = 'absolute';
                sideDiv.style.width = `${layoutInfo.sideBarWidth}px`;
                sideDiv.style.height = `calc(100% - ${layoutInfo.titleBarHeight + layoutInfo.statusBarHeight}px)`;
                sideDiv.style.top = `${layoutInfo.titleBarHeight}px`;
                if (layoutInfo.sideBarSide === 'left') {
                    sideDiv.style.left = `${layoutInfo.activityBarWidth}px`;
                }
                else {
                    sideDiv.style.right = `${layoutInfo.activityBarWidth}px`;
                }
                sideDiv.style.backgroundColor = `${colorInfo.sideBarBackground}`;
                splash.appendChild(sideDiv);
                if (colorInfo.sideBarBorder && layoutInfo.sideBarWidth > 0) {
                    const sideBorderDiv = document.createElement('div');
                    sideBorderDiv.style.position = 'absolute';
                    sideBorderDiv.style.width = '1px';
                    sideBorderDiv.style.height = '100%';
                    sideBorderDiv.style.top = '0';
                    sideBorderDiv.style.right = '0';
                    if (layoutInfo.sideBarSide === 'left') {
                        sideBorderDiv.style.borderRight = `1px solid ${colorInfo.sideBarBorder}`;
                    }
                    else {
                        sideBorderDiv.style.left = '0';
                        sideBorderDiv.style.borderLeft = `1px solid ${colorInfo.sideBarBorder}`;
                    }
                    sideDiv.appendChild(sideBorderDiv);
                }
            }
            const statusDiv = document.createElement('div');
            statusDiv.style.position = 'absolute';
            statusDiv.style.width = '100%';
            statusDiv.style.height = `${layoutInfo.statusBarHeight}px`;
            statusDiv.style.bottom = '0';
            statusDiv.style.left = '0';
            if (configuration.workspace && colorInfo.statusBarBackground) {
                statusDiv.style.backgroundColor = colorInfo.statusBarBackground;
            }
            else if (!configuration.workspace && colorInfo.statusBarNoFolderBackground) {
                statusDiv.style.backgroundColor = colorInfo.statusBarNoFolderBackground;
            }
            splash.appendChild(statusDiv);
            if (colorInfo.statusBarBorder && layoutInfo.statusBarHeight > 0) {
                const statusBorderDiv = document.createElement('div');
                statusBorderDiv.style.position = 'absolute';
                statusBorderDiv.style.width = '100%';
                statusBorderDiv.style.height = '1px';
                statusBorderDiv.style.top = '0';
                statusBorderDiv.style.borderTop = `1px solid ${colorInfo.statusBarBorder}`;
                statusDiv.appendChild(statusBorderDiv);
            }
            window.document.body.appendChild(splash);
        }
        performance.mark('code/didShowPartsSplash');
    }
    const { result, configuration } = await bootstrapWindow.load('vs/workbench/workbench.desktop.main', {
        configureDeveloperSettings: function (windowConfig) {
            return {
                forceDisableShowDevtoolsOnError: typeof windowConfig.extensionTestsPath === 'string' || windowConfig['enable-smoke-test-driver'] === true,
                forceEnableDeveloperKeybindings: Array.isArray(windowConfig.extensionDevelopmentPath) && windowConfig.extensionDevelopmentPath.length > 0,
                removeDeveloperKeybindingsAfterLoad: true
            };
        },
        beforeImport: function (windowConfig) {
            showSplash(windowConfig);
            Object.defineProperty(window, 'vscodeWindowId', {
                get: () => windowConfig.windowId
            });
            window.requestIdleCallback(() => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                context?.clearRect(0, 0, canvas.width, canvas.height);
                canvas.remove();
            }, { timeout: 50 });
            performance.mark('code/willLoadWorkbenchMain');
        }
    });
    performance.mark('code/didLoadWorkbenchMain');
    result.main(configuration);
}());
