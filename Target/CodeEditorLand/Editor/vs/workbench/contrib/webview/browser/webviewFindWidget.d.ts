import { Event } from '../../../../base/common/event.js';
import { IContextKey, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { SimpleFindWidget } from '../../codeEditor/browser/find/simpleFindWidget.js';
export interface WebviewFindDelegate {
    readonly hasFindResult: Event<boolean>;
    readonly onDidStopFind: Event<void>;
    readonly checkImeCompletionState: boolean;
    find(value: string, previous: boolean): void;
    updateFind(value: string): void;
    stopFind(keepSelection?: boolean): void;
    focus(): void;
}
export declare class WebviewFindWidget extends SimpleFindWidget {
    private readonly _delegate;
    protected _getResultCount(dataChanged?: boolean): Promise<{
        resultIndex: number;
        resultCount: number;
    } | undefined>;
    protected readonly _findWidgetFocused: IContextKey<boolean>;
    constructor(_delegate: WebviewFindDelegate, contextViewService: IContextViewService, contextKeyService: IContextKeyService, hoverService: IHoverService, keybindingService: IKeybindingService);
    find(previous: boolean): void;
    hide(animated?: boolean): void;
    protected _onInputChanged(): boolean;
    protected _onFocusTrackerFocus(): void;
    protected _onFocusTrackerBlur(): void;
    protected _onFindInputFocusTrackerFocus(): void;
    protected _onFindInputFocusTrackerBlur(): void;
    findFirst(): void;
}
