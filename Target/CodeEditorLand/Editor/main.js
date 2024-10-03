import * as path from 'path';
import * as fs from 'original-fs';
import * as os from 'os';
import { configurePortable } from './bootstrap-node.js';
import { bootstrapESM } from './bootstrap-esm.js';
import { fileURLToPath } from 'url';
import { app, protocol, crashReporter, Menu, contentTracing } from 'electron';
import minimist from 'minimist';
import { product } from './bootstrap-meta.js';
import { parse } from './vs/base/common/jsonc.js';
import { getUserDataPath } from './vs/platform/environment/node/userDataPath.js';
import * as perf from './vs/base/common/performance.js';
import { resolveNLSConfiguration } from './vs/base/node/nls.js';
import { getUNCHost, addUNCHostToAllowlist } from './vs/base/node/unc.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
perf.mark('code/didStartMain');
const portable = configurePortable(product);
const args = parseCLIArgs();
const argvConfig = configureCommandlineSwitchesSync(args);
if (args['sandbox'] &&
    !args['disable-chromium-sandbox'] &&
    !argvConfig['disable-chromium-sandbox']) {
    app.enableSandbox();
}
else if (app.commandLine.hasSwitch('no-sandbox') &&
    !app.commandLine.hasSwitch('disable-gpu-sandbox')) {
    app.commandLine.appendSwitch('disable-gpu-sandbox');
}
else {
    app.commandLine.appendSwitch('no-sandbox');
    app.commandLine.appendSwitch('disable-gpu-sandbox');
}
const userDataPath = getUserDataPath(args, product.nameShort ?? 'code-oss-dev');
if (process.platform === 'win32') {
    const userDataUNCHost = getUNCHost(userDataPath);
    if (userDataUNCHost) {
        addUNCHostToAllowlist(userDataUNCHost);
    }
}
app.setPath('userData', userDataPath);
const codeCachePath = getCodeCachePath();
Menu.setApplicationMenu(null);
perf.mark('code/willStartCrashReporter');
if (args['crash-reporter-directory'] || (argvConfig['enable-crash-reporter'] && !args['disable-crash-reporter'])) {
    configureCrashReporter();
}
perf.mark('code/didStartCrashReporter');
if (portable && portable.isPortable) {
    app.setAppLogsPath(path.join(userDataPath, 'logs'));
}
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'vscode-webview',
        privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, allowServiceWorkers: true, codeCache: true }
    },
    {
        scheme: 'vscode-file',
        privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true, codeCache: true }
    }
]);
registerListeners();
let nlsConfigurationPromise = undefined;
const osLocale = processZhLocale((app.getPreferredSystemLanguages()?.[0] ?? 'en').toLowerCase());
const userLocale = getUserDefinedLocale(argvConfig);
if (userLocale) {
    nlsConfigurationPromise = resolveNLSConfiguration({
        userLocale,
        osLocale,
        commit: product.commit,
        userDataPath,
        nlsMetadataPath: __dirname
    });
}
if (process.platform === 'win32' || process.platform === 'linux') {
    const electronLocale = (!userLocale || userLocale === 'qps-ploc') ? 'en' : userLocale;
    app.commandLine.appendSwitch('lang', electronLocale);
}
app.once('ready', function () {
    if (args['trace']) {
        const traceOptions = {
            categoryFilter: args['trace-category-filter'] || '*',
            traceOptions: args['trace-options'] || 'record-until-full,enable-sampling'
        };
        contentTracing.startRecording(traceOptions).finally(() => onReady());
    }
    else {
        onReady();
    }
});
async function onReady() {
    perf.mark('code/mainAppReady');
    try {
        const [, nlsConfig] = await Promise.all([
            mkdirpIgnoreError(codeCachePath),
            resolveNlsConfiguration()
        ]);
        await startup(codeCachePath, nlsConfig);
    }
    catch (error) {
        console.error(error);
    }
}
async function startup(codeCachePath, nlsConfig) {
    process.env['VSCODE_NLS_CONFIG'] = JSON.stringify(nlsConfig);
    process.env['VSCODE_CODE_CACHE_PATH'] = codeCachePath || '';
    await bootstrapESM();
    perf.mark('code/willLoadMainBundle');
    await import('./vs/code/electron-main/main.js');
    perf.mark('code/didLoadMainBundle');
}
function configureCommandlineSwitchesSync(cliArgs) {
    const SUPPORTED_ELECTRON_SWITCHES = [
        'disable-hardware-acceleration',
        'force-color-profile',
        'disable-lcd-text',
        'proxy-bypass-list'
    ];
    if (process.platform === 'linux') {
        SUPPORTED_ELECTRON_SWITCHES.push('force-renderer-accessibility');
        SUPPORTED_ELECTRON_SWITCHES.push('password-store');
    }
    const SUPPORTED_MAIN_PROCESS_SWITCHES = [
        'enable-proposed-api',
        'log-level',
        'use-inmemory-secretstorage'
    ];
    const argvConfig = readArgvConfigSync();
    Object.keys(argvConfig).forEach(argvKey => {
        const argvValue = argvConfig[argvKey];
        if (SUPPORTED_ELECTRON_SWITCHES.indexOf(argvKey) !== -1) {
            if (argvValue === true || argvValue === 'true') {
                if (argvKey === 'disable-hardware-acceleration') {
                    app.disableHardwareAcceleration();
                }
                else {
                    app.commandLine.appendSwitch(argvKey);
                }
            }
            else if (typeof argvValue === 'string' && argvValue) {
                if (argvKey === 'password-store') {
                    let migratedArgvValue = argvValue;
                    if (argvValue === 'gnome' || argvValue === 'gnome-keyring') {
                        migratedArgvValue = 'gnome-libsecret';
                    }
                    app.commandLine.appendSwitch(argvKey, migratedArgvValue);
                }
                else {
                    app.commandLine.appendSwitch(argvKey, argvValue);
                }
            }
        }
        else if (SUPPORTED_MAIN_PROCESS_SWITCHES.indexOf(argvKey) !== -1) {
            switch (argvKey) {
                case 'enable-proposed-api':
                    if (Array.isArray(argvValue)) {
                        argvValue.forEach(id => id && typeof id === 'string' && process.argv.push('--enable-proposed-api', id));
                    }
                    else {
                        console.error(`Unexpected value for \`enable-proposed-api\` in argv.json. Expected array of extension ids.`);
                    }
                    break;
                case 'log-level':
                    if (typeof argvValue === 'string') {
                        process.argv.push('--log', argvValue);
                    }
                    else if (Array.isArray(argvValue)) {
                        for (const value of argvValue) {
                            process.argv.push('--log', value);
                        }
                    }
                    break;
                case 'use-inmemory-secretstorage':
                    if (argvValue) {
                        process.argv.push('--use-inmemory-secretstorage');
                    }
                    break;
            }
        }
    });
    const featuresToDisable = `CalculateNativeWinOcclusion,${app.commandLine.getSwitchValue('disable-features')}`;
    app.commandLine.appendSwitch('disable-features', featuresToDisable);
    const blinkFeaturesToDisable = `FontMatchingCTMigration,${app.commandLine.getSwitchValue('disable-blink-features')}`;
    app.commandLine.appendSwitch('disable-blink-features', blinkFeaturesToDisable);
    const jsFlags = getJSFlags(cliArgs);
    if (jsFlags) {
        app.commandLine.appendSwitch('js-flags', jsFlags);
    }
    return argvConfig;
}
function readArgvConfigSync() {
    const argvConfigPath = getArgvConfigPath();
    let argvConfig = undefined;
    try {
        argvConfig = parse(fs.readFileSync(argvConfigPath).toString());
    }
    catch (error) {
        if (error && error.code === 'ENOENT') {
            createDefaultArgvConfigSync(argvConfigPath);
        }
        else {
            console.warn(`Unable to read argv.json configuration file in ${argvConfigPath}, falling back to defaults (${error})`);
        }
    }
    if (!argvConfig) {
        argvConfig = {};
    }
    return argvConfig;
}
function createDefaultArgvConfigSync(argvConfigPath) {
    try {
        const argvConfigPathDirname = path.dirname(argvConfigPath);
        if (!fs.existsSync(argvConfigPathDirname)) {
            fs.mkdirSync(argvConfigPathDirname);
        }
        const defaultArgvConfigContent = [
            '// This configuration file allows you to pass permanent command line arguments to VS Code.',
            '// Only a subset of arguments is currently supported to reduce the likelihood of breaking',
            '// the installation.',
            '//',
            '// PLEASE DO NOT CHANGE WITHOUT UNDERSTANDING THE IMPACT',
            '//',
            '// NOTE: Changing this file requires a restart of VS Code.',
            '{',
            '	// Use software rendering instead of hardware accelerated rendering.',
            '	// This can help in cases where you see rendering issues in VS Code.',
            '	// "disable-hardware-acceleration": true',
            '}'
        ];
        fs.writeFileSync(argvConfigPath, defaultArgvConfigContent.join('\n'));
    }
    catch (error) {
        console.error(`Unable to create argv.json configuration file in ${argvConfigPath}, falling back to defaults (${error})`);
    }
}
function getArgvConfigPath() {
    const vscodePortable = process.env['VSCODE_PORTABLE'];
    if (vscodePortable) {
        return path.join(vscodePortable, 'argv.json');
    }
    let dataFolderName = product.dataFolderName;
    if (process.env['VSCODE_DEV']) {
        dataFolderName = `${dataFolderName}-dev`;
    }
    return path.join(os.homedir(), dataFolderName, 'argv.json');
}
function configureCrashReporter() {
    let crashReporterDirectory = args['crash-reporter-directory'];
    let submitURL = '';
    if (crashReporterDirectory) {
        crashReporterDirectory = path.normalize(crashReporterDirectory);
        if (!path.isAbsolute(crashReporterDirectory)) {
            console.error(`The path '${crashReporterDirectory}' specified for --crash-reporter-directory must be absolute.`);
            app.exit(1);
        }
        if (!fs.existsSync(crashReporterDirectory)) {
            try {
                fs.mkdirSync(crashReporterDirectory, { recursive: true });
            }
            catch (error) {
                console.error(`The path '${crashReporterDirectory}' specified for --crash-reporter-directory does not seem to exist or cannot be created.`);
                app.exit(1);
            }
        }
        console.log(`Found --crash-reporter-directory argument. Setting crashDumps directory to be '${crashReporterDirectory}'`);
        app.setPath('crashDumps', crashReporterDirectory);
    }
    else {
        const appCenter = product.appCenter;
        if (appCenter) {
            const isWindows = (process.platform === 'win32');
            const isLinux = (process.platform === 'linux');
            const isDarwin = (process.platform === 'darwin');
            const crashReporterId = argvConfig['crash-reporter-id'];
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (crashReporterId && uuidPattern.test(crashReporterId)) {
                if (isWindows) {
                    switch (process.arch) {
                        case 'x64':
                            submitURL = appCenter['win32-x64'];
                            break;
                        case 'arm64':
                            submitURL = appCenter['win32-arm64'];
                            break;
                    }
                }
                else if (isDarwin) {
                    if (product.darwinUniversalAssetId) {
                        submitURL = appCenter['darwin-universal'];
                    }
                    else {
                        switch (process.arch) {
                            case 'x64':
                                submitURL = appCenter['darwin'];
                                break;
                            case 'arm64':
                                submitURL = appCenter['darwin-arm64'];
                                break;
                        }
                    }
                }
                else if (isLinux) {
                    submitURL = appCenter['linux-x64'];
                }
                submitURL = submitURL.concat('&uid=', crashReporterId, '&iid=', crashReporterId, '&sid=', crashReporterId);
                const argv = process.argv;
                const endOfArgsMarkerIndex = argv.indexOf('--');
                if (endOfArgsMarkerIndex === -1) {
                    argv.push('--crash-reporter-id', crashReporterId);
                }
                else {
                    argv.splice(endOfArgsMarkerIndex, 0, '--crash-reporter-id', crashReporterId);
                }
            }
        }
    }
    const productName = (product.crashReporter ? product.crashReporter.productName : undefined) || product.nameShort;
    const companyName = (product.crashReporter ? product.crashReporter.companyName : undefined) || 'Microsoft';
    const uploadToServer = Boolean(!process.env['VSCODE_DEV'] && submitURL && !crashReporterDirectory);
    crashReporter.start({
        companyName,
        productName: process.env['VSCODE_DEV'] ? `${productName} Dev` : productName,
        submitURL,
        uploadToServer,
        compress: true
    });
}
function getJSFlags(cliArgs) {
    const jsFlags = [];
    if (cliArgs['js-flags']) {
        jsFlags.push(cliArgs['js-flags']);
    }
    return jsFlags.length > 0 ? jsFlags.join(' ') : null;
}
function parseCLIArgs() {
    return minimist(process.argv, {
        string: [
            'user-data-dir',
            'locale',
            'js-flags',
            'crash-reporter-directory'
        ],
        boolean: [
            'disable-chromium-sandbox',
        ],
        default: {
            'sandbox': true
        },
        alias: {
            'no-sandbox': 'sandbox'
        }
    });
}
function registerListeners() {
    const macOpenFiles = [];
    globalThis['macOpenFiles'] = macOpenFiles;
    app.on('open-file', function (event, path) {
        macOpenFiles.push(path);
    });
    const openUrls = [];
    const onOpenUrl = function (event, url) {
        event.preventDefault();
        openUrls.push(url);
    };
    app.on('will-finish-launching', function () {
        app.on('open-url', onOpenUrl);
    });
    globalThis['getOpenUrls'] = function () {
        app.removeListener('open-url', onOpenUrl);
        return openUrls;
    };
}
function getCodeCachePath() {
    if (process.argv.indexOf('--no-cached-data') > 0) {
        return undefined;
    }
    if (process.env['VSCODE_DEV']) {
        return undefined;
    }
    const commit = product.commit;
    if (!commit) {
        return undefined;
    }
    return path.join(userDataPath, 'CachedData', commit);
}
async function mkdirpIgnoreError(dir) {
    if (typeof dir === 'string') {
        try {
            await fs.promises.mkdir(dir, { recursive: true });
            return dir;
        }
        catch (error) {
        }
    }
    return undefined;
}
function processZhLocale(appLocale) {
    if (appLocale.startsWith('zh')) {
        const region = appLocale.split('-')[1];
        if (['hans', 'cn', 'sg', 'my'].includes(region)) {
            return 'zh-cn';
        }
        return 'zh-tw';
    }
    return appLocale;
}
async function resolveNlsConfiguration() {
    const nlsConfiguration = nlsConfigurationPromise ? await nlsConfigurationPromise : undefined;
    if (nlsConfiguration) {
        return nlsConfiguration;
    }
    let userLocale = app.getLocale();
    if (!userLocale) {
        return {
            userLocale: 'en',
            osLocale,
            resolvedLanguage: 'en',
            defaultMessagesFile: path.join(__dirname, 'nls.messages.json'),
            locale: 'en',
            availableLanguages: {}
        };
    }
    userLocale = processZhLocale(userLocale.toLowerCase());
    return resolveNLSConfiguration({
        userLocale,
        osLocale,
        commit: product.commit,
        userDataPath,
        nlsMetadataPath: __dirname
    });
}
function getUserDefinedLocale(argvConfig) {
    const locale = args['locale'];
    if (locale) {
        return locale.toLowerCase();
    }
    return typeof argvConfig?.locale === 'string' ? argvConfig.locale.toLowerCase() : undefined;
}
