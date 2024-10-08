import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { Range } from '../../../common/core/range.js';
import { Selection } from '../../../common/core/selection.js';
import { LanguageFeatureRegistry } from '../../../common/languageFeatureRegistry.js';
import * as languages from '../../../common/languages.js';
import { ITextModel } from '../../../common/model.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IProgress } from '../../../../platform/progress/common/progress.js';
import { CodeActionItem, CodeActionSet, CodeActionTrigger } from '../common/types.js';
export declare const codeActionCommandId = "editor.action.codeAction";
export declare const quickFixCommandId = "editor.action.quickFix";
export declare const autoFixCommandId = "editor.action.autoFix";
export declare const refactorCommandId = "editor.action.refactor";
export declare const refactorPreviewCommandId = "editor.action.refactor.preview";
export declare const sourceActionCommandId = "editor.action.sourceAction";
export declare const organizeImportsCommandId = "editor.action.organizeImports";
export declare const fixAllCommandId = "editor.action.fixAll";
export declare function getCodeActions(registry: LanguageFeatureRegistry<languages.CodeActionProvider>, model: ITextModel, rangeOrSelection: Range | Selection, trigger: CodeActionTrigger, progress: IProgress<languages.CodeActionProvider>, token: CancellationToken): Promise<CodeActionSet>;
export declare enum ApplyCodeActionReason {
    OnSave = "onSave",
    FromProblemsView = "fromProblemsView",
    FromCodeActions = "fromCodeActions",
    FromAILightbulb = "fromAILightbulb",// direct invocation when clicking on the AI lightbulb
    FromProblemsHover = "fromProblemsHover"
}
export declare function applyCodeAction(accessor: ServicesAccessor, item: CodeActionItem, codeActionReason: ApplyCodeActionReason, options?: {
    readonly preview?: boolean;
    readonly editor?: ICodeEditor;
}, token?: CancellationToken): Promise<void>;
