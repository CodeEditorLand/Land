import { IAuxiliaryTitlebarPart, ITitlebarPart } from '../../../browser/parts/titlebar/titlebarPart.js';
import { IEditorGroupsContainer } from '../../editor/common/editorGroupsService.js';
export declare const ITitleService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITitleService>;
export interface ITitleService extends ITitlebarPart {
    readonly _serviceBrand: undefined;
    getPart(container: HTMLElement): ITitlebarPart;
    createAuxiliaryTitlebarPart(container: HTMLElement, editorGroupsContainer: IEditorGroupsContainer): IAuxiliaryTitlebarPart;
}
