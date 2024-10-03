import { URI } from '../../../../base/common/uri.js';
import { ITextEditorPane } from '../../../common/editor.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ITextEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IEditorOptions as ICodeEditorOptions } from '../../../../editor/common/config/editorOptions.js';
import { ICodeEditorWidgetOptions } from '../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { IEditorViewState } from '../../../../editor/common/editorCommon.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { AbstractTextEditor } from './textEditor.js';
import { Dimension } from '../../../../base/browser/dom.js';
export declare abstract class AbstractTextCodeEditor<T extends IEditorViewState> extends AbstractTextEditor<T> implements ITextEditorPane {
    protected editorControl: ICodeEditor | undefined;
    get scopedContextKeyService(): IContextKeyService | undefined;
    getTitle(): string;
    protected createEditorControl(parent: HTMLElement, initialOptions: ICodeEditorOptions): void;
    protected getCodeEditorWidgetOptions(): ICodeEditorWidgetOptions;
    protected updateEditorControlOptions(options: ICodeEditorOptions): void;
    protected getMainControl(): ICodeEditor | undefined;
    getControl(): ICodeEditor | undefined;
    protected computeEditorViewState(resource: URI): T | undefined;
    setOptions(options: ITextEditorOptions | undefined): void;
    focus(): void;
    hasFocus(): boolean;
    protected setEditorVisible(visible: boolean): void;
    layout(dimension: Dimension): void;
}
