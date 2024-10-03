import { IWillInstantiateEditorPaneEvent } from '../../../common/editor.js';
import { Event } from '../../../../base/common/event.js';
export declare const IEditorPaneService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEditorPaneService>;
export interface IEditorPaneService {
    readonly _serviceBrand: undefined;
    readonly onWillInstantiateEditorPane: Event<IWillInstantiateEditorPaneEvent>;
    didInstantiateEditorPane(typeId: string): boolean;
}
