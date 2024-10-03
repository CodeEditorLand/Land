import { IEditorOptions } from '../../../../editor/common/config/editorOptions.js';
import { ICodeEditorWidgetOptions } from '../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
export declare function getSimpleEditorOptions(configurationService: IConfigurationService): IEditorOptions;
export declare function getSimpleCodeEditorWidgetOptions(): ICodeEditorWidgetOptions;
export declare function setupSimpleEditorSelectionStyling(editorContainerSelector: string): IDisposable;
