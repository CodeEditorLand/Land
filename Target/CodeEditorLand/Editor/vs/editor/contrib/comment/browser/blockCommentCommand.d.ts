import { ISingleEditOperation } from '../../../common/core/editOperation.js';
import { Range } from '../../../common/core/range.js';
import { Selection } from '../../../common/core/selection.js';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from '../../../common/editorCommon.js';
import { ITextModel } from '../../../common/model.js';
import { ILanguageConfigurationService } from '../../../common/languages/languageConfigurationRegistry.js';
export declare class BlockCommentCommand implements ICommand {
    private readonly languageConfigurationService;
    private readonly _selection;
    private readonly _insertSpace;
    private _usedEndToken;
    constructor(selection: Selection, insertSpace: boolean, languageConfigurationService: ILanguageConfigurationService);
    static _haystackHasNeedleAtOffset(haystack: string, needle: string, offset: number): boolean;
    private _createOperationsForBlockComment;
    static _createRemoveBlockCommentOperations(r: Range, startToken: string, endToken: string): ISingleEditOperation[];
    static _createAddBlockCommentOperations(r: Range, startToken: string, endToken: string, insertSpace: boolean): ISingleEditOperation[];
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
