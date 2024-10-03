import { ExtensionActivationTimesBuilder } from '../common/extHostExtensionActivator.js';
import { AbstractExtHostExtensionService } from '../common/extHostExtensionService.js';
import { URI } from '../../../base/common/uri.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ExtensionRuntime } from '../common/extHostTypes.js';
export declare class ExtHostExtensionService extends AbstractExtHostExtensionService {
    readonly extensionRuntime = ExtensionRuntime.Node;
    protected _beforeAlmostReadyToRunExtensions(): Promise<void>;
    protected _getEntryPoint(extensionDescription: IExtensionDescription): string | undefined;
    protected _loadCommonJSModule<T>(extension: IExtensionDescription | null, module: URI, activationTimesBuilder: ExtensionActivationTimesBuilder): Promise<T>;
    $setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
}
