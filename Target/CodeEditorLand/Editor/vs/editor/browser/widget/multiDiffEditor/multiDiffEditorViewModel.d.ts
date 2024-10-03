import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable, ITransaction } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { ContextKeyValue } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Selection } from '../../../common/core/selection.js';
import { IDiffEditorViewModel } from '../../../common/editorCommon.js';
import { IModelService } from '../../../common/services/model.js';
import { RefCounted } from '../diffEditor/utils.js';
import { IDocumentDiffItem, IMultiDiffEditorModel } from './model.js';
export declare class MultiDiffEditorViewModel extends Disposable {
    readonly model: IMultiDiffEditorModel;
    private readonly _instantiationService;
    private readonly _documents;
    private readonly _documentsArr;
    readonly isLoading: IObservable<boolean, unknown>;
    readonly items: IObservable<readonly DocumentDiffItemViewModel[]>;
    readonly focusedDiffItem: IObservable<DocumentDiffItemViewModel | undefined, unknown>;
    readonly activeDiffItem: IObservable<DocumentDiffItemViewModel | undefined, unknown> & {
        clearCache(transaction: ITransaction): void;
        setCache(newValue: DocumentDiffItemViewModel | undefined, tx: ITransaction | undefined): void;
    };
    waitForDiffs(): Promise<void>;
    collapseAll(): void;
    expandAll(): void;
    get contextKeys(): Record<string, ContextKeyValue> | undefined;
    constructor(model: IMultiDiffEditorModel, _instantiationService: IInstantiationService);
}
export declare class DocumentDiffItemViewModel extends Disposable {
    private readonly _editorViewModel;
    private readonly _instantiationService;
    private readonly _modelService;
    readonly diffEditorViewModelRef: RefCounted<IDiffEditorViewModel>;
    get diffEditorViewModel(): IDiffEditorViewModel;
    readonly collapsed: import("../../../../base/common/observable.js").ISettableObservable<boolean, void>;
    readonly lastTemplateData: import("../../../../base/common/observable.js").ISettableObservable<{
        contentHeight: number;
        selections: Selection[] | undefined;
    }, void>;
    get originalUri(): URI | undefined;
    get modifiedUri(): URI | undefined;
    readonly isActive: IObservable<boolean>;
    private readonly _isFocusedSource;
    readonly isFocused: IObservable<boolean, unknown>;
    setIsFocused(source: IObservable<boolean>, tx: ITransaction | undefined): void;
    private readonly documentDiffItemRef;
    get documentDiffItem(): IDocumentDiffItem;
    readonly isAlive: import("../../../../base/common/observable.js").ISettableObservable<boolean, void>;
    constructor(documentDiffItem: RefCounted<IDocumentDiffItem>, _editorViewModel: MultiDiffEditorViewModel, _instantiationService: IInstantiationService, _modelService: IModelService);
    getKey(): string;
}
