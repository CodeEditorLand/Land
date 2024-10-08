import { Selection } from '../../../common/core/selection.js';
import { ITextModel } from '../../../common/model.js';
import { ILanguageConfigurationService } from '../../../common/languages/languageConfigurationRegistry.js';
import { Variable, VariableResolver } from './snippetParser.js';
import { OvertypingCapturer } from '../../suggest/browser/suggestOvertypingCapturer.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
export declare const KnownSnippetVariableNames: Readonly<{
    [key: string]: true;
}>;
export declare class CompositeSnippetVariableResolver implements VariableResolver {
    private readonly _delegates;
    constructor(_delegates: VariableResolver[]);
    resolve(variable: Variable): string | undefined;
}
export declare class SelectionBasedVariableResolver implements VariableResolver {
    private readonly _model;
    private readonly _selection;
    private readonly _selectionIdx;
    private readonly _overtypingCapturer;
    constructor(_model: ITextModel, _selection: Selection, _selectionIdx: number, _overtypingCapturer: OvertypingCapturer | undefined);
    resolve(variable: Variable): string | undefined;
}
export declare class ModelBasedVariableResolver implements VariableResolver {
    private readonly _labelService;
    private readonly _model;
    constructor(_labelService: ILabelService, _model: ITextModel);
    resolve(variable: Variable): string | undefined;
}
export interface IReadClipboardText {
    (): string | undefined;
}
export declare class ClipboardBasedVariableResolver implements VariableResolver {
    private readonly _readClipboardText;
    private readonly _selectionIdx;
    private readonly _selectionCount;
    private readonly _spread;
    constructor(_readClipboardText: IReadClipboardText, _selectionIdx: number, _selectionCount: number, _spread: boolean);
    resolve(variable: Variable): string | undefined;
}
export declare class CommentBasedVariableResolver implements VariableResolver {
    private readonly _model;
    private readonly _selection;
    private readonly _languageConfigurationService;
    constructor(_model: ITextModel, _selection: Selection, _languageConfigurationService: ILanguageConfigurationService);
    resolve(variable: Variable): string | undefined;
}
export declare class TimeBasedVariableResolver implements VariableResolver {
    private static readonly dayNames;
    private static readonly dayNamesShort;
    private static readonly monthNames;
    private static readonly monthNamesShort;
    private readonly _date;
    resolve(variable: Variable): string | undefined;
}
export declare class WorkspaceBasedVariableResolver implements VariableResolver {
    private readonly _workspaceService;
    constructor(_workspaceService: IWorkspaceContextService | undefined);
    resolve(variable: Variable): string | undefined;
    private _resolveWorkspaceName;
    private _resoveWorkspacePath;
}
export declare class RandomBasedVariableResolver implements VariableResolver {
    resolve(variable: Variable): string | undefined;
}
