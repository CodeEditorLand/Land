var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Disposable } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { registerAction2 } from '../../../../platform/actions/common/actions.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { EditorPaneDescriptor } from '../../../browser/editor.js';
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { EditorExtensions } from '../../../common/editor.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { HideWebViewEditorFindCommand, ReloadWebviewAction, ShowWebViewEditorFindWidgetAction, WebViewEditorFindNextCommand, WebViewEditorFindPreviousCommand } from './webviewCommands.js';
import { WebviewEditor } from './webviewEditor.js';
import { WebviewInput } from './webviewEditorInput.js';
import { WebviewEditorInputSerializer } from './webviewEditorInputSerializer.js';
import { IWebviewWorkbenchService, WebviewEditorService } from './webviewWorkbenchService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
(Registry.as(EditorExtensions.EditorPane)).registerEditorPane(EditorPaneDescriptor.create(WebviewEditor, WebviewEditor.ID, localize('webview.editor.label', "webview editor")), [new SyncDescriptor(WebviewInput)]);
let WebviewPanelContribution = class WebviewPanelContribution extends Disposable {
    static { this.ID = 'workbench.contrib.webviewPanel'; }
    constructor(editorService, editorGroupService) {
        super();
        this.editorGroupService = editorGroupService;
        this._register(editorService.onWillOpenEditor(e => {
            const group = editorGroupService.getGroup(e.groupId);
            if (group) {
                this.onEditorOpening(e.editor, group);
            }
        }));
    }
    onEditorOpening(editor, group) {
        if (!(editor instanceof WebviewInput) || editor.typeId !== WebviewInput.typeId) {
            return;
        }
        if (group.contains(editor)) {
            return;
        }
        let previousGroup;
        const groups = this.editorGroupService.groups;
        for (const group of groups) {
            if (group.contains(editor)) {
                previousGroup = group;
                break;
            }
        }
        if (!previousGroup) {
            return;
        }
        previousGroup.closeEditor(editor);
    }
};
WebviewPanelContribution = __decorate([
    __param(0, IEditorService),
    __param(1, IEditorGroupsService),
    __metadata("design:paramtypes", [Object, Object])
], WebviewPanelContribution);
registerWorkbenchContribution2(WebviewPanelContribution.ID, WebviewPanelContribution, 1);
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(WebviewEditorInputSerializer.ID, WebviewEditorInputSerializer);
registerSingleton(IWebviewWorkbenchService, WebviewEditorService, 1);
registerAction2(ShowWebViewEditorFindWidgetAction);
registerAction2(HideWebViewEditorFindCommand);
registerAction2(WebViewEditorFindNextCommand);
registerAction2(WebViewEditorFindPreviousCommand);
registerAction2(ReloadWebviewAction);
