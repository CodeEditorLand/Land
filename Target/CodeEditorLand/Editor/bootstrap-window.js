"use strict";
(function () {
    const preloadGlobals = window.vscode;
    const safeProcess = preloadGlobals.process;
    async function load(esModule, options) {
        const configuration = await resolveWindowConfiguration();
        options?.beforeImport?.(configuration);
        const { enableDeveloperKeybindings, removeDeveloperKeybindingsAfterLoad, developerDeveloperKeybindingsDisposable, forceDisableShowDevtoolsOnError } = setupDeveloperKeybindings(configuration, options);
        setupNLS(configuration);
        const baseUrl = new URL(`${fileUriFromPath(configuration.appRoot, { isWindows: safeProcess.platform === 'win32', scheme: 'vscode-file', fallbackAuthority: 'vscode-app' })}/out/`);
        globalThis._VSCODE_FILE_ROOT = baseUrl.toString();
        setupCSSImportMaps(configuration, baseUrl);
        try {
            const result = await import(new URL(`${esModule}.js`, baseUrl).href);
            if (developerDeveloperKeybindingsDisposable && removeDeveloperKeybindingsAfterLoad) {
                developerDeveloperKeybindingsDisposable();
            }
            return { result, configuration };
        }
        catch (error) {
            onUnexpectedError(error, enableDeveloperKeybindings && !forceDisableShowDevtoolsOnError);
            throw error;
        }
    }
    async function resolveWindowConfiguration() {
        const timeout = setTimeout(() => { console.error(`[resolve window config] Could not resolve window configuration within 10 seconds, but will continue to wait...`); }, 10000);
        performance.mark('code/willWaitForWindowConfig');
        const configuration = await preloadGlobals.context.resolveConfiguration();
        performance.mark('code/didWaitForWindowConfig');
        clearTimeout(timeout);
        return configuration;
    }
    function setupDeveloperKeybindings(configuration, options) {
        const { forceEnableDeveloperKeybindings, disallowReloadKeybinding, removeDeveloperKeybindingsAfterLoad, forceDisableShowDevtoolsOnError } = typeof options?.configureDeveloperSettings === 'function' ? options.configureDeveloperSettings(configuration) : {
            forceEnableDeveloperKeybindings: false,
            disallowReloadKeybinding: false,
            removeDeveloperKeybindingsAfterLoad: false,
            forceDisableShowDevtoolsOnError: false
        };
        const isDev = !!safeProcess.env['VSCODE_DEV'];
        const enableDeveloperKeybindings = Boolean(isDev || forceEnableDeveloperKeybindings);
        let developerDeveloperKeybindingsDisposable = undefined;
        if (enableDeveloperKeybindings) {
            developerDeveloperKeybindingsDisposable = registerDeveloperKeybindings(disallowReloadKeybinding);
        }
        return {
            enableDeveloperKeybindings,
            removeDeveloperKeybindingsAfterLoad,
            developerDeveloperKeybindingsDisposable,
            forceDisableShowDevtoolsOnError
        };
    }
    function registerDeveloperKeybindings(disallowReloadKeybinding) {
        const ipcRenderer = preloadGlobals.ipcRenderer;
        const extractKey = function (e) {
            return [
                e.ctrlKey ? 'ctrl-' : '',
                e.metaKey ? 'meta-' : '',
                e.altKey ? 'alt-' : '',
                e.shiftKey ? 'shift-' : '',
                e.keyCode
            ].join('');
        };
        const TOGGLE_DEV_TOOLS_KB = (safeProcess.platform === 'darwin' ? 'meta-alt-73' : 'ctrl-shift-73');
        const TOGGLE_DEV_TOOLS_KB_ALT = '123';
        const RELOAD_KB = (safeProcess.platform === 'darwin' ? 'meta-82' : 'ctrl-82');
        let listener = function (e) {
            const key = extractKey(e);
            if (key === TOGGLE_DEV_TOOLS_KB || key === TOGGLE_DEV_TOOLS_KB_ALT) {
                ipcRenderer.send('vscode:toggleDevTools');
            }
            else if (key === RELOAD_KB && !disallowReloadKeybinding) {
                ipcRenderer.send('vscode:reloadWindow');
            }
        };
        window.addEventListener('keydown', listener);
        return function () {
            if (listener) {
                window.removeEventListener('keydown', listener);
                listener = undefined;
            }
        };
    }
    function setupNLS(configuration) {
        globalThis._VSCODE_NLS_MESSAGES = configuration.nls.messages;
        globalThis._VSCODE_NLS_LANGUAGE = configuration.nls.language;
        let language = configuration.nls.language || 'en';
        if (language === 'zh-tw') {
            language = 'zh-Hant';
        }
        else if (language === 'zh-cn') {
            language = 'zh-Hans';
        }
        window.document.documentElement.setAttribute('lang', language);
    }
    function onUnexpectedError(error, showDevtoolsOnError) {
        if (showDevtoolsOnError) {
            const ipcRenderer = preloadGlobals.ipcRenderer;
            ipcRenderer.send('vscode:openDevTools');
        }
        console.error(`[uncaught exception]: ${error}`);
        if (error && typeof error !== 'string' && error.stack) {
            console.error(error.stack);
        }
    }
    function fileUriFromPath(path, config) {
        let pathName = path.replace(/\\/g, '/');
        if (pathName.length > 0 && pathName.charAt(0) !== '/') {
            pathName = `/${pathName}`;
        }
        let uri;
        if (config.isWindows && pathName.startsWith('//')) {
            uri = encodeURI(`${config.scheme || 'file'}:${pathName}`);
        }
        else {
            uri = encodeURI(`${config.scheme || 'file'}://${config.fallbackAuthority || ''}${pathName}`);
        }
        return uri.replace(/#/g, '%23');
    }
    function setupCSSImportMaps(configuration, baseUrl) {
        if (Array.isArray(configuration.cssModules) && configuration.cssModules.length > 0) {
            performance.mark('code/willAddCssLoader');
            const style = document.createElement('style');
            style.type = 'text/css';
            style.media = 'screen';
            style.id = 'vscode-css-loading';
            document.head.appendChild(style);
            globalThis._VSCODE_CSS_LOAD = function (url) {
                style.textContent += `@import url(${url});\n`;
            };
            const importMap = { imports: {} };
            for (const cssModule of configuration.cssModules) {
                const cssUrl = new URL(cssModule, baseUrl).href;
                const jsSrc = `globalThis._VSCODE_CSS_LOAD('${cssUrl}');\n`;
                const blob = new Blob([jsSrc], { type: 'application/javascript' });
                importMap.imports[cssUrl] = URL.createObjectURL(blob);
            }
            const ttp = window.trustedTypes?.createPolicy('vscode-bootstrapImportMap', { createScript(value) { return value; }, });
            const importMapSrc = JSON.stringify(importMap, undefined, 2);
            const importMapScript = document.createElement('script');
            importMapScript.type = 'importmap';
            importMapScript.setAttribute('nonce', '0c6a828f1297');
            importMapScript.textContent = ttp?.createScript(importMapSrc) ?? importMapSrc;
            document.head.appendChild(importMapScript);
            performance.mark('code/didAddCssLoader');
        }
    }
    globalThis.MonacoBootstrapWindow = { load };
}());
