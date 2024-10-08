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
        // Auto save: after delay
        this.scheduledAutoSavesAfterDelay = new Map();
        // Auto save: focus change & window change
        this.lastActiveEditor = undefined;
        this.lastActiveGroupId = undefined;
        this.lastActiveEditorControlDisposable = this._register(new DisposableStore());
        // Auto save: waiting on specific condition
        this.waitingOnConditionAutoSaveWorkingCopies = new ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
        this.waitingOnConditionAutoSaveEditors = new ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
        // Fill in initial dirty working copies
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
        // Working Copy events
        this._register(this.workingCopyService.onDidRegister(workingCopy => this.onDidRegister(workingCopy)));
        this._register(this.workingCopyService.onDidUnregister(workingCopy => this.onDidUnregister(workingCopy)));
        this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.onDidChangeDirty(workingCopy)));
        this._register(this.workingCopyService.onDidChangeContent(workingCopy => this.onDidChangeContent(workingCopy)));
        // Condition changes
        this._register(this.markerService.onMarkerChanged(e => this.onConditionChanged(e, 3 /* AutoSaveDisabledReason.ERRORS */)));
        this._register(this.filesConfigurationService.onDidChangeAutoSaveDisabled(resource => this.onConditionChanged([resource], 4 /* AutoSaveDisabledReason.DISABLED */)));
    }
    onConditionChanged(resources, condition) {
        for (const resource of resources) {
            // Waiting working copies
            const workingCopyResult = this.waitingOnConditionAutoSaveWorkingCopies.get(resource);
            if (workingCopyResult?.condition === condition) {
                if (workingCopyResult.workingCopy.isDirty() &&
                    this.filesConfigurationService.getAutoSaveMode(workingCopyResult.workingCopy.resource, workingCopyResult.reason).mode !== 0 /* AutoSaveMode.OFF */) {
                    this.discardAutoSave(workingCopyResult.workingCopy);
                    this.logService.trace(`[editor auto save] running auto save from condition change event`, workingCopyResult.workingCopy.resource.toString(), workingCopyResult.workingCopy.typeId);
                    workingCopyResult.workingCopy.save({ reason: workingCopyResult.reason });
                }
            }
            // Waiting editors
            else {
                const editorResult = this.waitingOnConditionAutoSaveEditors.get(resource);
                if (editorResult?.condition === condition &&
                    !editorResult.editor.editor.isDisposed() &&
                    editorResult.editor.editor.isDirty() &&
                    this.filesConfigurationService.getAutoSaveMode(editorResult.editor.editor, editorResult.reason).mode !== 0 /* AutoSaveMode.OFF */) {
                    this.waitingOnConditionAutoSaveEditors.delete(resource);
                    this.logService.trace(`[editor auto save] running auto save from condition change event with reason ${editorResult.reason}`);
                    this.editorService.save(editorResult.editor, { reason: editorResult.reason });
                }
            }
        }
    }
    onWindowFocusChange(focused) {
        if (!focused) {
            this.maybeTriggerAutoSave(4 /* SaveReason.WINDOW_CHANGE */);
        }
    }
    onActiveWindowChange() {
        this.maybeTriggerAutoSave(4 /* SaveReason.WINDOW_CHANGE */);
    }
    onDidActiveEditorChange() {
        // Treat editor change like a focus change for our last active editor if any
        if (this.lastActiveEditor && typeof this.lastActiveGroupId === 'number') {
            this.maybeTriggerAutoSave(3 /* SaveReason.FOCUS_CHANGE */, { groupId: this.lastActiveGroupId, editor: this.lastActiveEditor });
        }
        // Remember as last active
        const activeGroup = this.editorGroupService.activeGroup;
        const activeEditor = this.lastActiveEditor = activeGroup.activeEditor ?? undefined;
        this.lastActiveGroupId = activeGroup.id;
        // Dispose previous active control listeners
        this.lastActiveEditorControlDisposable.clear();
        // Listen to focus changes on control for auto save
        const activeEditorPane = this.editorService.activeEditorPane;
        if (activeEditor && activeEditorPane) {
            this.lastActiveEditorControlDisposable.add(activeEditorPane.onDidBlur(() => {
                this.maybeTriggerAutoSave(3 /* SaveReason.FOCUS_CHANGE */, { groupId: activeGroup.id, editor: activeEditor });
            }));
        }
    }
    maybeTriggerAutoSave(reason, editorIdentifier) {
        if (editorIdentifier) {
            if (!editorIdentifier.editor.isDirty() ||
                editorIdentifier.editor.isReadonly() ||
                editorIdentifier.editor.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                return; // no auto save for non-dirty, readonly or untitled editors
            }
            const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(editorIdentifier.editor, reason);
            if (autoSaveMode.mode !== 0 /* AutoSaveMode.OFF */) {
                // Determine if we need to save all. In case of a window focus change we also save if
                // auto save mode is configured to be ON_FOCUS_CHANGE (editor focus change)
                if ((reason === 4 /* SaveReason.WINDOW_CHANGE */ && (autoSaveMode.mode === 3 /* AutoSaveMode.ON_FOCUS_CHANGE */ || autoSaveMode.mode === 4 /* AutoSaveMode.ON_WINDOW_CHANGE */)) ||
                    (reason === 3 /* SaveReason.FOCUS_CHANGE */ && autoSaveMode.mode === 3 /* AutoSaveMode.ON_FOCUS_CHANGE */)) {
                    this.logService.trace(`[editor auto save] triggering auto save with reason ${reason}`);
                    this.editorService.save(editorIdentifier, { reason });
                }
            }
            else if (editorIdentifier.editor.resource && (autoSaveMode.reason === 3 /* AutoSaveDisabledReason.ERRORS */ || autoSaveMode.reason === 4 /* AutoSaveDisabledReason.DISABLED */)) {
                this.waitingOnConditionAutoSaveEditors.set(editorIdentifier.editor.resource, { editor: editorIdentifier, reason, condition: autoSaveMode.reason });
            }
        }
        else {
            this.saveAllDirtyAutoSaveables(reason);
        }
    }
    onDidChangeAutoSaveConfiguration() {
        // Trigger a save-all when auto save is enabled
        let reason = undefined;
        switch (this.filesConfigurationService.getAutoSaveMode(undefined).mode) {
            case 3 /* AutoSaveMode.ON_FOCUS_CHANGE */:
                reason = 3 /* SaveReason.FOCUS_CHANGE */;
                break;
            case 4 /* AutoSaveMode.ON_WINDOW_CHANGE */:
                reason = 4 /* SaveReason.WINDOW_CHANGE */;
                break;
            case 1 /* AutoSaveMode.AFTER_SHORT_DELAY */:
            case 2 /* AutoSaveMode.AFTER_LONG_DELAY */:
                reason = 2 /* SaveReason.AUTO */;
                break;
        }
        if (reason) {
            this.saveAllDirtyAutoSaveables(reason);
        }
    }
    saveAllDirtyAutoSaveables(reason) {
        for (const workingCopy of this.workingCopyService.dirtyWorkingCopies) {
            if (workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) {
                continue; // we never auto save untitled working copies
            }
            const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(workingCopy.resource, reason);
            if (autoSaveMode.mode !== 0 /* AutoSaveMode.OFF */) {
                workingCopy.save({ reason });
            }
            else if (autoSaveMode.reason === 3 /* AutoSaveDisabledReason.ERRORS */ || autoSaveMode.reason === 4 /* AutoSaveDisabledReason.DISABLED */) {
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
            // this listener will make sure that the auto save is
            // pushed out for as long as the user is still changing
            // the content of the working copy.
            this.scheduleAutoSave(workingCopy);
        }
    }
    scheduleAutoSave(workingCopy) {
        if (workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) {
            return; // we never auto save untitled working copies
        }
        const autoSaveAfterDelay = this.filesConfigurationService.getAutoSaveConfiguration(workingCopy.resource).autoSaveDelay;
        if (typeof autoSaveAfterDelay !== 'number') {
            return; // auto save after delay must be enabled
        }
        // Clear any running auto save operation
        this.discardAutoSave(workingCopy);
        this.logService.trace(`[editor auto save] scheduling auto save after ${autoSaveAfterDelay}ms`, workingCopy.resource.toString(), workingCopy.typeId);
        // Schedule new auto save
        const handle = setTimeout(() => {
            // Clear pending
            this.discardAutoSave(workingCopy);
            // Save if dirty and unless prevented by other conditions such as error markers
            if (workingCopy.isDirty()) {
                const reason = 2 /* SaveReason.AUTO */;
                const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(workingCopy.resource, reason);
                if (autoSaveMode.mode !== 0 /* AutoSaveMode.OFF */) {
                    this.logService.trace(`[editor auto save] running auto save`, workingCopy.resource.toString(), workingCopy.typeId);
                    workingCopy.save({ reason });
                }
                else if (autoSaveMode.reason === 3 /* AutoSaveDisabledReason.ERRORS */ || autoSaveMode.reason === 4 /* AutoSaveDisabledReason.DISABLED */) {
                    this.waitingOnConditionAutoSaveWorkingCopies.set(workingCopy.resource, { workingCopy, reason, condition: autoSaveMode.reason });
                }
            }
        }, autoSaveAfterDelay);
        // Keep in map for disposal as needed
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
