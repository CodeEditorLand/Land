import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IEditorSerializer } from '../../../../common/editor.js';
import { EditorInput } from '../../../../common/editor/editorInput.js';
import { ITextEditorService } from '../../../../services/textfile/common/textEditorService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IWorkingCopyIdentifier } from '../../../../services/workingCopy/common/workingCopy.js';
import { IWorkingCopyEditorHandler, IWorkingCopyEditorService } from '../../../../services/workingCopy/common/workingCopyEditorService.js';
import { FileEditorInput } from './fileEditorInput.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
export declare class FileEditorInputSerializer implements IEditorSerializer {
    canSerialize(editorInput: EditorInput): boolean;
    serialize(editorInput: EditorInput): string;
    deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): FileEditorInput;
}
export declare class FileEditorWorkingCopyEditorHandler extends Disposable implements IWorkbenchContribution, IWorkingCopyEditorHandler {
    private readonly textEditorService;
    private readonly fileService;
    static readonly ID = "workbench.contrib.fileEditorWorkingCopyEditorHandler";
    constructor(workingCopyEditorService: IWorkingCopyEditorService, textEditorService: ITextEditorService, fileService: IFileService);
    handles(workingCopy: IWorkingCopyIdentifier): boolean | Promise<boolean>;
    private handlesSync;
    isOpen(workingCopy: IWorkingCopyIdentifier, editor: EditorInput): boolean;
    createEditor(workingCopy: IWorkingCopyIdentifier): EditorInput;
}
