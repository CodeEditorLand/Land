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
import { Queue } from '../../../../base/common/async.js';
import { Disposable, DisposableMap, DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { ChatAgentLocation, IChatAgentService } from '../common/chatAgents.js';
import { IChatEditingService } from '../common/chatEditingService.js';
import { CHAT_CATEGORY } from './actions/chatActions.js';
const _storageKey = 'workbench.chat.editorSaving';
let ChatEditorSaving = class ChatEditorSaving extends Disposable {
    static { this.ID = 'workbench.chat.editorSaving'; }
    constructor(chatEditingService, chatAgentService, textFileService, labelService, _dialogService, _storageService, _fileConfigService) {
        super();
        this._dialogService = _dialogService;
        this._storageService = _storageService;
        this._fileConfigService = _fileConfigService;
        this._sessionStore = this._store.add(new DisposableMap());
        const store = this._store.add(new DisposableStore());
        const queue = new Queue();
        const update = () => {
            store.clear();
            const alwaysAcceptOnSave = this._storageService.getBoolean(_storageKey, 0 /* StorageScope.PROFILE */, false);
            if (alwaysAcceptOnSave) {
                return;
            }
            store.add(chatEditingService.onDidCreateEditingSession(e => this._handleNewEditingSession(e)));
            store.add(textFileService.files.addSaveParticipant({
                participate: async (workingCopy, context, progress, token) => {
                    if (context.reason !== 1 /* SaveReason.EXPLICIT */) {
                        // all saves that we are concerned about are explicit
                        // because we have disabled auto-save for them
                        return;
                    }
                    const session = chatEditingService.getEditingSession(workingCopy.resource);
                    if (!session) {
                        return;
                    }
                    if (!session.entries.get().find(e => e.state.get() === 0 /* WorkingSetEntryState.Modified */ && e.modifiedURI.toString() === workingCopy.resource.toString())) {
                        return;
                    }
                    // ensure one modal at the time
                    await queue.queue(async () => {
                        // this might have changed in the meantime and there is checked again and acted upon
                        const alwaysAcceptOnSave = this._storageService.getBoolean(_storageKey, 0 /* StorageScope.PROFILE */, false);
                        if (alwaysAcceptOnSave) {
                            await session.accept(workingCopy.resource);
                            return;
                        }
                        const agentName = chatAgentService.getDefaultAgent(ChatAgentLocation.EditingSession)?.fullName;
                        const filelabel = labelService.getUriBasenameLabel(workingCopy.resource);
                        const message = agentName
                            ? localize('message.1', "Do you want to accept the changes {0} made in {1}", agentName, filelabel)
                            : localize('message.2', "Do you want to accept the changes chat made in {1}", filelabel);
                        const result = await this._dialogService.confirm({
                            message,
                            detail: localize('detail', "AI-generated changes may be incorect and should be reviewed before saving.", agentName),
                            primaryButton: localize('save', "Accept & Save"),
                            cancelButton: localize('discard', "Discard & Save"),
                            checkbox: {
                                label: localize('config', "Always accept edits when saving"),
                                checked: false
                            }
                        });
                        if (result.confirmed) {
                            await session.accept(workingCopy.resource);
                            if (result.checkboxChecked) {
                                // remember choice
                                this._storageService.store(_storageKey, true, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                            }
                        }
                        else {
                            await session.reject(workingCopy.resource);
                        }
                    });
                }
            }));
        };
        this._storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, _storageKey, this._store)(update);
        update();
    }
    _handleNewEditingSession(session) {
        const store = new DisposableStore();
        // disable auto save for those files involved in editing
        const saveConfig = store.add(new MutableDisposable());
        const update = () => {
            const store = new DisposableStore();
            const entries = session.entries.get();
            for (const entry of entries) {
                if (entry.state.get() === 0 /* WorkingSetEntryState.Modified */) {
                    store.add(this._fileConfigService.disableAutoSave(entry.modifiedURI));
                }
            }
            saveConfig.value = store;
        };
        update();
        this._sessionStore.set(session, store);
        store.add(session.onDidChange(() => {
            update();
        }));
        store.add(session.onDidDispose(() => {
            this._sessionStore.deleteAndDispose(session);
        }));
    }
};
ChatEditorSaving = __decorate([
    __param(0, IChatEditingService),
    __param(1, IChatAgentService),
    __param(2, ITextFileService),
    __param(3, ILabelService),
    __param(4, IDialogService),
    __param(5, IStorageService),
    __param(6, IFilesConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], ChatEditorSaving);
export { ChatEditorSaving };
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.resetChatEditorSaving',
            title: localize2('resetChatEditorSaving', "Reset Choise for 'Always accept edits when saving'"),
            category: CHAT_CATEGORY,
            f1: true
        });
    }
    run(accessor) {
        const storageService = accessor.get(IStorageService);
        storageService.remove(_storageKey, 0 /* StorageScope.PROFILE */);
    }
});
