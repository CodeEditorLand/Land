import { Event } from '../../../../base/common/event.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { AccessibleViewType, AccessibleViewProviderId, IAccessibleViewContentProvider } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplentation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { InlineCompletionsModel } from './model/inlineCompletionsModel.js';
export declare class InlineCompletionsAccessibleView implements IAccessibleViewImplentation {
    readonly type = AccessibleViewType.View;
    readonly priority = 95;
    readonly name = "inline-completions";
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
    getProvider(accessor: ServicesAccessor): InlineCompletionsAccessibleViewContentProvider | undefined;
}
declare class InlineCompletionsAccessibleViewContentProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _editor;
    private readonly _model;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<void>;
    constructor(_editor: ICodeEditor, _model: InlineCompletionsModel);
    readonly id = AccessibleViewProviderId.InlineCompletions;
    readonly verbositySettingKey = "accessibility.verbosity.inlineCompletions";
    readonly options: {
        language: string | undefined;
        type: AccessibleViewType;
    };
    provideContent(): string;
    provideNextContent(): string | undefined;
    providePreviousContent(): string | undefined;
    onClose(): void;
}
export {};
