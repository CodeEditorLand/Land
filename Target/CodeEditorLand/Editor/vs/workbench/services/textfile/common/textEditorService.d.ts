import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IFileEditorInput, IUntypedEditorInput, IUntypedFileEditorInput } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IUntitledTextEditorService } from '../../untitled/common/untitledTextEditorService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IEditorResolverService } from '../../editor/common/editorResolverService.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export declare const ITextEditorService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITextEditorService>;
export interface ITextEditorService {
    readonly _serviceBrand: undefined;
    createTextEditor(input: IUntypedEditorInput): EditorInput;
    createTextEditor(input: IUntypedFileEditorInput): IFileEditorInput;
    resolveTextEditor(input: IUntypedEditorInput): Promise<EditorInput>;
    resolveTextEditor(input: IUntypedFileEditorInput): Promise<IFileEditorInput>;
}
export declare class TextEditorService extends Disposable implements ITextEditorService {
    private readonly untitledTextEditorService;
    private readonly instantiationService;
    private readonly uriIdentityService;
    private readonly fileService;
    private readonly editorResolverService;
    readonly _serviceBrand: undefined;
    private readonly editorInputCache;
    private readonly fileEditorFactory;
    constructor(untitledTextEditorService: IUntitledTextEditorService, instantiationService: IInstantiationService, uriIdentityService: IUriIdentityService, fileService: IFileService, editorResolverService: IEditorResolverService);
    private registerDefaultEditor;
    resolveTextEditor(input: IUntypedEditorInput): Promise<EditorInput>;
    resolveTextEditor(input: IUntypedFileEditorInput): Promise<IFileEditorInput>;
    createTextEditor(input: IUntypedEditorInput): EditorInput;
    createTextEditor(input: IUntypedFileEditorInput): IFileEditorInput;
    private createOrGetCached;
}
