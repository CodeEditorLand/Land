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
import { Disposable, DisposableStore, dispose, toDisposable } from '../../../../base/common/lifecycle.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IWorkingCopyService } from '../../../services/workingCopy/common/workingCopyService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IMarkerService } from '../../../../platform/markers/common/markers.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
let EditorAutoSave = class EditorAutoSave extends Disposable {
    static { this.ID = 'workbench.contrib.editorAutoSave'; }
    constructor(filesConfigurationService, hostService, editorService, editorGroupService, workingCopyService, logService, markerService, uriIdentityService) {
        super();
        this.filesConfigurationService = filesConfigurationService;
        this.hostService = hostService;
        this.editorService = editorService;
        this.editorGroupService = editorGroupService;
        this.workingCopyService = workingCopyService;
        this.logService = logService;
        this.markerService = markerService;
        this.uriIdentityService = uriIdentityService;
        this.scheduledAutoSavesAfterDelay = new Map();
        this.lastActiveEditor = undefined;
        this.lastActiveGroupId = undefined;
        this.lastActiveEditorControlDisposable = this._register(new DisposableStore());
        this.waitingOnConditionAutoSaveWorkingCopies = new ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
        this.waitingOnConditionAutoSaveEditors = new ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
        for (const dirtyWorkingCopy of this.workingCopyService.dirtyWorkingCopies) {
            this.onDidRegister(dirtyWorkingCopy);
        }
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.hostService.onDidChangeFocus(focused => this.onWindowFocusChange(focused)));
        this._register(this.hostService.onDidChangeActiveWindow(() => this.onActiveWindowChange()));
        this._register(this.editorService.onDidActiveEditorChange(() => this.onDidActiveEditorChange()));
        this._register(this.filesConfigurationService.onDidChangeAutoSaveConfiguration(() => this.onDidChangeAutoSaveConfiguration()));
        this._register(this.workingCopyService.onDidRegister(workingCopy => this.onDidRegister(workingCopy)));
        this._register(this.workingCopyService.onDidUnregister(workingCopy => this.onDidUnregister(workingCopy)));
        this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.onDidChangeDirty(workingCopy)));
        this._register(this.workingCopyService.onDidChangeContent(workingCopy => this.onDidChangeContent(workingCopy)));
        this._register(this.markerService.onMarkerChanged(e => this.onConditionChanged(e, 3)));
        this._register(this.filesConfigurationService.onDidChangeAutoSaveDisabled(resource => this.onConditionChanged([resource], 4)));
    }
    onConditionChanged(resources, condition) {
        for (const resource of resources) {
            const workingCopyResult = this.waitingOnConditionAutoSaveWorkingCopies.get(resource);
            if (workingCopyResult?.condition === condition) {
                if (workingCopyResult.workingCopy.isDirty() &&
                    this.filesConfigurationService.getAutoSaveMode(workingCopyResult.workingCopy.resource, workingCopyResult.reason).mode !== 0) {
                    this.discardAutoSave(workingCopyResult.workingCopy);
                    this.logService.trace(`[editor auto save] running auto save from condition change event`, workingCopyResult.workingCopy.resource.toString(), workingCopyResult.workingCopy.typeId);
                    workingCopyResult.workingCopy.save({ reason: workingCopyResult.reason });
                }
            }
            else {
                const editorResult = this.waitingOnConditionAutoSaveEditors.get(resource);
                if (editorResult?.condition === condition &&
                    !editorResult.editor.editor.isDisposed() &&
                    editorResult.editor.editor.isDirty() &&
                    this.filesConfigurationService.getAutoSaveMode(editorResult.editor.editor, editorResult.reason).mode !== 0) {
                    this.waitingOnConditionAutoSaveEditors.delete(resource);
                    this.logService.trace(`[editor auto save] running auto save from condition change event with reason ${editorResult.reason}`);
                    this.editorService.save(editorResult.editor, { reason: editorResult.reason });
                }
            }
        }
    }
    onWindowFocusChange(focused) {
        if (!focused) {
            this.maybeTriggerAutoSave(4);
        }
    }
    onActiveWindowChange() {
        this.maybeTriggerAutoSave(4);
    }
    onDidActiveEditorChange() {
        if (this.lastActiveEditor && typeof this.lastActiveGroupId === 'number') {
            this.maybeTriggerAutoSave(3, { groupId: this.lastActiveGroupId, editor: this.lastActiveEditor });
        }
        const activeGroup = this.editorGroupService.activeGroup;
        const activeEditor = this.lastActiveEditor = activeGroup.activeEditor ?? undefined;
        this.lastActiveGroupId = activeGroup.id;
        this.lastActiveEditorControlDisposable.clear();
        const activeEditorPane = this.editorService.activeEditorPane;
        if (activeEditor && activeEditorPane) {
            this.lastActiveEditorControlDisposable.add(activeEditorPane.onDidBlur(() => {
                this.maybeTriggerAutoSave(3, { groupId: activeGroup.id, editor: activeEditor });
            }));
        }
    }
    maybeTriggerAutoSave(reason, editorIdentifier) {
        if (editorIdentifier) {
            if (!editorIdentifier.editor.isDirty() ||
                editorIdentifier.editor.isReadonly() ||
                editorIdentifier.editor.hasCapability(4)) {
                return;
            }
            const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(editorIdentifier.editor, reason);
            if (autoSaveMode.mode !== 0) {
                if ((reason === 4 && (autoSaveMode.mode === 3 || autoSaveMode.mode === 4)) ||
                    (reason === 3 && autoSaveMode.mode === 3)) {
                    this.logService.trace(`[editor auto save] triggering auto save with reason ${reason}`);
                    this.editorService.save(editorIdentifier, { reason });
                }
            }
            else if (editorIdentifier.editor.resource && (autoSaveMode.reason === 3 || autoSaveMode.reason === 4)) {
                this.waitingOnConditionAutoSaveEditors.set(editorIdentifier.editor.resource, { editor: editorIdentifier, reason, condition: autoSaveMode.reason });
            }
        }
        else {
            this.saveAllDirtyAutoSaveables(reason);
        }
    }
    onDidChangeAutoSaveConfiguration() {
        let reason = undefined;
        switch (this.filesConfigurationService.getAutoSaveMode(undefined).mode) {
            case 3:
                reason = 3;
                break;
            case 4:
                reason = 4;
                break;
            case 1:
            case 2:
                reason = 2;
                break;
        }
        if (reason) {
            this.saveAllDirtyAutoSaveables(reason);
        }
    }
    saveAllDirtyAutoSaveables(reason) {
        for (const workingCopy of this.workingCopyService.dirtyWorkingCopies) {
            if (workingCopy.capabilities & 2) {
                continue;
            }
            const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(workingCopy.resource, reason);
            if (autoSaveMode.mode !== 0) {
                workingCopy.save({ reason });
            }
            else if (autoSaveMode.reason === 3 || autoSaveMode.reason === 4) {
                this.waitingOnConditionAutoSaveWorkingCopies.set(workingCopy.resource, { workingCopy, reason, condition: autoSaveMode.reason });
            }
        }
    }
    onDidRegister(workingCopy) {
        if (workingCopy.isDirty()) {
            this.scheduleAutoSave(workingCopy);
        }
    }
    onDidUnregister(workingCopy) {
        this.discardAutoSave(workingCopy);
    }
    onDidChangeDirty(workingCopy) {
        if (workingCopy.isDirty()) {
            this.scheduleAutoSave(workingCopy);
        }
        else {
            this.discardAutoSave(workingCopy);
        }
    }
    onDidChangeContent(workingCopy) {
        if (workingCopy.isDirty()) {
            this.scheduleAutoSave(workingCopy);
        }
    }
    scheduleAutoSave(workingCopy) {
        if (workingCopy.capabilities & 2) {
            return;
        }
        const autoSaveAfterDelay = this.filesConfigurationService.getAutoSaveConfiguration(workingCopy.resource).autoSaveDelay;
        if (typeof autoSaveAfterDelay !== 'number') {
            return;
        }
        this.discardAutoSave(workingCopy);
        this.logService.trace(`[editor auto save] scheduling auto save after ${autoSaveAfterDelay}ms`, workingCopy.resource.toString(), workingCopy.typeId);
        const handle = setTimeout(() => {
            this.discardAutoSave(workingCopy);
            if (workingCopy.isDirty()) {
                const reason = 2;
                const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(workingCopy.resource, reason);
                if (autoSaveMode.mode !== 0) {
                    this.logService.trace(`[editor auto save] running auto save`, workingCopy.resource.toString(), workingCopy.typeId);
                    workingCopy.save({ reason });
                }
                else if (autoSaveMode.reason === 3 || autoSaveMode.reason === 4) {
                    this.waitingOnConditionAutoSaveWorkingCopies.set(workingCopy.resource, { workingCopy, reason, condition: autoSaveMode.reason });
                }
            }
        }, autoSaveAfterDelay);
        this.scheduledAutoSavesAfterDelay.set(workingCopy, toDisposable(() => {
            this.logService.trace(`[editor auto save] clearing pending auto save`, workingCopy.resource.toString(), workingCopy.typeId);
            clearTimeout(handle);
        }));
    }
    discardAutoSave(workingCopy) {
        dispose(this.scheduledAutoSavesAfterDelay.get(workingCopy));
        this.scheduledAutoSavesAfterDelay.delete(workingCopy);
        this.waitingOnConditionAutoSaveWorkingCopies.delete(workingCopy.resource);
        this.waitingOnConditionAutoSaveEditors.delete(workingCopy.resource);
    }
};
EditorAutoSave = __decorate([
    __param(0, IFilesConfigurationService),
    __param(1, IHostService),
    __param(2, IEditorService),
    __param(3, IEditorGroupsService),
    __param(4, IWorkingCopyService),
    __param(5, ILogService),
    __param(6, IMarkerService),
    __param(7, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], EditorAutoSave);
export { EditorAutoSave };
