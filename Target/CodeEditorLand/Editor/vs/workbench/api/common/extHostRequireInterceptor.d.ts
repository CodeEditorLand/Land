import { URI } from '../../../base/common/uri.js';
import { IExtHostConfiguration } from './extHostConfiguration.js';
import { IExtensionApiFactory, IExtensionRegistries } from './extHost.api.impl.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { IExtHostExtensionService } from './extHostExtensionService.js';
import { ILogService } from '../../../platform/log/common/log.js';
interface LoadFunction {
    (request: string): any;
}
interface IAlternativeModuleProvider {
    alternativeModuleName(name: string): string | undefined;
}
interface INodeModuleFactory extends Partial<IAlternativeModuleProvider> {
    readonly nodeModuleName: string | string[];
    load(request: string, parent: URI, original: LoadFunction): any;
}
export declare abstract class RequireInterceptor {
    private _apiFactory;
    private _extensionRegistry;
    private readonly _instaService;
    private readonly _extHostConfiguration;
    private readonly _extHostExtensionService;
    private readonly _initData;
    private readonly _logService;
    protected readonly _factories: Map<string, INodeModuleFactory>;
    protected readonly _alternatives: ((moduleName: string) => string | undefined)[];
    constructor(_apiFactory: IExtensionApiFactory, _extensionRegistry: IExtensionRegistries, _instaService: IInstantiationService, _extHostConfiguration: IExtHostConfiguration, _extHostExtensionService: IExtHostExtensionService, _initData: IExtHostInitDataService, _logService: ILogService);
    install(): Promise<void>;
    protected abstract _installInterceptor(): void;
    register(interceptor: INodeModuleFactory | IAlternativeModuleProvider): void;
}
export {};
