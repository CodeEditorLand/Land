import { CancellationToken } from '../../../../base/common/cancellation.js';
import { HierarchicalKind } from '../../../../base/common/hierarchicalKind.js';
import { Position } from '../../../common/core/position.js';
import * as languages from '../../../common/languages.js';
import { ActionSet } from '../../../../platform/actionWidget/common/actionWidget.js';
export declare const CodeActionKind: {
    readonly QuickFix: HierarchicalKind;
    readonly Refactor: HierarchicalKind;
    readonly RefactorExtract: HierarchicalKind;
    readonly RefactorInline: HierarchicalKind;
    readonly RefactorMove: HierarchicalKind;
    readonly RefactorRewrite: HierarchicalKind;
    readonly Notebook: HierarchicalKind;
    readonly Source: HierarchicalKind;
    readonly SourceOrganizeImports: HierarchicalKind;
    readonly SourceFixAll: HierarchicalKind;
    readonly SurroundWith: HierarchicalKind;
};
export declare const enum CodeActionAutoApply {
    IfSingle = "ifSingle",
    First = "first",
    Never = "never"
}
export declare enum CodeActionTriggerSource {
    Refactor = "refactor",
    RefactorPreview = "refactor preview",
    Lightbulb = "lightbulb",
    Default = "other (default)",
    SourceAction = "source action",
    QuickFix = "quick fix action",
    FixAll = "fix all",
    OrganizeImports = "organize imports",
    AutoFix = "auto fix",
    QuickFixHover = "quick fix hover window",
    OnSave = "save participants",
    ProblemsView = "problems view"
}
export interface CodeActionFilter {
    readonly include?: HierarchicalKind;
    readonly excludes?: readonly HierarchicalKind[];
    readonly includeSourceActions?: boolean;
    readonly onlyIncludePreferredActions?: boolean;
}
export declare function mayIncludeActionsOfKind(filter: CodeActionFilter, providedKind: HierarchicalKind): boolean;
export declare function filtersAction(filter: CodeActionFilter, action: languages.CodeAction): boolean;
export interface CodeActionTrigger {
    readonly type: languages.CodeActionTriggerType;
    readonly triggerAction: CodeActionTriggerSource;
    readonly filter?: CodeActionFilter;
    readonly autoApply?: CodeActionAutoApply;
    readonly context?: {
        readonly notAvailableMessage: string;
        readonly position: Position;
    };
}
export declare class CodeActionCommandArgs {
    readonly kind: HierarchicalKind;
    readonly apply: CodeActionAutoApply;
    readonly preferred: boolean;
    static fromUser(arg: any, defaults: {
        kind: HierarchicalKind;
        apply: CodeActionAutoApply;
    }): CodeActionCommandArgs;
    private static getApplyFromUser;
    private static getKindFromUser;
    private static getPreferredUser;
    private constructor();
}
export declare class CodeActionItem {
    readonly action: languages.CodeAction;
    readonly provider: languages.CodeActionProvider | undefined;
    highlightRange?: boolean | undefined;
    constructor(action: languages.CodeAction, provider: languages.CodeActionProvider | undefined, highlightRange?: boolean | undefined);
    resolve(token: CancellationToken): Promise<this>;
}
export interface CodeActionSet extends ActionSet<CodeActionItem> {
    readonly validActions: readonly CodeActionItem[];
    readonly allActions: readonly CodeActionItem[];
    readonly documentation: readonly languages.Command[];
}
