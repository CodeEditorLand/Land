import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { EditorPaneDescriptor } from '../../../browser/editor.js';
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { EditorExtensions } from '../../../common/editor.js';
import { ComplexCustomWorkingCopyEditorHandler as ComplexCustomWorkingCopyEditorHandler, CustomEditorInputSerializer } from './customEditorInputFactory.js';
import { ICustomEditorService } from '../common/customEditor.js';
import { WebviewEditor } from '../../webviewPanel/browser/webviewEditor.js';
import { CustomEditorInput } from './customEditorInput.js';
import { CustomEditorService } from './customEditors.js';
registerSingleton(ICustomEditorService, CustomEditorService, 1);
Registry.as(EditorExtensions.EditorPane)
    .registerEditorPane(EditorPaneDescriptor.create(WebviewEditor, WebviewEditor.ID, 'Webview Editor'), [
    new SyncDescriptor(CustomEditorInput)
]);
Registry.as(EditorExtensions.EditorFactory)
    .registerEditorSerializer(CustomEditorInputSerializer.ID, CustomEditorInputSerializer);
registerWorkbenchContribution2(ComplexCustomWorkingCopyEditorHandler.ID, ComplexCustomWorkingCopyEditorHandler, 1);
