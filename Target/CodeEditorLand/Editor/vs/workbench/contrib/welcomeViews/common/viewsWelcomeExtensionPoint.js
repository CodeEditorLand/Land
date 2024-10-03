import * as nls from '../../../../nls.js';
export var ViewsWelcomeExtensionPointFields;
(function (ViewsWelcomeExtensionPointFields) {
    ViewsWelcomeExtensionPointFields["view"] = "view";
    ViewsWelcomeExtensionPointFields["contents"] = "contents";
    ViewsWelcomeExtensionPointFields["when"] = "when";
    ViewsWelcomeExtensionPointFields["group"] = "group";
    ViewsWelcomeExtensionPointFields["enablement"] = "enablement";
})(ViewsWelcomeExtensionPointFields || (ViewsWelcomeExtensionPointFields = {}));
export const ViewIdentifierMap = {
    'explorer': 'workbench.explorer.emptyView',
    'debug': 'workbench.debug.welcome',
    'scm': 'workbench.scm',
    'testing': 'workbench.view.testing'
};
const viewsWelcomeExtensionPointSchema = Object.freeze({
    type: 'array',
    description: nls.localize('contributes.viewsWelcome', "Contributed views welcome content. Welcome content will be rendered in tree based views whenever they have no meaningful content to display, ie. the File Explorer when no folder is open. Such content is useful as in-product documentation to drive users to use certain features before they are available. A good example would be a `Clone Repository` button in the File Explorer welcome view."),
    items: {
        type: 'object',
        description: nls.localize('contributes.viewsWelcome.view', "Contributed welcome content for a specific view."),
        required: [
            ViewsWelcomeExtensionPointFields.view,
            ViewsWelcomeExtensionPointFields.contents
        ],
        properties: {
            [ViewsWelcomeExtensionPointFields.view]: {
                anyOf: [
                    {
                        type: 'string',
                        description: nls.localize('contributes.viewsWelcome.view.view', "Target view identifier for this welcome content. Only tree based views are supported.")
                    },
                    {
                        type: 'string',
                        description: nls.localize('contributes.viewsWelcome.view.view', "Target view identifier for this welcome content. Only tree based views are supported."),
                        enum: Object.keys(ViewIdentifierMap)
                    }
                ]
            },
            [ViewsWelcomeExtensionPointFields.contents]: {
                type: 'string',
                description: nls.localize('contributes.viewsWelcome.view.contents', "Welcome content to be displayed. The format of the contents is a subset of Markdown, with support for links only."),
            },
            [ViewsWelcomeExtensionPointFields.when]: {
                type: 'string',
                description: nls.localize('contributes.viewsWelcome.view.when', "Condition when the welcome content should be displayed."),
            },
            [ViewsWelcomeExtensionPointFields.group]: {
                type: 'string',
                description: nls.localize('contributes.viewsWelcome.view.group', "Group to which this welcome content belongs. Proposed API."),
            },
            [ViewsWelcomeExtensionPointFields.enablement]: {
                type: 'string',
                description: nls.localize('contributes.viewsWelcome.view.enablement', "Condition when the welcome content buttons and command links should be enabled."),
            },
        }
    }
});
export const viewsWelcomeExtensionPointDescriptor = {
    extensionPoint: 'viewsWelcome',
    jsonSchema: viewsWelcomeExtensionPointSchema
};
