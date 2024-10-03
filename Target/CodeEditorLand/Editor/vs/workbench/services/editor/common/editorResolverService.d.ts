import * as glob from '../../../../base/common/glob.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IResourceEditorInput, ITextResourceEditorInput } from '../../../../platform/editor/common/editor.js';
import { EditorInputWithOptions, EditorInputWithOptionsAndGroup, IResourceDiffEditorInput, IResourceMultiDiffEditorInput, IResourceMergeEditorInput, IUntitledTextResourceEditorInput, IUntypedEditorInput } from '../../../common/editor.js';
import { IEditorGroup } from './editorGroupsService.js';
import { PreferredGroup } from './editorService.js';
import { AtLeastOne } from '../../../../base/common/types.js';
export declare const IEditorResolverService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEditorResolverService>;
export type EditorAssociation = {
    readonly viewType: string;
    readonly filenamePattern?: string;
};
export type EditorAssociations = readonly EditorAssociation[];
export declare const editorsAssociationsSettingId = "workbench.editorAssociations";
export interface IEditorType {
    readonly id: string;
    readonly displayName: string;
    readonly providerDisplayName: string;
}
export declare enum RegisteredEditorPriority {
    builtin = "builtin",
    option = "option",
    exclusive = "exclusive",
    default = "default"
}
export declare const enum ResolvedStatus {
    ABORT = 1,
    NONE = 2
}
export type ResolvedEditor = EditorInputWithOptionsAndGroup | ResolvedStatus;
export type RegisteredEditorOptions = {
    singlePerResource?: boolean | (() => boolean);
    canSupportResource?: (resource: URI) => boolean;
};
export type RegisteredEditorInfo = {
    id: string;
    label: string;
    detail?: string;
    priority: RegisteredEditorPriority;
};
type EditorInputFactoryResult = EditorInputWithOptions | Promise<EditorInputWithOptions>;
export type EditorInputFactoryFunction = (editorInput: IResourceEditorInput | ITextResourceEditorInput, group: IEditorGroup) => EditorInputFactoryResult;
export type UntitledEditorInputFactoryFunction = (untitledEditorInput: IUntitledTextResourceEditorInput, group: IEditorGroup) => EditorInputFactoryResult;
export type DiffEditorInputFactoryFunction = (diffEditorInput: IResourceDiffEditorInput, group: IEditorGroup) => EditorInputFactoryResult;
export type MultiDiffEditorInputFactoryFunction = (multiDiffEditorInput: IResourceMultiDiffEditorInput, group: IEditorGroup) => EditorInputFactoryResult;
export type MergeEditorInputFactoryFunction = (mergeEditorInput: IResourceMergeEditorInput, group: IEditorGroup) => EditorInputFactoryResult;
type EditorInputFactories = {
    createEditorInput?: EditorInputFactoryFunction;
    createUntitledEditorInput?: UntitledEditorInputFactoryFunction;
    createDiffEditorInput?: DiffEditorInputFactoryFunction;
    createMultiDiffEditorInput?: MultiDiffEditorInputFactoryFunction;
    createMergeEditorInput?: MergeEditorInputFactoryFunction;
};
export type EditorInputFactoryObject = AtLeastOne<EditorInputFactories>;
export interface IEditorResolverService {
    readonly _serviceBrand: undefined;
    getAssociationsForResource(resource: URI): EditorAssociations;
    updateUserAssociations(globPattern: string, editorID: string): void;
    readonly onDidChangeEditorRegistrations: Event<void>;
    bufferChangeEvents(callback: Function): void;
    registerEditor(globPattern: string | glob.IRelativePattern, editorInfo: RegisteredEditorInfo, options: RegisteredEditorOptions, editorFactoryObject: EditorInputFactoryObject): IDisposable;
    resolveEditor(editor: IUntypedEditorInput, preferredGroup: PreferredGroup | undefined): Promise<ResolvedEditor>;
    getEditors(resource: URI): RegisteredEditorInfo[];
    getEditors(): RegisteredEditorInfo[];
    getAllUserAssociations(): EditorAssociations;
}
export declare function priorityToRank(priority: RegisteredEditorPriority): number;
export declare function globMatchesResource(globPattern: string | glob.IRelativePattern, resource: URI): boolean;
export {};
