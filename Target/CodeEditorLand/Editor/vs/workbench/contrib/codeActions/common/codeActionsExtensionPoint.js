/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from '../../../../nls.js';
import { languagesExtPoint } from '../../../services/language/common/languageService.js';
import { Extensions as ExtensionFeaturesExtensions } from '../../../services/extensionManagement/common/extensionFeatures.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
var CodeActionExtensionPointFields;
(function (CodeActionExtensionPointFields) {
    CodeActionExtensionPointFields["languages"] = "languages";
    CodeActionExtensionPointFields["actions"] = "actions";
    CodeActionExtensionPointFields["kind"] = "kind";
    CodeActionExtensionPointFields["title"] = "title";
    CodeActionExtensionPointFields["description"] = "description";
})(CodeActionExtensionPointFields || (CodeActionExtensionPointFields = {}));
const codeActionsExtensionPointSchema = Object.freeze({
    type: 'array',
    markdownDescription: nls.localize('contributes.codeActions', "Configure which editor to use for a resource."),
    items: {
        type: 'object',
        required: [CodeActionExtensionPointFields.languages, CodeActionExtensionPointFields.actions],
        properties: {
            [CodeActionExtensionPointFields.languages]: {
                type: 'array',
                description: nls.localize('contributes.codeActions.languages', "Language modes that the code actions are enabled for."),
                items: { type: 'string' }
            },
            [CodeActionExtensionPointFields.actions]: {
                type: 'object',
                required: [CodeActionExtensionPointFields.kind, CodeActionExtensionPointFields.title],
                properties: {
                    [CodeActionExtensionPointFields.kind]: {
                        type: 'string',
                        markdownDescription: nls.localize('contributes.codeActions.kind', "`CodeActionKind` of the contributed code action."),
                    },
                    [CodeActionExtensionPointFields.title]: {
                        type: 'string',
                        description: nls.localize('contributes.codeActions.title', "Label for the code action used in the UI."),
                    },
                    [CodeActionExtensionPointFields.description]: {
                        type: 'string',
                        description: nls.localize('contributes.codeActions.description', "Description of what the code action does."),
                    },
                }
            }
        }
    }
});
export const codeActionsExtensionPointDescriptor = {
    extensionPoint: 'codeActions',
    deps: [languagesExtPoint],
    jsonSchema: codeActionsExtensionPointSchema
};
class CodeActionsTableRenderer extends Disposable {
    constructor() {
        super(...arguments);
        this.type = 'table';
    }
    shouldRender(manifest) {
        return !!manifest.contributes?.codeActions;
    }
    render(manifest) {
        const codeActions = manifest.contributes?.codeActions || [];
        if (!codeActions.length) {
            return { data: { headers: [], rows: [] }, dispose: () => { } };
        }
        const flatActions = codeActions.map(contribution => contribution.actions.map(action => ({ ...action, languages: contribution.languages }))).flat();
        const headers = [
            nls.localize('codeActions.title', "Title"),
            nls.localize('codeActions.kind', "Kind"),
            nls.localize('codeActions.description', "Description"),
            nls.localize('codeActions.languages', "Languages")
        ];
        const rows = flatActions.sort((a, b) => a.title.localeCompare(b.title))
            .map(action => {
            return [
                action.title,
                new MarkdownString().appendMarkdown(`\`${action.kind}\``),
                action.description ?? '',
                new MarkdownString().appendMarkdown(`${action.languages.map(lang => `\`${lang}\``).join('&nbsp;')}`),
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
Registry.as(ExtensionFeaturesExtensions.ExtensionFeaturesRegistry).registerExtensionFeature({
    id: 'codeActions',
    label: nls.localize('codeactions', "Code Actions"),
    access: {
        canToggle: false,
    },
    renderer: new SyncDescriptor(CodeActionsTableRenderer),
});
