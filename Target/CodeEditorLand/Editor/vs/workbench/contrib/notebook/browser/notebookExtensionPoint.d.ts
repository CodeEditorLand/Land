import { ContributedNotebookRendererEntrypoint, RendererMessagingSpec } from '../common/notebookCommon.js';
declare const NotebookEditorContribution: Readonly<{
    type: "type";
    displayName: "displayName";
    selector: "selector";
    priority: "priority";
}>;
export interface INotebookEditorContribution {
    readonly [NotebookEditorContribution.type]: string;
    readonly [NotebookEditorContribution.displayName]: string;
    readonly [NotebookEditorContribution.selector]?: readonly {
        filenamePattern?: string;
        excludeFileNamePattern?: string;
    }[];
    readonly [NotebookEditorContribution.priority]?: string;
}
declare const NotebookRendererContribution: Readonly<{
    id: "id";
    displayName: "displayName";
    mimeTypes: "mimeTypes";
    entrypoint: "entrypoint";
    hardDependencies: "dependencies";
    optionalDependencies: "optionalDependencies";
    requiresMessaging: "requiresMessaging";
}>;
export interface INotebookRendererContribution {
    readonly [NotebookRendererContribution.id]?: string;
    readonly [NotebookRendererContribution.displayName]: string;
    readonly [NotebookRendererContribution.mimeTypes]?: readonly string[];
    readonly [NotebookRendererContribution.entrypoint]: ContributedNotebookRendererEntrypoint;
    readonly [NotebookRendererContribution.hardDependencies]: readonly string[];
    readonly [NotebookRendererContribution.optionalDependencies]: readonly string[];
    readonly [NotebookRendererContribution.requiresMessaging]: RendererMessagingSpec;
}
declare const NotebookPreloadContribution: Readonly<{
    type: "type";
    entrypoint: "entrypoint";
    localResourceRoots: "localResourceRoots";
}>;
interface INotebookPreloadContribution {
    readonly [NotebookPreloadContribution.type]: string;
    readonly [NotebookPreloadContribution.entrypoint]: string;
    readonly [NotebookPreloadContribution.localResourceRoots]: readonly string[];
}
export declare const notebooksExtensionPoint: import("../../../services/extensions/common/extensionsRegistry.js").IExtensionPoint<INotebookEditorContribution[]>;
export declare const notebookRendererExtensionPoint: import("../../../services/extensions/common/extensionsRegistry.js").IExtensionPoint<INotebookRendererContribution[]>;
export declare const notebookPreloadExtensionPoint: import("../../../services/extensions/common/extensionsRegistry.js").IExtensionPoint<INotebookPreloadContribution[]>;
export {};
