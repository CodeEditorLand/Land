import { IConfigurationPropertySchema } from '../../../../platform/configuration/common/configurationRegistry.js';
export declare enum ViewsWelcomeExtensionPointFields {
    view = "view",
    contents = "contents",
    when = "when",
    group = "group",
    enablement = "enablement"
}
export interface ViewWelcome {
    readonly [ViewsWelcomeExtensionPointFields.view]: string;
    readonly [ViewsWelcomeExtensionPointFields.contents]: string;
    readonly [ViewsWelcomeExtensionPointFields.when]: string;
    readonly [ViewsWelcomeExtensionPointFields.group]: string;
    readonly [ViewsWelcomeExtensionPointFields.enablement]: string;
}
export type ViewsWelcomeExtensionPoint = ViewWelcome[];
export declare const ViewIdentifierMap: {
    [key: string]: string;
};
export declare const viewsWelcomeExtensionPointDescriptor: {
    extensionPoint: string;
    jsonSchema: Readonly<IConfigurationPropertySchema>;
};
