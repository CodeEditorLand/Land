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
var KeybindingEditorDecorationsRenderer_1;
import * as nls from '../../../../nls.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Range } from '../../../../editor/common/core/range.js';
import { registerEditorContribution } from '../../../../editor/browser/editorExtensions.js';
import { SnippetController2 } from '../../../../editor/contrib/snippet/browser/snippetController2.js';
import { SmartSnippetInserter } from '../common/smartSnippetInserter.js';
import { DefineKeybindingOverlayWidget } from './keybindingWidgets.js';
import { parseTree } from '../../../../base/common/json.js';
import { WindowsNativeResolvedKeybinding } from '../../../services/keybinding/common/windowsKeyboardMapper.js';
import { themeColorFromId } from '../../../../platform/theme/common/themeService.js';
import { overviewRulerInfo, overviewRulerError } from '../../../../editor/common/core/editorColorRegistry.js';
import { OverviewRulerLane } from '../../../../editor/common/model.js';
import { KeybindingParser } from '../../../../base/common/keybindingParser.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { isEqual } from '../../../../base/common/resources.js';
import { IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.js';
import { DEFINE_KEYBINDING_EDITOR_CONTRIB_ID } from '../../../services/preferences/common/preferences.js';
const NLS_KB_LAYOUT_ERROR_MESSAGE = nls.localize('defineKeybinding.kbLayoutErrorMessage', "You won't be able to produce this key combination under your current keyboard layout.");
let DefineKeybindingEditorContribution = class DefineKeybindingEditorContribution extends Disposable {
    constructor(_editor, _instantiationService, _userDataProfileService) {
        super();
        this._editor = _editor;
        this._instantiationService = _instantiationService;
        this._userDataProfileService = _userDataProfileService;
        this._keybindingDecorationRenderer = this._register(new MutableDisposable());
        this._defineWidget = this._register(this._instantiationService.createInstance(DefineKeybindingOverlayWidget, this._editor));
        this._register(this._editor.onDidChangeModel(e => this._update()));
        this._update();
    }
    _update() {
        this._keybindingDecorationRenderer.value = isInterestingEditorModel(this._editor, this._userDataProfileService)
            // Decorations are shown for the default keybindings.json **and** for the user keybindings.json
            ? this._instantiationService.createInstance(KeybindingEditorDecorationsRenderer, this._editor)
            : undefined;
    }
    showDefineKeybindingWidget() {
        if (isInterestingEditorModel(this._editor, this._userDataProfileService)) {
            this._defineWidget.start().then(keybinding => this._onAccepted(keybinding));
        }
    }
    _onAccepted(keybinding) {
        this._editor.focus();
        if (keybinding && this._editor.hasModel()) {
            const regexp = new RegExp(/\\/g);
            const backslash = regexp.test(keybinding);
            if (backslash) {
                keybinding = keybinding.slice(0, -1) + '\\\\';
            }
            let snippetText = [
                '{',
                '\t"key": ' + JSON.stringify(keybinding) + ',',
                '\t"command": "${1:commandId}",',
                '\t"when": "${2:editorTextFocus}"',
                '}$0'
            ].join('\n');
            const smartInsertInfo = SmartSnippetInserter.insertSnippet(this._editor.getModel(), this._editor.getPosition());
            snippetText = smartInsertInfo.prepend + snippetText + smartInsertInfo.append;
            this._editor.setPosition(smartInsertInfo.position);
            SnippetController2.get(this._editor)?.insert(snippetText, { overwriteBefore: 0, overwriteAfter: 0 });
        }
    }
};
DefineKeybindingEditorContribution = __decorate([
    __param(1, IInstantiationService),
    __param(2, IUserDataProfileService),
    __metadata("design:paramtypes", [Object, Object, Object])
], DefineKeybindingEditorContribution);
let KeybindingEditorDecorationsRenderer = KeybindingEditorDecorationsRenderer_1 = class KeybindingEditorDecorationsRenderer extends Disposable {
    constructor(_editor, _keybindingService) {
        super();
        this._editor = _editor;
        this._keybindingService = _keybindingService;
        this._dec = this._editor.createDecorationsCollection();
        this._updateDecorations = this._register(new RunOnceScheduler(() => this._updateDecorationsNow(), 500));
        const model = assertIsDefined(this._editor.getModel());
        this._register(model.onDidChangeContent(() => this._updateDecorations.schedule()));
        this._register(this._keybindingService.onDidUpdateKeybindings(() => this._updateDecorations.schedule()));
        this._register({
            dispose: () => {
                this._dec.clear();
                this._updateDecorations.cancel();
            }
        });
        this._updateDecorations.schedule();
    }
    _updateDecorationsNow() {
        const model = assertIsDefined(this._editor.getModel());
        const newDecorations = [];
        const root = parseTree(model.getValue());
        if (root && Array.isArray(root.children)) {
            for (let i = 0, len = root.children.length; i < len; i++) {
                const entry = root.children[i];
                const dec = this._getDecorationForEntry(model, entry);
                if (dec !== null) {
                    newDecorations.push(dec);
                }
            }
        }
        this._dec.set(newDecorations);
    }
    _getDecorationForEntry(model, entry) {
        if (!Array.isArray(entry.children)) {
            return null;
        }
        for (let i = 0, len = entry.children.length; i < len; i++) {
            const prop = entry.children[i];
            if (prop.type !== 'property') {
                continue;
            }
            if (!Array.isArray(prop.children) || prop.children.length !== 2) {
                continue;
            }
            const key = prop.children[0];
            if (key.value !== 'key') {
                continue;
            }
            const value = prop.children[1];
            if (value.type !== 'string') {
                continue;
            }
            const resolvedKeybindings = this._keybindingService.resolveUserBinding(value.value);
            if (resolvedKeybindings.length === 0) {
                return this._createDecoration(true, null, null, model, value);
            }
            const resolvedKeybinding = resolvedKeybindings[0];
            let usLabel = null;
            if (resolvedKeybinding instanceof WindowsNativeResolvedKeybinding) {
                usLabel = resolvedKeybinding.getUSLabel();
            }
            if (!resolvedKeybinding.isWYSIWYG()) {
                const uiLabel = resolvedKeybinding.getLabel();
                if (typeof uiLabel === 'string' && value.value.toLowerCase() === uiLabel.toLowerCase()) {
                    // coincidentally, this is actually WYSIWYG
                    return null;
                }
                return this._createDecoration(false, resolvedKeybinding.getLabel(), usLabel, model, value);
            }
            if (/abnt_|oem_/.test(value.value)) {
                return this._createDecoration(false, resolvedKeybinding.getLabel(), usLabel, model, value);
            }
            const expectedUserSettingsLabel = resolvedKeybinding.getUserSettingsLabel();
            if (typeof expectedUserSettingsLabel === 'string' && !KeybindingEditorDecorationsRenderer_1._userSettingsFuzzyEquals(value.value, expectedUserSettingsLabel)) {
                return this._createDecoration(false, resolvedKeybinding.getLabel(), usLabel, model, value);
            }
            return null;
        }
        return null;
    }
    static _userSettingsFuzzyEquals(a, b) {
        a = a.trim().toLowerCase();
        b = b.trim().toLowerCase();
        if (a === b) {
            return true;
        }
        const aKeybinding = KeybindingParser.parseKeybinding(a);
        const bKeybinding = KeybindingParser.parseKeybinding(b);
        if (aKeybinding === null && bKeybinding === null) {
            return true;
        }
        if (!aKeybinding || !bKeybinding) {
            return false;
        }
        return aKeybinding.equals(bKeybinding);
    }
    _createDecoration(isError, uiLabel, usLabel, model, keyNode) {
        let msg;
        let className;
        let overviewRulerColor;
        if (isError) {
            // this is the error case
            msg = new MarkdownString().appendText(NLS_KB_LAYOUT_ERROR_MESSAGE);
            className = 'keybindingError';
            overviewRulerColor = themeColorFromId(overviewRulerError);
        }
        else {
            // this is the info case
            if (usLabel && uiLabel !== usLabel) {
                msg = new MarkdownString(nls.localize({
                    key: 'defineKeybinding.kbLayoutLocalAndUSMessage',
                    comment: [
                        'Please translate maintaining the stars (*) around the placeholders such that they will be rendered in bold.',
                        'The placeholders will contain a keyboard combination e.g. Ctrl+Shift+/'
                    ]
                }, "**{0}** for your current keyboard layout (**{1}** for US standard).", uiLabel, usLabel));
            }
            else {
                msg = new MarkdownString(nls.localize({
                    key: 'defineKeybinding.kbLayoutLocalMessage',
                    comment: [
                        'Please translate maintaining the stars (*) around the placeholder such that it will be rendered in bold.',
                        'The placeholder will contain a keyboard combination e.g. Ctrl+Shift+/'
                    ]
                }, "**{0}** for your current keyboard layout.", uiLabel));
            }
            className = 'keybindingInfo';
            overviewRulerColor = themeColorFromId(overviewRulerInfo);
        }
        const startPosition = model.getPositionAt(keyNode.offset);
        const endPosition = model.getPositionAt(keyNode.offset + keyNode.length);
        const range = new Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
        // icon + highlight + message decoration
        return {
            range: range,
            options: {
                description: 'keybindings-widget',
                stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                className: className,
                hoverMessage: msg,
                overviewRuler: {
                    color: overviewRulerColor,
                    position: OverviewRulerLane.Right
                }
            }
        };
    }
};
KeybindingEditorDecorationsRenderer = KeybindingEditorDecorationsRenderer_1 = __decorate([
    __param(1, IKeybindingService),
    __metadata("design:paramtypes", [Object, Object])
], KeybindingEditorDecorationsRenderer);
export { KeybindingEditorDecorationsRenderer };
function isInterestingEditorModel(editor, userDataProfileService) {
    const model = editor.getModel();
    if (!model) {
        return false;
    }
    return isEqual(model.uri, userDataProfileService.currentProfile.keybindingsResource);
}
registerEditorContribution(DEFINE_KEYBINDING_EDITOR_CONTRIB_ID, DefineKeybindingEditorContribution, 1 /* EditorContributionInstantiation.AfterFirstRender */);
