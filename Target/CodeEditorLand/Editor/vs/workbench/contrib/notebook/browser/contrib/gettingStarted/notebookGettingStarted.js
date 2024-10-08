/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { localize2 } from '../../../../../../nls.js';
import { Categories } from '../../../../../../platform/action/common/actionCommonCategories.js';
import { Action2, registerAction2 } from '../../../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { Registry } from '../../../../../../platform/registry/common/platform.js';
import { IStorageService } from '../../../../../../platform/storage/common/storage.js';
import { Extensions as WorkbenchExtensions } from '../../../../../common/contributions.js';
import { Memento } from '../../../../../common/memento.js';
import { NotebookSetting } from '../../../common/notebookCommon.js';
import { HAS_OPENED_NOTEBOOK } from '../../../common/notebookContextKeys.js';
import { NotebookEditorInput } from '../../../common/notebookEditorInput.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
const hasOpenedNotebookKey = 'hasOpenedNotebook';
const hasShownGettingStartedKey = 'hasShownNotebookGettingStarted';
/**
 * Sets a context key when a notebook has ever been opened by the user
 */
let NotebookGettingStarted = class NotebookGettingStarted extends Disposable {
    constructor(_editorService, _storageService, _contextKeyService, _commandService, _configurationService) {
        super();
        const hasOpenedNotebook = HAS_OPENED_NOTEBOOK.bindTo(_contextKeyService);
        const memento = new Memento('notebookGettingStarted2', _storageService);
        const storedValue = memento.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        if (storedValue[hasOpenedNotebookKey]) {
            hasOpenedNotebook.set(true);
        }
        const needToShowGettingStarted = _configurationService.getValue(NotebookSetting.openGettingStarted) && !storedValue[hasShownGettingStartedKey];
        if (!storedValue[hasOpenedNotebookKey] || needToShowGettingStarted) {
            const onDidOpenNotebook = () => {
                hasOpenedNotebook.set(true);
                storedValue[hasOpenedNotebookKey] = true;
                if (needToShowGettingStarted) {
                    _commandService.executeCommand('workbench.action.openWalkthrough', { category: 'notebooks', step: 'notebookProfile' }, true);
                    storedValue[hasShownGettingStartedKey] = true;
                }
                memento.saveMemento();
            };
            if (_editorService.activeEditor?.typeId === NotebookEditorInput.ID) {
                // active editor is notebook
                onDidOpenNotebook();
                return;
            }
            const listener = this._register(_editorService.onDidActiveEditorChange(() => {
                if (_editorService.activeEditor?.typeId === NotebookEditorInput.ID) {
                    listener.dispose();
                    onDidOpenNotebook();
                }
            }));
        }
    }
};
NotebookGettingStarted = __decorate([
    __param(0, IEditorService),
    __param(1, IStorageService),
    __param(2, IContextKeyService),
    __param(3, ICommandService),
    __param(4, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], NotebookGettingStarted);
export { NotebookGettingStarted };
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(NotebookGettingStarted, 3 /* LifecyclePhase.Restored */);
registerAction2(class NotebookClearNotebookLayoutAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.notebook.layout.gettingStarted',
            title: localize2('workbench.notebook.layout.gettingStarted.label', "Reset notebook getting started"),
            f1: true,
            precondition: ContextKeyExpr.equals(`config.${NotebookSetting.openGettingStarted}`, true),
            category: Categories.Developer,
        });
    }
    run(accessor) {
        const storageService = accessor.get(IStorageService);
        const memento = new Memento('notebookGettingStarted', storageService);
        const storedValue = memento.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        storedValue[hasOpenedNotebookKey] = undefined;
        memento.saveMemento();
    }
});
