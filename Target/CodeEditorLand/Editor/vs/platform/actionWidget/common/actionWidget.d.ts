import { IDisposable } from '../../../base/common/lifecycle.js';
export interface ActionSet<T> extends IDisposable {
    readonly validActions: readonly T[];
    readonly allActions: readonly T[];
    readonly hasAutoFix: boolean;
    readonly hasAIFix: boolean;
    readonly allAIFixes: boolean;
}
