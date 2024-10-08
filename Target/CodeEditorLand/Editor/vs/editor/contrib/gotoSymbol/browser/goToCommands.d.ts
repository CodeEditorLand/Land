import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IActiveCodeEditor, ICodeEditor } from '../../../browser/editorBrowser.js';
import { EditorAction2, ServicesAccessor } from '../../../browser/editorExtensions.js';
import { GoToLocationValues } from '../../../common/config/editorOptions.js';
import * as corePosition from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import { ITextModel } from '../../../common/model.js';
import { ReferencesModel } from './referencesModel.js';
import { IAction2F1RequiredOptions, IAction2Options } from '../../../../platform/actions/common/actions.js';
import { IWordAtPosition } from '../../../common/core/wordHelper.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
export interface SymbolNavigationActionConfig {
    openToSide: boolean;
    openInPeek: boolean;
    muteMessage: boolean;
}
export declare class SymbolNavigationAnchor {
    readonly model: ITextModel;
    readonly position: corePosition.Position;
    static is(thing: any): thing is SymbolNavigationAnchor;
    constructor(model: ITextModel, position: corePosition.Position);
}
export declare abstract class SymbolNavigationAction extends EditorAction2 {
    private static _allSymbolNavigationCommands;
    private static _activeAlternativeCommands;
    static all(): IterableIterator<SymbolNavigationAction>;
    private static _patchConfig;
    readonly configuration: SymbolNavigationActionConfig;
    constructor(configuration: SymbolNavigationActionConfig, opts: IAction2Options & IAction2F1RequiredOptions);
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, arg?: SymbolNavigationAnchor | unknown, range?: Range): Promise<void>;
    protected abstract _getLocationModel(languageFeaturesService: ILanguageFeaturesService, model: ITextModel, position: corePosition.Position, token: CancellationToken): Promise<ReferencesModel | undefined>;
    protected abstract _getNoResultFoundMessage(info: IWordAtPosition | null): string;
    protected abstract _getAlternativeCommand(editor: IActiveCodeEditor): string;
    protected abstract _getGoToPreference(editor: IActiveCodeEditor): GoToLocationValues;
    private _onResult;
    private _openReference;
    private _openInPeek;
}
export declare class DefinitionAction extends SymbolNavigationAction {
    protected _getLocationModel(languageFeaturesService: ILanguageFeaturesService, model: ITextModel, position: corePosition.Position, token: CancellationToken): Promise<ReferencesModel>;
    protected _getNoResultFoundMessage(info: IWordAtPosition | null): string;
    protected _getAlternativeCommand(editor: IActiveCodeEditor): string;
    protected _getGoToPreference(editor: IActiveCodeEditor): GoToLocationValues;
}
