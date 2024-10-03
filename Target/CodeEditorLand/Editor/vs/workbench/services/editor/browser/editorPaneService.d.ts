import { IEditorPaneService } from '../common/editorPaneService.js';
export declare class EditorPaneService implements IEditorPaneService {
    readonly _serviceBrand: undefined;
    readonly onWillInstantiateEditorPane: import("../../../workbench.web.main.internal.js").Event<import("../../../common/editor.js").IWillInstantiateEditorPaneEvent>;
    didInstantiateEditorPane(typeId: string): boolean;
}
