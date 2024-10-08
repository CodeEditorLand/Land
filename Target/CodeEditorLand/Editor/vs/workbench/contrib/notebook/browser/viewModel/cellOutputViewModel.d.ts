import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ICellOutputViewModel, IGenericCellViewModel } from '../notebookBrowser.js';
import { NotebookTextModel } from '../../common/model/notebookTextModel.js';
import { ICellOutput, IOrderedMimeType } from '../../common/notebookCommon.js';
import { INotebookService } from '../../common/notebookService.js';
export declare class CellOutputViewModel extends Disposable implements ICellOutputViewModel {
    readonly cellViewModel: IGenericCellViewModel;
    private readonly _outputRawData;
    private readonly _notebookService;
    private _onDidResetRendererEmitter;
    readonly onDidResetRenderer: import("../../../../workbench.web.main.internal.js").Event<void>;
    private alwaysShow;
    visible: import("../../../../../base/common/observable.js").ISettableObservable<boolean, void>;
    setVisible(visible?: boolean, force?: boolean): void;
    outputHandle: number;
    get model(): ICellOutput;
    private _pickedMimeType;
    get pickedMimeType(): IOrderedMimeType | undefined;
    set pickedMimeType(value: IOrderedMimeType | undefined);
    constructor(cellViewModel: IGenericCellViewModel, _outputRawData: ICellOutput, _notebookService: INotebookService);
    hasMultiMimeType(): boolean;
    resolveMimeTypes(textModel: NotebookTextModel, kernelProvides: readonly string[] | undefined): [readonly IOrderedMimeType[], number];
    resetRenderer(): void;
    toRawJSON(): {
        outputs: import("../../common/notebookCommon.js").IOutputItemDto[];
    };
}
