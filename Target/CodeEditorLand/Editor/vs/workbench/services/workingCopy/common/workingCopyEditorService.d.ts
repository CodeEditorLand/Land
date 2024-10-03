import { Event } from '../../../../base/common/event.js';
import { IEditorIdentifier } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IWorkingCopy, IWorkingCopyIdentifier } from './workingCopy.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IEditorService } from '../../editor/common/editorService.js';
export declare const IWorkingCopyEditorService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkingCopyEditorService>;
export interface IWorkingCopyEditorHandler {
    handles(workingCopy: IWorkingCopyIdentifier): boolean | Promise<boolean>;
    isOpen(workingCopy: IWorkingCopyIdentifier, editor: EditorInput): boolean;
    createEditor(workingCopy: IWorkingCopyIdentifier): EditorInput | Promise<EditorInput>;
}
export interface IWorkingCopyEditorService {
    readonly _serviceBrand: undefined;
    readonly onDidRegisterHandler: Event<IWorkingCopyEditorHandler>;
    registerHandler(handler: IWorkingCopyEditorHandler): IDisposable;
    findEditor(workingCopy: IWorkingCopy): IEditorIdentifier | undefined;
}
export declare class WorkingCopyEditorService extends Disposable implements IWorkingCopyEditorService {
    private readonly editorService;
    readonly _serviceBrand: undefined;
    private readonly _onDidRegisterHandler;
    readonly onDidRegisterHandler: Event<IWorkingCopyEditorHandler>;
    private readonly handlers;
    constructor(editorService: IEditorService);
    registerHandler(handler: IWorkingCopyEditorHandler): IDisposable;
    findEditor(workingCopy: IWorkingCopy): IEditorIdentifier | undefined;
    private isOpen;
}
