import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import './media/testMessageColorizer.css';
import { CodeEditorWidget } from '../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
export declare const renderTestMessageAsText: (tm: string | IMarkdownString) => any;
export declare const colorizeTestMessageInEditor: (message: string, editor: CodeEditorWidget) => IDisposable;
