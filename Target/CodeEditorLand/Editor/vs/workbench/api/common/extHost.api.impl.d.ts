import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ServicesAccessor } from '../../../platform/instantiation/common/instantiation.js';
import { ExtHostConfigProvider } from './extHostConfiguration.js';
import { ExtensionDescriptionRegistry } from '../../services/extensions/common/extensionDescriptionRegistry.js';
import type * as vscode from 'vscode';
export interface IExtensionRegistries {
    mine: ExtensionDescriptionRegistry;
    all: ExtensionDescriptionRegistry;
}
export interface IExtensionApiFactory {
    (extension: IExtensionDescription, extensionInfo: IExtensionRegistries, configProvider: ExtHostConfigProvider): typeof vscode;
}
/**
 * This method instantiates and returns the extension API surface
 */
export declare function createApiFactoryAndRegisterActors(accessor: ServicesAccessor): IExtensionApiFactory;
