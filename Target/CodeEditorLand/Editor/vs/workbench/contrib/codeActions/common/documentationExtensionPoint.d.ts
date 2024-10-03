import { IConfigurationPropertySchema } from '../../../../platform/configuration/common/configurationRegistry.js';
declare enum DocumentationExtensionPointFields {
    when = "when",
    title = "title",
    command = "command"
}
interface RefactoringDocumentationExtensionPoint {
    readonly [DocumentationExtensionPointFields.title]: string;
    readonly [DocumentationExtensionPointFields.when]: string;
    readonly [DocumentationExtensionPointFields.command]: string;
}
export interface DocumentationExtensionPoint {
    readonly refactoring?: readonly RefactoringDocumentationExtensionPoint[];
}
export declare const documentationExtensionPointDescriptor: {
    extensionPoint: string;
    deps: import("../../../services/extensions/common/extensionsRegistry.js").IExtensionPoint<import("../../../services/language/common/languageService.js").IRawLanguageExtensionPoint[]>[];
    jsonSchema: Readonly<IConfigurationPropertySchema>;
};
export {};
