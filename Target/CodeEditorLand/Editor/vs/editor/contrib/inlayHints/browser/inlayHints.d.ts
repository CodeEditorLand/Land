import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Range } from '../../../common/core/range.js';
import { LanguageFeatureRegistry } from '../../../common/languageFeatureRegistry.js';
import { InlayHint, InlayHintsProvider, Command } from '../../../common/languages.js';
import { ITextModel } from '../../../common/model.js';
export declare class InlayHintAnchor {
    readonly range: Range;
    readonly direction: 'before' | 'after';
    constructor(range: Range, direction: 'before' | 'after');
}
export declare class InlayHintItem {
    readonly hint: InlayHint;
    readonly anchor: InlayHintAnchor;
    readonly provider: InlayHintsProvider;
    private _isResolved;
    private _currentResolve?;
    constructor(hint: InlayHint, anchor: InlayHintAnchor, provider: InlayHintsProvider);
    with(delta: {
        anchor: InlayHintAnchor;
    }): InlayHintItem;
    resolve(token: CancellationToken): Promise<void>;
    private _doResolve;
}
export declare class InlayHintsFragments {
    private static _emptyInlayHintList;
    static create(registry: LanguageFeatureRegistry<InlayHintsProvider>, model: ITextModel, ranges: Range[], token: CancellationToken): Promise<InlayHintsFragments>;
    private readonly _disposables;
    readonly items: readonly InlayHintItem[];
    readonly ranges: readonly Range[];
    readonly provider: Set<InlayHintsProvider>;
    private constructor();
    dispose(): void;
    private static _getRangeAtPosition;
}
export declare function asCommandLink(command: Command): string;
