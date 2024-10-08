import { IEditorOptions } from '../../../../editor/common/config/editorOptions.js';
import { ICodeEditorWidgetOptions } from '../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
export declare function getSimpleEditorOptions(configurationService: IConfigurationService): IEditorOptions;
export declare function getSimpleCodeEditorWidgetOptions(): ICodeEditorWidgetOptions;
/**
 * Should be called to set the styling on editors that are appearing as just input boxes
 * @param editorContainerSelector An element selector that will match the container of the editor
 */
export declare function setupSimpleEditorSelectionStyling(editorContainerSelector: string): IDisposable;
