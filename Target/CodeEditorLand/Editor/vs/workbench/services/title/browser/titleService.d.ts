import { IAuxiliaryTitlebarPart, ITitlebarPart } from '../../../browser/parts/titlebar/titlebarPart.js';
import { IEditorGroupsContainer } from '../../editor/common/editorGroupsService.js';
export declare const ITitleService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITitleService>;
export interface ITitleService extends ITitlebarPart {
    readonly _serviceBrand: undefined;
    /**
     * Get the status bar part that is rooted in the provided container.
     */
    getPart(container: HTMLElement): ITitlebarPart;
    /**
     * Creates a new auxililary title bar part in the provided container.
     */
    createAuxiliaryTitlebarPart(container: HTMLElement, editorGroupsContainer: IEditorGroupsContainer): IAuxiliaryTitlebarPart;
}
