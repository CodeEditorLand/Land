import { URI } from '../../../../base/common/uri.js';
import { ITextEditorOptions } from '../../../../platform/editor/common/editor.js';
import { TestResultItem } from './testTypes.js';
import { ITestResult } from './testResult.js';
import { IEditor } from '../../../../editor/common/editorCommon.js';
import { MutableObservableValue } from './observableValue.js';
export interface IShowResultOptions {
    inEditor?: IEditor;
    options?: Partial<ITextEditorOptions>;
}
export interface ITestingPeekOpener {
    _serviceBrand: undefined;
    historyVisible: MutableObservableValue<boolean>;
    tryPeekFirstError(result: ITestResult, test: TestResultItem, options?: Partial<ITextEditorOptions>): boolean;
    peekUri(uri: URI, options?: IShowResultOptions): boolean;
    openCurrentInEditor(): void;
    open(): void;
    closeAllPeeks(): void;
}
export declare const ITestingPeekOpener: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITestingPeekOpener>;
