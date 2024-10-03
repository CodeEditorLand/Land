import * as nls from '../../../../nls.js';
import { languagesExtPoint } from '../../../services/language/common/languageService.js';
var DocumentationExtensionPointFields;
(function (DocumentationExtensionPointFields) {
    DocumentationExtensionPointFields["when"] = "when";
    DocumentationExtensionPointFields["title"] = "title";
    DocumentationExtensionPointFields["command"] = "command";
})(DocumentationExtensionPointFields || (DocumentationExtensionPointFields = {}));
const documentationExtensionPointSchema = Object.freeze({
    type: 'object',
    description: nls.localize('contributes.documentation', "Contributed documentation."),
    properties: {
        'refactoring': {
            type: 'array',
            description: nls.localize('contributes.documentation.refactorings', "Contributed documentation for refactorings."),
            items: {
                type: 'object',
                description: nls.localize('contributes.documentation.refactoring', "Contributed documentation for refactoring."),
                required: [
                    DocumentationExtensionPointFields.title,
                    DocumentationExtensionPointFields.when,
                    DocumentationExtensionPointFields.command
                ],
                properties: {
                    [DocumentationExtensionPointFields.title]: {
                        type: 'string',
                        description: nls.localize('contributes.documentation.refactoring.title', "Label for the documentation used in the UI."),
                    },
                    [DocumentationExtensionPointFields.when]: {
                        type: 'string',
                        description: nls.localize('contributes.documentation.refactoring.when', "When clause."),
                    },
                    [DocumentationExtensionPointFields.command]: {
                        type: 'string',
                        description: nls.localize('contributes.documentation.refactoring.command', "Command executed."),
                    },
                },
            }
        }
    }
});
export const documentationExtensionPointDescriptor = {
    extensionPoint: 'documentation',
    deps: [languagesExtPoint],
    jsonSchema: documentationExtensionPointSchema
};
