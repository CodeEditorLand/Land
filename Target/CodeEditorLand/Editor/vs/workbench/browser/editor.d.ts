import { IEditorDescriptor as ICommonEditorDescriptor, IWillInstantiateEditorPaneEvent } from '../common/editor.js';
import { EditorInput } from '../common/editor/editorInput.js';
import { SyncDescriptor } from '../../platform/instantiation/common/descriptors.js';
import { EditorPane } from './parts/editor/editorPane.js';
import { IInstantiationService, BrandedService, ServicesAccessor } from '../../platform/instantiation/common/instantiation.js';
import { IDisposable } from '../../base/common/lifecycle.js';
import { URI } from '../../base/common/uri.js';
import { IEditorGroup } from '../services/editor/common/editorGroupsService.js';
export interface IEditorPaneDescriptor extends ICommonEditorDescriptor<EditorPane> {
}
export interface IEditorPaneRegistry {
    registerEditorPane(editorPaneDescriptor: IEditorPaneDescriptor, editorDescriptors: readonly SyncDescriptor<EditorInput>[]): IDisposable;
    getEditorPane(editor: EditorInput): IEditorPaneDescriptor | undefined;
}
export declare class EditorPaneDescriptor implements IEditorPaneDescriptor {
    private readonly ctor;
    readonly typeId: string;
    readonly name: string;
    private static readonly instantiatedEditorPanes;
    static didInstantiateEditorPane(typeId: string): boolean;
    private static readonly _onWillInstantiateEditorPane;
    static readonly onWillInstantiateEditorPane: import("../workbench.web.main.internal.js").Event<IWillInstantiateEditorPaneEvent>;
    static create<Services extends BrandedService[]>(ctor: {
        new (group: IEditorGroup, ...services: Services): EditorPane;
    }, typeId: string, name: string): EditorPaneDescriptor;
    private constructor();
    instantiate(instantiationService: IInstantiationService, group: IEditorGroup): EditorPane;
    describes(editorPane: EditorPane): boolean;
}
export declare class EditorPaneRegistry implements IEditorPaneRegistry {
    private readonly mapEditorPanesToEditors;
    registerEditorPane(editorPaneDescriptor: EditorPaneDescriptor, editorDescriptors: readonly SyncDescriptor<EditorInput>[]): IDisposable;
    getEditorPane(editor: EditorInput): EditorPaneDescriptor | undefined;
    private findEditorPaneDescriptors;
    getEditorPaneByType(typeId: string): EditorPaneDescriptor | undefined;
    getEditorPanes(): readonly EditorPaneDescriptor[];
    getEditors(): SyncDescriptor<EditorInput>[];
}
export declare function whenEditorClosed(accessor: ServicesAccessor, resources: URI[]): Promise<void>;
export declare function computeEditorAriaLabel(input: EditorInput, index: number | undefined, group: IEditorGroup | undefined, groupCount: number | undefined): string;
