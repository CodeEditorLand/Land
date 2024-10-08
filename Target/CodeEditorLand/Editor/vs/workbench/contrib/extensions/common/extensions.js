/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { areSameExtensions } from '../../../../platform/extensionManagement/common/extensionManagementUtil.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
export const VIEWLET_ID = 'workbench.view.extensions';
export const IExtensionsWorkbenchService = createDecorator('extensionsWorkbenchService');
export const ConfigurationKey = 'extensions';
export const AutoUpdateConfigurationKey = 'extensions.autoUpdate';
export const AutoCheckUpdatesConfigurationKey = 'extensions.autoCheckUpdates';
export const CloseExtensionDetailsOnViewChangeKey = 'extensions.closeExtensionDetailsOnViewChange';
export const AutoRestartConfigurationKey = 'extensions.autoRestart';
let ExtensionContainers = class ExtensionContainers extends Disposable {
    constructor(containers, extensionsWorkbenchService) {
        super();
        this.containers = containers;
        this._register(extensionsWorkbenchService.onChange(this.update, this));
    }
    set extension(extension) {
        this.containers.forEach(c => c.extension = extension);
    }
    update(extension) {
        for (const container of this.containers) {
            if (extension && container.extension) {
                if (areSameExtensions(container.extension.identifier, extension.identifier)) {
                    if (container.extension.server && extension.server && container.extension.server !== extension.server) {
                        if (container.updateWhenCounterExtensionChanges) {
                            container.update();
                        }
                    }
                    else {
                        container.extension = extension;
                    }
                }
            }
            else {
                container.update();
            }
        }
    }
};
ExtensionContainers = __decorate([
    __param(1, IExtensionsWorkbenchService),
    __metadata("design:paramtypes", [Array, Object])
], ExtensionContainers);
export { ExtensionContainers };
export const WORKSPACE_RECOMMENDATIONS_VIEW_ID = 'workbench.views.extensions.workspaceRecommendations';
export const OUTDATED_EXTENSIONS_VIEW_ID = 'workbench.views.extensions.searchOutdated';
export const TOGGLE_IGNORE_EXTENSION_ACTION_ID = 'workbench.extensions.action.toggleIgnoreExtension';
export const SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID = 'workbench.extensions.action.installVSIX';
export const INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID = 'workbench.extensions.command.installFromVSIX';
export const LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID = 'workbench.extensions.action.listWorkspaceUnsupportedExtensions';
// Context Keys
export const HasOutdatedExtensionsContext = new RawContextKey('hasOutdatedExtensions', false);
export const CONTEXT_HAS_GALLERY = new RawContextKey('hasGallery', false);
// Context Menu Groups
export const THEME_ACTIONS_GROUP = '_theme_';
export const INSTALL_ACTIONS_GROUP = '0_install';
export const UPDATE_ACTIONS_GROUP = '0_update';
export const extensionsSearchActionsMenu = new MenuId('extensionsSearchActionsMenu');
