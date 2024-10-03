import { coalesce } from '../../../../base/common/arrays.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import * as nls from '../../../../nls.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions } from '../../../services/extensionManagement/common/extensionFeatures.js';
import { ExtensionsRegistry } from '../../../services/extensions/common/extensionsRegistry.js';
import { languagesExtPoint } from '../../../services/language/common/languageService.js';
const Fields = Object.freeze({
    viewType: 'viewType',
    displayName: 'displayName',
    selector: 'selector',
    priority: 'priority',
});
const CustomEditorsContribution = {
    description: nls.localize('contributes.customEditors', 'Contributed custom editors.'),
    type: 'array',
    defaultSnippets: [{
            body: [{
                    [Fields.viewType]: '$1',
                    [Fields.displayName]: '$2',
                    [Fields.selector]: [{
                            filenamePattern: '$3'
                        }],
                }]
        }],
    items: {
        type: 'object',
        required: [
            Fields.viewType,
            Fields.displayName,
            Fields.selector,
        ],
        properties: {
            [Fields.viewType]: {
                type: 'string',
                markdownDescription: nls.localize('contributes.viewType', 'Identifier for the custom editor. This must be unique across all custom editors, so we recommend including your extension id as part of `viewType`. The `viewType` is used when registering custom editors with `vscode.registerCustomEditorProvider` and in the `onCustomEditor:${id}` [activation event](https://code.visualstudio.com/api/references/activation-events).'),
            },
            [Fields.displayName]: {
                type: 'string',
                description: nls.localize('contributes.displayName', 'Human readable name of the custom editor. This is displayed to users when selecting which editor to use.'),
            },
            [Fields.selector]: {
                type: 'array',
                description: nls.localize('contributes.selector', 'Set of globs that the custom editor is enabled for.'),
                items: {
                    type: 'object',
                    defaultSnippets: [{
                            body: {
                                filenamePattern: '$1',
                            }
                        }],
                    properties: {
                        filenamePattern: {
                            type: 'string',
                            description: nls.localize('contributes.selector.filenamePattern', 'Glob that the custom editor is enabled for.'),
                        },
                    }
                }
            },
            [Fields.priority]: {
                type: 'string',
                markdownDeprecationMessage: nls.localize('contributes.priority', 'Controls if the custom editor is enabled automatically when the user opens a file. This may be overridden by users using the `workbench.editorAssociations` setting.'),
                enum: [
                    "default",
                    "option",
                ],
                markdownEnumDescriptions: [
                    nls.localize('contributes.priority.default', 'The editor is automatically used when the user opens a resource, provided that no other default custom editors are registered for that resource.'),
                    nls.localize('contributes.priority.option', 'The editor is not automatically used when the user opens a resource, but a user can switch to the editor using the `Reopen With` command.'),
                ],
                default: 'default'
            }
        }
    }
};
export const customEditorsExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: 'customEditors',
    deps: [languagesExtPoint],
    jsonSchema: CustomEditorsContribution,
    activationEventsGenerator: (contribs, result) => {
        for (const contrib of contribs) {
            const viewType = contrib[Fields.viewType];
            if (viewType) {
                result.push(`onCustomEditor:${viewType}`);
            }
        }
    },
});
class CustomEditorsDataRenderer extends Disposable {
    constructor() {
        super(...arguments);
        this.type = 'table';
    }
    shouldRender(manifest) {
        return !!manifest.contributes?.customEditors;
    }
    render(manifest) {
        const customEditors = manifest.contributes?.customEditors || [];
        if (!customEditors.length) {
            return { data: { headers: [], rows: [] }, dispose: () => { } };
        }
        const headers = [
            nls.localize('customEditors view type', "View Type"),
            nls.localize('customEditors priority', "Priority"),
            nls.localize('customEditors filenamePattern', "Filename Pattern"),
        ];
        const rows = customEditors
            .map(customEditor => {
            return [
                customEditor.viewType,
                customEditor.priority ?? '',
                coalesce(customEditor.selector.map(x => x.filenamePattern)).join(', ')
            ];
        });
        return {
            data: {
                headers,
                rows
            },
            dispose: () => { }
        };
    }
}
Registry.as(Extensions.ExtensionFeaturesRegistry).registerExtensionFeature({
    id: 'customEditors',
    label: nls.localize('customEditors', "Custom Editors"),
    access: {
        canToggle: false
    },
    renderer: new SyncDescriptor(CustomEditorsDataRenderer),
});
