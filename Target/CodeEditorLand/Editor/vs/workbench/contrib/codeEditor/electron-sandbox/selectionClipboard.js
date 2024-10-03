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
var SelectionClipboard_1;
import * as nls from '../../../../nls.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import * as platform from '../../../../base/common/platform.js';
import { registerEditorContribution, EditorAction, registerEditorAction } from '../../../../editor/browser/editorExtensions.js';
import { Range } from '../../../../editor/common/core/range.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { SelectionClipboardContributionID } from '../browser/selectionClipboard.js';
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { EditorContextKeys } from '../../../../editor/common/editorContextKeys.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { Event } from '../../../../base/common/event.js';
import { addDisposableListener, onDidRegisterWindow } from '../../../../base/browser/dom.js';
let SelectionClipboard = class SelectionClipboard extends Disposable {
    static { SelectionClipboard_1 = this; }
    static { this.SELECTION_LENGTH_LIMIT = 65536; }
    constructor(editor, clipboardService) {
        super();
        if (platform.isLinux) {
            let isEnabled = editor.getOption(110);
            this._register(editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(110)) {
                    isEnabled = editor.getOption(110);
                }
            }));
            const setSelectionToClipboard = this._register(new RunOnceScheduler(() => {
                if (!editor.hasModel()) {
                    return;
                }
                const model = editor.getModel();
                let selections = editor.getSelections();
                selections = selections.slice(0);
                selections.sort(Range.compareRangesUsingStarts);
                let resultLength = 0;
                for (const sel of selections) {
                    if (sel.isEmpty()) {
                        return;
                    }
                    resultLength += model.getValueLengthInRange(sel);
                }
                if (resultLength > SelectionClipboard_1.SELECTION_LENGTH_LIMIT) {
                    return;
                }
                const result = [];
                for (const sel of selections) {
                    result.push(model.getValueInRange(sel, 0));
                }
                const textToCopy = result.join(model.getEOL());
                clipboardService.writeText(textToCopy, 'selection');
            }, 100));
            this._register(editor.onDidChangeCursorSelection((e) => {
                if (!isEnabled) {
                    return;
                }
                if (e.source === 'restoreState') {
                    return;
                }
                setSelectionToClipboard.schedule();
            }));
        }
    }
    dispose() {
        super.dispose();
    }
};
SelectionClipboard = SelectionClipboard_1 = __decorate([
    __param(1, IClipboardService),
    __metadata("design:paramtypes", [Object, Object])
], SelectionClipboard);
export { SelectionClipboard };
let LinuxSelectionClipboardPastePreventer = class LinuxSelectionClipboardPastePreventer extends Disposable {
    static { this.ID = 'workbench.contrib.linuxSelectionClipboardPastePreventer'; }
    constructor(configurationService) {
        super();
        this._register(Event.runAndSubscribe(onDidRegisterWindow, ({ window, disposables }) => {
            disposables.add(addDisposableListener(window.document, 'mouseup', e => {
                if (e.button === 1) {
                    const config = configurationService.getValue('editor');
                    if (!config.selectionClipboard) {
                        e.preventDefault();
                    }
                }
            }));
        }, { window: mainWindow, disposables: this._store }));
    }
};
LinuxSelectionClipboardPastePreventer = __decorate([
    __param(0, IConfigurationService),
    __metadata("design:paramtypes", [Object])
], LinuxSelectionClipboardPastePreventer);
class PasteSelectionClipboardAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.selectionClipboardPaste',
            label: nls.localize('actions.pasteSelectionClipboard', "Paste Selection Clipboard"),
            alias: 'Paste Selection Clipboard',
            precondition: EditorContextKeys.writable
        });
    }
    async run(accessor, editor, args) {
        const clipboardService = accessor.get(IClipboardService);
        const text = await clipboardService.readText('selection');
        editor.trigger('keyboard', "paste", {
            text: text,
            pasteOnNewLine: false,
            multicursorText: null
        });
    }
}
registerEditorContribution(SelectionClipboardContributionID, SelectionClipboard, 0);
if (platform.isLinux) {
    registerWorkbenchContribution2(LinuxSelectionClipboardPastePreventer.ID, LinuxSelectionClipboardPastePreventer, 2);
    registerEditorAction(PasteSelectionClipboardAction);
}
