import { ExtensionManagementError } from '../common/extensionManagement.js';
import { IExtensionManifest } from '../../extensions/common/extensions.js';
export declare function fromExtractError(e: Error): ExtensionManagementError;
export declare function getManifest(vsixPath: string): Promise<IExtensionManifest>;
