import { IModelService } from './model.js';
import { ITextModelService } from './resolverService.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { IUndoRedoService } from '../../../platform/undoRedo/common/undoRedo.js';
import { IUndoRedoDelegate, MultiModelEditStackElement } from '../model/editStack.js';
export declare class ModelUndoRedoParticipant extends Disposable implements IUndoRedoDelegate {
    private readonly _modelService;
    private readonly _textModelService;
    private readonly _undoRedoService;
    constructor(_modelService: IModelService, _textModelService: ITextModelService, _undoRedoService: IUndoRedoService);
    prepareUndoRedo(element: MultiModelEditStackElement): IDisposable | Promise<IDisposable>;
}
