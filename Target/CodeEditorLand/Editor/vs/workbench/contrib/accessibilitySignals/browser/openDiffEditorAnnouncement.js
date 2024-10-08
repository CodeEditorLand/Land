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
import { Disposable } from '../../../../base/common/lifecycle.js';
import { isDiffEditor } from '../../../../editor/browser/editorBrowser.js';
import { localize } from '../../../../nls.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { Event } from '../../../../base/common/event.js';
let DiffEditorActiveAnnouncementContribution = class DiffEditorActiveAnnouncementContribution extends Disposable {
    static { this.ID = 'workbench.contrib.diffEditorActiveAnnouncement'; }
    constructor(_editorService, _accessibilityService, _configurationService) {
        super();
        this._editorService = _editorService;
        this._accessibilityService = _accessibilityService;
        this._configurationService = _configurationService;
        this._register(Event.runAndSubscribe(_accessibilityService.onDidChangeScreenReaderOptimized, () => this._updateListener()));
        this._register(_configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("accessibility.verbosity.diffEditorActive" /* AccessibilityVerbositySettingId.DiffEditorActive */)) {
                this._updateListener();
            }
        }));
    }
    _updateListener() {
        const announcementEnabled = this._configurationService.getValue("accessibility.verbosity.diffEditorActive" /* AccessibilityVerbositySettingId.DiffEditorActive */);
        const screenReaderOptimized = this._accessibilityService.isScreenReaderOptimized();
        if (!announcementEnabled || !screenReaderOptimized) {
            this._onDidActiveEditorChangeListener?.dispose();
            this._onDidActiveEditorChangeListener = undefined;
            return;
        }
        if (this._onDidActiveEditorChangeListener) {
            return;
        }
        this._onDidActiveEditorChangeListener = this._register(this._editorService.onDidActiveEditorChange(() => {
            if (isDiffEditor(this._editorService.activeTextEditorControl)) {
                this._accessibilityService.alert(localize('openDiffEditorAnnouncement', "Diff editor"));
            }
        }));
    }
};
DiffEditorActiveAnnouncementContribution = __decorate([
    __param(0, IEditorService),
    __param(1, IAccessibilityService),
    __param(2, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], DiffEditorActiveAnnouncementContribution);
export { DiffEditorActiveAnnouncementContribution };
