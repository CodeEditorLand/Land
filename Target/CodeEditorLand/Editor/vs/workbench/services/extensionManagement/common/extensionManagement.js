/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator, refineServiceDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { FileAccess } from '../../../../base/common/network.js';
import { localize } from '../../../../nls.js';
export const IProfileAwareExtensionManagementService = refineServiceDecorator(IExtensionManagementService);
export const IExtensionManagementServerService = createDecorator('extensionManagementServerService');
export const DefaultIconPath = FileAccess.asBrowserUri('vs/workbench/services/extensionManagement/common/media/defaultIcon.png').toString(true);
export const IWorkbenchExtensionManagementService = refineServiceDecorator(IProfileAwareExtensionManagementService);
export const extensionsConfigurationNodeBase = {
    id: 'extensions',
    order: 30,
    title: localize('extensionsConfigurationTitle', "Extensions"),
    type: 'object'
};
export const IWorkbenchExtensionEnablementService = createDecorator('extensionEnablementService');
export const IWebExtensionsScannerService = createDecorator('IWebExtensionsScannerService');
