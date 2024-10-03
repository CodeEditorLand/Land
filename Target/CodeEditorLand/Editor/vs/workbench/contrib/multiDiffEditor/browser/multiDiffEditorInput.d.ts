import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { IDocumentDiffItem } from '../../../../editor/browser/widget/multiDiffEditor/model.js';
import { MultiDiffEditorViewModel } from '../../../../editor/browser/widget/multiDiffEditor/multiDiffEditorViewModel.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { EditorInputCapabilities, GroupIdentifier, IEditorSerializer, IResourceMultiDiffEditorInput, IRevertOptions, ISaveOptions, IUntypedEditorInput } from '../../../common/editor.js';
import { EditorInput, IEditorCloseHandler } from '../../../common/editor/editorInput.js';
import { IEditorResolverService } from '../../../services/editor/common/editorResolverService.js';
import { ILanguageSupport, ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { IMultiDiffSourceResolverService, MultiDiffEditorItem } from './multiDiffSourceResolverService.js';
export declare class MultiDiffEditorInput extends EditorInput implements ILanguageSupport {
    readonly multiDiffSource: URI;
    readonly label: string | undefined;
    readonly initialResources: readonly MultiDiffEditorItem[] | undefined;
    readonly isTransient: boolean;
    private readonly _textModelService;
    private readonly _textResourceConfigurationService;
    private readonly _instantiationService;
    private readonly _multiDiffSourceResolverService;
    private readonly _textFileService;
    static fromResourceMultiDiffEditorInput(input: IResourceMultiDiffEditorInput, instantiationService: IInstantiationService): MultiDiffEditorInput;
    static fromSerialized(data: ISerializedMultiDiffEditorInput, instantiationService: IInstantiationService): MultiDiffEditorInput;
    static readonly ID: string;
    get resource(): URI | undefined;
    get capabilities(): EditorInputCapabilities;
    get typeId(): string;
    private _name;
    getName(): string;
    get editorId(): string;
    getIcon(): ThemeIcon;
    constructor(multiDiffSource: URI, label: string | undefined, initialResources: readonly MultiDiffEditorItem[] | undefined, isTransient: boolean | undefined, _textModelService: ITextModelService, _textResourceConfigurationService: ITextResourceConfigurationService, _instantiationService: IInstantiationService, _multiDiffSourceResolverService: IMultiDiffSourceResolverService, _textFileService: ITextFileService);
    serialize(): ISerializedMultiDiffEditorInput;
    setLanguageId(languageId: string, source?: string | undefined): void;
    getViewModel(): Promise<MultiDiffEditorViewModel>;
    private readonly _viewModel;
    private _createModel;
    private readonly _resolvedSource;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    readonly resources: import("../../../../base/common/observable.js").IObservable<readonly MultiDiffEditorItem[] | undefined, unknown>;
    private readonly textFileServiceOnDidChange;
    private readonly _isDirtyObservables;
    private readonly _isDirtyObservable;
    readonly onDidChangeDirty: Event<void>;
    isDirty(): boolean;
    save(group: number, options?: ISaveOptions | undefined): Promise<EditorInput>;
    revert(group: GroupIdentifier, options?: IRevertOptions): Promise<void>;
    private doSaveOrRevert;
    readonly closeHandler: IEditorCloseHandler;
}
export interface IDocumentDiffItemWithMultiDiffEditorItem extends IDocumentDiffItem {
    multiDiffEditorItem: MultiDiffEditorItem;
}
export declare class MultiDiffEditorResolverContribution extends Disposable {
    static readonly ID = "workbench.contrib.multiDiffEditorResolver";
    constructor(editorResolverService: IEditorResolverService, instantiationService: IInstantiationService);
}
interface ISerializedMultiDiffEditorInput {
    multiDiffSourceUri: string;
    label: string | undefined;
    resources: {
        originalUri: string | undefined;
        modifiedUri: string | undefined;
        goToFileUri: string | undefined;
    }[] | undefined;
}
export declare class MultiDiffEditorSerializer implements IEditorSerializer {
    canSerialize(editor: EditorInput): editor is MultiDiffEditorInput;
    serialize(editor: MultiDiffEditorInput): string | undefined;
    deserialize(instantiationService: IInstantiationService, serializedEditor: string): EditorInput | undefined;
}
export {};
