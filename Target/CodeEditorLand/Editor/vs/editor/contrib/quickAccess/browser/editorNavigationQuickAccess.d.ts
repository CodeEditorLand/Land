import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IRange } from '../../../common/core/range.js';
import { IDiffEditor, IEditor } from '../../../common/editorCommon.js';
import { ITextModel } from '../../../common/model.js';
import { IQuickAccessProvider, IQuickAccessProviderRunOptions } from '../../../../platform/quickinput/common/quickAccess.js';
import { IKeyMods, IQuickPick, IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
export interface IEditorNavigationQuickAccessOptions {
    canAcceptInBackground?: boolean;
}
export interface IQuickAccessTextEditorContext {
    readonly editor: IEditor;
    restoreViewState?: () => void;
}
export declare abstract class AbstractEditorNavigationQuickAccessProvider implements IQuickAccessProvider {
    protected options?: IEditorNavigationQuickAccessOptions | undefined;
    constructor(options?: IEditorNavigationQuickAccessOptions | undefined);
    provide(picker: IQuickPick<IQuickPickItem, {
        useSeparators: true;
    }>, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): IDisposable;
    private doProvide;
    protected canProvideWithTextEditor(editor: IEditor): boolean;
    protected abstract provideWithTextEditor(context: IQuickAccessTextEditorContext, picker: IQuickPick<IQuickPickItem, {
        useSeparators: true;
    }>, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): IDisposable;
    protected abstract provideWithoutTextEditor(picker: IQuickPick<IQuickPickItem, {
        useSeparators: true;
    }>, token: CancellationToken): IDisposable;
    protected gotoLocation({ editor }: IQuickAccessTextEditorContext, options: {
        range: IRange;
        keyMods: IKeyMods;
        forceSideBySide?: boolean;
        preserveFocus?: boolean;
    }): void;
    protected getModel(editor: IEditor | IDiffEditor): ITextModel | undefined;
    protected abstract readonly onDidActiveTextEditorControlChange: Event<void>;
    protected abstract activeTextEditorControl: IEditor | undefined;
    private rangeHighlightDecorationId;
    addDecorations(editor: IEditor, range: IRange): void;
    clearDecorations(editor: IEditor): void;
}
