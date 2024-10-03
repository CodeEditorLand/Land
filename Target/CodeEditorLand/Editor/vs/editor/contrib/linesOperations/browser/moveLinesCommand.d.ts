import { EditorAutoIndentStrategy } from '../../../common/config/editorOptions.js';
import { Selection } from '../../../common/core/selection.js';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from '../../../common/editorCommon.js';
import { ITextModel } from '../../../common/model.js';
import { ILanguageConfigurationService } from '../../../common/languages/languageConfigurationRegistry.js';
export declare class MoveLinesCommand implements ICommand {
    private readonly _languageConfigurationService;
    private readonly _selection;
    private readonly _isMovingDown;
    private readonly _autoIndent;
    private _selectionId;
    private _moveEndPositionDown?;
    private _moveEndLineSelectionShrink;
    constructor(selection: Selection, isMovingDown: boolean, autoIndent: EditorAutoIndentStrategy, _languageConfigurationService: ILanguageConfigurationService);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    private buildIndentConverter;
    private parseEnterResult;
    private matchEnterRuleMovingDown;
    private matchEnterRule;
    private trimStart;
    private shouldAutoIndent;
    private getIndentEditsOfMovingBlock;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
