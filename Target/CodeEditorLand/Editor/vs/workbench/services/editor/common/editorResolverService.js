/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as glob from '../../../../base/common/glob.js';
import { Schemas } from '../../../../base/common/network.js';
import { posix } from '../../../../base/common/path.js';
import { basename } from '../../../../base/common/resources.js';
import { localize } from '../../../../nls.js';
import { workbenchConfigurationNodeBase } from '../../../common/configuration.js';
import { Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
export const IEditorResolverService = createDecorator('editorResolverService');
export const editorsAssociationsSettingId = 'workbench.editorAssociations';
const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
const editorAssociationsConfigurationNode = {
    ...workbenchConfigurationNodeBase,
    properties: {
        'workbench.editorAssociations': {
            type: 'object',
            markdownDescription: localize('editor.editorAssociations', "Configure [glob patterns](https://aka.ms/vscode-glob-patterns) to editors (for example `\"*.hex\": \"hexEditor.hexedit\"`). These have precedence over the default behavior."),
            additionalProperties: {
                type: 'string'
            }
        }
    }
};
configurationRegistry.registerConfiguration(editorAssociationsConfigurationNode);
//#endregion
//#region EditorResolverService types
export var RegisteredEditorPriority;
(function (RegisteredEditorPriority) {
    RegisteredEditorPriority["builtin"] = "builtin";
    RegisteredEditorPriority["option"] = "option";
    RegisteredEditorPriority["exclusive"] = "exclusive";
    RegisteredEditorPriority["default"] = "default";
})(RegisteredEditorPriority || (RegisteredEditorPriority = {}));
//#endregion
//#region Util functions
export function priorityToRank(priority) {
    switch (priority) {
        case RegisteredEditorPriority.exclusive:
            return 5;
        case RegisteredEditorPriority.default:
            return 4;
        case RegisteredEditorPriority.builtin:
            return 3;
        // Text editor is priority 2
        case RegisteredEditorPriority.option:
        default:
            return 1;
    }
}
export function globMatchesResource(globPattern, resource) {
    const excludedSchemes = new Set([
        Schemas.extension,
        Schemas.webviewPanel,
        Schemas.vscodeWorkspaceTrust,
        Schemas.vscodeSettings
    ]);
    // We want to say that the above schemes match no glob patterns
    if (excludedSchemes.has(resource.scheme)) {
        return false;
    }
    const matchOnPath = typeof globPattern === 'string' && globPattern.indexOf(posix.sep) >= 0;
    const target = matchOnPath ? `${resource.scheme}:${resource.path}` : basename(resource);
    return glob.match(typeof globPattern === 'string' ? globPattern.toLowerCase() : globPattern, target.toLowerCase());
}
//#endregion
