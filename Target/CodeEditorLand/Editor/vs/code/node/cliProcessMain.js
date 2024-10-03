import * as fs from 'fs';
import { hostname, release } from 'os';
import { raceTimeout } from '../../base/common/async.js';
import { toErrorMessage } from '../../base/common/errorMessage.js';
import { isSigPipeError, onUnexpectedError, setUnexpectedErrorHandler } from '../../base/common/errors.js';
import { Disposable } from '../../base/common/lifecycle.js';
import { Schemas } from '../../base/common/network.js';
import { isAbsolute, join } from '../../base/common/path.js';
import { isWindows } from '../../base/common/platform.js';
import { cwd } from '../../base/common/process.js';
import { URI } from '../../base/common/uri.js';
import { IConfigurationService } from '../../platform/configuration/common/configuration.js';
import { ConfigurationService } from '../../platform/configuration/common/configurationService.js';
import { IDownloadService } from '../../platform/download/common/download.js';
import { DownloadService } from '../../platform/download/common/downloadService.js';
import { INativeEnvironmentService } from '../../platform/environment/common/environment.js';
import { NativeEnvironmentService } from '../../platform/environment/node/environmentService.js';
import { ExtensionGalleryServiceWithNoStorageService } from '../../platform/extensionManagement/common/extensionGalleryService.js';
import { IExtensionGalleryService } from '../../platform/extensionManagement/common/extensionManagement.js';
import { ExtensionSignatureVerificationService, IExtensionSignatureVerificationService } from '../../platform/extensionManagement/node/extensionSignatureVerificationService.js';
import { ExtensionManagementCLI } from '../../platform/extensionManagement/common/extensionManagementCLI.js';
import { IExtensionsProfileScannerService } from '../../platform/extensionManagement/common/extensionsProfileScannerService.js';
import { IExtensionsScannerService } from '../../platform/extensionManagement/common/extensionsScannerService.js';
import { ExtensionManagementService, INativeServerExtensionManagementService } from '../../platform/extensionManagement/node/extensionManagementService.js';
import { ExtensionsScannerService } from '../../platform/extensionManagement/node/extensionsScannerService.js';
import { IFileService } from '../../platform/files/common/files.js';
import { FileService } from '../../platform/files/common/fileService.js';
import { DiskFileSystemProvider } from '../../platform/files/node/diskFileSystemProvider.js';
import { SyncDescriptor } from '../../platform/instantiation/common/descriptors.js';
import { InstantiationService } from '../../platform/instantiation/common/instantiationService.js';
import { ServiceCollection } from '../../platform/instantiation/common/serviceCollection.js';
import { ILanguagePackService } from '../../platform/languagePacks/common/languagePacks.js';
import { NativeLanguagePackService } from '../../platform/languagePacks/node/languagePacks.js';
import { ConsoleLogger, getLogLevel, ILoggerService, ILogService, LogLevel } from '../../platform/log/common/log.js';
import { FilePolicyService } from '../../platform/policy/common/filePolicyService.js';
import { IPolicyService, NullPolicyService } from '../../platform/policy/common/policy.js';
import { NativePolicyService } from '../../platform/policy/node/nativePolicyService.js';
import product from '../../platform/product/common/product.js';
import { IProductService } from '../../platform/product/common/productService.js';
import { IRequestService } from '../../platform/request/common/request.js';
import { RequestService } from '../../platform/request/node/requestService.js';
import { StateReadonlyService } from '../../platform/state/node/stateService.js';
import { resolveCommonProperties } from '../../platform/telemetry/common/commonProperties.js';
import { ITelemetryService } from '../../platform/telemetry/common/telemetry.js';
import { TelemetryService } from '../../platform/telemetry/common/telemetryService.js';
import { supportsTelemetry, NullTelemetryService, getPiiPathsFromEnvironment, isInternalTelemetry } from '../../platform/telemetry/common/telemetryUtils.js';
import { OneDataSystemAppender } from '../../platform/telemetry/node/1dsAppender.js';
import { buildTelemetryMessage } from '../../platform/telemetry/node/telemetry.js';
import { IUriIdentityService } from '../../platform/uriIdentity/common/uriIdentity.js';
import { UriIdentityService } from '../../platform/uriIdentity/common/uriIdentityService.js';
import { IUserDataProfilesService } from '../../platform/userDataProfile/common/userDataProfile.js';
import { UserDataProfilesReadonlyService } from '../../platform/userDataProfile/node/userDataProfile.js';
import { resolveMachineId, resolveSqmId, resolvedevDeviceId } from '../../platform/telemetry/node/telemetryUtils.js';
import { ExtensionsProfileScannerService } from '../../platform/extensionManagement/node/extensionsProfileScannerService.js';
import { LogService } from '../../platform/log/common/logService.js';
import { LoggerService } from '../../platform/log/node/loggerService.js';
import { localize } from '../../nls.js';
import { FileUserDataProvider } from '../../platform/userData/common/fileUserDataProvider.js';
import { addUNCHostToAllowlist, getUNCHost } from '../../base/node/unc.js';
class CliMain extends Disposable {
    constructor(argv) {
        super();
        this.argv = argv;
        this.registerListeners();
    }
    registerListeners() {
        process.once('exit', () => this.dispose());
    }
    async run() {
        const [instantiationService, appenders] = await this.initServices();
        return instantiationService.invokeFunction(async (accessor) => {
            const logService = accessor.get(ILogService);
            const fileService = accessor.get(IFileService);
            const environmentService = accessor.get(INativeEnvironmentService);
            const userDataProfilesService = accessor.get(IUserDataProfilesService);
            logService.info('CLI main', this.argv);
            this.registerErrorHandler(logService);
            await this.doRun(environmentService, fileService, userDataProfilesService, instantiationService);
            await Promise.all(appenders.map(a => {
                raceTimeout(a.flush(), 1000);
            }));
            return;
        });
    }
    async initServices() {
        const services = new ServiceCollection();
        const productService = { _serviceBrand: undefined, ...product };
        services.set(IProductService, productService);
        const environmentService = new NativeEnvironmentService(this.argv, productService);
        services.set(INativeEnvironmentService, environmentService);
        await Promise.all([
            this.allowWindowsUNCPath(environmentService.appSettingsHome.with({ scheme: Schemas.file }).fsPath),
            this.allowWindowsUNCPath(environmentService.extensionsPath)
        ].map(path => path ? fs.promises.mkdir(path, { recursive: true }) : undefined));
        const loggerService = new LoggerService(getLogLevel(environmentService), environmentService.logsHome);
        services.set(ILoggerService, loggerService);
        const logger = this._register(loggerService.createLogger('cli', { name: localize('cli', "CLI") }));
        const otherLoggers = [];
        if (loggerService.getLogLevel() === LogLevel.Trace) {
            otherLoggers.push(new ConsoleLogger(loggerService.getLogLevel()));
        }
        const logService = this._register(new LogService(logger, otherLoggers));
        services.set(ILogService, logService);
        const fileService = this._register(new FileService(logService));
        services.set(IFileService, fileService);
        const diskFileSystemProvider = this._register(new DiskFileSystemProvider(logService));
        fileService.registerProvider(Schemas.file, diskFileSystemProvider);
        const uriIdentityService = new UriIdentityService(fileService);
        services.set(IUriIdentityService, uriIdentityService);
        const stateService = new StateReadonlyService(1, environmentService, logService, fileService);
        const userDataProfilesService = new UserDataProfilesReadonlyService(stateService, uriIdentityService, environmentService, fileService, logService);
        services.set(IUserDataProfilesService, userDataProfilesService);
        fileService.registerProvider(Schemas.vscodeUserData, new FileUserDataProvider(Schemas.file, diskFileSystemProvider, Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService));
        const policyService = isWindows && productService.win32RegValueName ? this._register(new NativePolicyService(logService, productService.win32RegValueName))
            : environmentService.policyFile ? this._register(new FilePolicyService(environmentService.policyFile, fileService, logService))
                : new NullPolicyService();
        services.set(IPolicyService, policyService);
        const configurationService = this._register(new ConfigurationService(userDataProfilesService.defaultProfile.settingsResource, fileService, policyService, logService));
        services.set(IConfigurationService, configurationService);
        await Promise.all([
            stateService.init(),
            configurationService.initialize()
        ]);
        let machineId = undefined;
        try {
            machineId = await resolveMachineId(stateService, logService);
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                logService.error(error);
            }
        }
        const sqmId = await resolveSqmId(stateService, logService);
        const devDeviceId = await resolvedevDeviceId(stateService, logService);
        userDataProfilesService.init();
        services.set(IUriIdentityService, new UriIdentityService(fileService));
        const requestService = new RequestService(configurationService, environmentService, logService);
        services.set(IRequestService, requestService);
        services.set(IDownloadService, new SyncDescriptor(DownloadService, undefined, true));
        services.set(IExtensionsProfileScannerService, new SyncDescriptor(ExtensionsProfileScannerService, undefined, true));
        services.set(IExtensionsScannerService, new SyncDescriptor(ExtensionsScannerService, undefined, true));
        services.set(IExtensionSignatureVerificationService, new SyncDescriptor(ExtensionSignatureVerificationService, undefined, true));
        services.set(INativeServerExtensionManagementService, new SyncDescriptor(ExtensionManagementService, undefined, true));
        services.set(IExtensionGalleryService, new SyncDescriptor(ExtensionGalleryServiceWithNoStorageService, undefined, true));
        services.set(ILanguagePackService, new SyncDescriptor(NativeLanguagePackService, undefined, false));
        const appenders = [];
        const isInternal = isInternalTelemetry(productService, configurationService);
        if (supportsTelemetry(productService, environmentService)) {
            if (productService.aiConfig && productService.aiConfig.ariaKey) {
                appenders.push(new OneDataSystemAppender(requestService, isInternal, 'monacoworkbench', null, productService.aiConfig.ariaKey));
            }
            const config = {
                appenders,
                sendErrorTelemetry: false,
                commonProperties: resolveCommonProperties(release(), hostname(), process.arch, productService.commit, productService.version, machineId, sqmId, devDeviceId, isInternal),
                piiPaths: getPiiPathsFromEnvironment(environmentService)
            };
            services.set(ITelemetryService, new SyncDescriptor(TelemetryService, [config], false));
        }
        else {
            services.set(ITelemetryService, NullTelemetryService);
        }
        return [new InstantiationService(services), appenders];
    }
    allowWindowsUNCPath(path) {
        if (isWindows) {
            const host = getUNCHost(path);
            if (host) {
                addUNCHostToAllowlist(host);
            }
        }
        return path;
    }
    registerErrorHandler(logService) {
        setUnexpectedErrorHandler(error => {
            const message = toErrorMessage(error, true);
            if (!message) {
                return;
            }
            logService.error(`[uncaught exception in CLI]: ${message}`);
        });
        process.on('uncaughtException', err => {
            if (!isSigPipeError(err)) {
                onUnexpectedError(err);
            }
        });
        process.on('unhandledRejection', (reason) => onUnexpectedError(reason));
    }
    async doRun(environmentService, fileService, userDataProfilesService, instantiationService) {
        let profile = undefined;
        if (environmentService.args.profile) {
            profile = userDataProfilesService.profiles.find(p => p.name === environmentService.args.profile);
            if (!profile) {
                throw new Error(`Profile '${environmentService.args.profile}' not found.`);
            }
        }
        const profileLocation = (profile ?? userDataProfilesService.defaultProfile).extensionsResource;
        if (this.argv['list-extensions']) {
            return instantiationService.createInstance(ExtensionManagementCLI, new ConsoleLogger(LogLevel.Info, false)).listExtensions(!!this.argv['show-versions'], this.argv['category'], profileLocation);
        }
        else if (this.argv['install-extension'] || this.argv['install-builtin-extension']) {
            const installOptions = { isMachineScoped: !!this.argv['do-not-sync'], installPreReleaseVersion: !!this.argv['pre-release'], profileLocation };
            return instantiationService.createInstance(ExtensionManagementCLI, new ConsoleLogger(LogLevel.Info, false)).installExtensions(this.asExtensionIdOrVSIX(this.argv['install-extension'] || []), this.asExtensionIdOrVSIX(this.argv['install-builtin-extension'] || []), installOptions, !!this.argv['force']);
        }
        else if (this.argv['uninstall-extension']) {
            return instantiationService.createInstance(ExtensionManagementCLI, new ConsoleLogger(LogLevel.Info, false)).uninstallExtensions(this.asExtensionIdOrVSIX(this.argv['uninstall-extension']), !!this.argv['force'], profileLocation);
        }
        else if (this.argv['update-extensions']) {
            return instantiationService.createInstance(ExtensionManagementCLI, new ConsoleLogger(LogLevel.Info, false)).updateExtensions(profileLocation);
        }
        else if (this.argv['locate-extension']) {
            return instantiationService.createInstance(ExtensionManagementCLI, new ConsoleLogger(LogLevel.Info, false)).locateExtension(this.argv['locate-extension']);
        }
        else if (this.argv['telemetry']) {
            console.log(await buildTelemetryMessage(environmentService.appRoot, environmentService.extensionsPath));
        }
    }
    asExtensionIdOrVSIX(inputs) {
        return inputs.map(input => /\.vsix$/i.test(input) ? URI.file(isAbsolute(input) ? input : join(cwd(), input)) : input);
    }
}
export async function main(argv) {
    const cliMain = new CliMain(argv);
    try {
        await cliMain.run();
    }
    finally {
        cliMain.dispose();
    }
}
