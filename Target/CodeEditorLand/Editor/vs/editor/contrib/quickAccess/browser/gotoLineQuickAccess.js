import { Disposable, DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { getCodeEditor } from '../../../browser/editorBrowser.js';
import { AbstractEditorNavigationQuickAccessProvider } from './editorNavigationQuickAccess.js';
import { localize } from '../../../../nls.js';
export class AbstractGotoLineQuickAccessProvider extends AbstractEditorNavigationQuickAccessProvider {
    static { this.PREFIX = ':'; }
    constructor() {
        super({ canAcceptInBackground: true });
    }
    provideWithoutTextEditor(picker) {
        const label = localize('cannotRunGotoLine', "Open a text editor first to go to a line.");
        picker.items = [{ label }];
        picker.ariaLabel = label;
        return Disposable.None;
    }
    provideWithTextEditor(context, picker, token) {
        const editor = context.editor;
        const disposables = new DisposableStore();
        disposables.add(picker.onDidAccept(event => {
            const [item] = picker.selectedItems;
            if (item) {
                if (!this.isValidLineNumber(editor, item.lineNumber)) {
                    return;
                }
                this.gotoLocation(context, { range: this.toRange(item.lineNumber, item.column), keyMods: picker.keyMods, preserveFocus: event.inBackground });
                if (!event.inBackground) {
                    picker.hide();
                }
            }
        }));
        const updatePickerAndEditor = () => {
            const position = this.parsePosition(editor, picker.value.trim().substr(AbstractGotoLineQuickAccessProvider.PREFIX.length));
            const label = this.getPickLabel(editor, position.lineNumber, position.column);
            picker.items = [{
                    lineNumber: position.lineNumber,
                    column: position.column,
                    label
                }];
            picker.ariaLabel = label;
            if (!this.isValidLineNumber(editor, position.lineNumber)) {
                this.clearDecorations(editor);
                return;
            }
            const range = this.toRange(position.lineNumber, position.column);
            editor.revealRangeInCenter(range, 0);
            this.addDecorations(editor, range);
        };
        updatePickerAndEditor();
        disposables.add(picker.onDidChangeValue(() => updatePickerAndEditor()));
        const codeEditor = getCodeEditor(editor);
        if (codeEditor) {
            const options = codeEditor.getOptions();
            const lineNumbers = options.get(70);
            if (lineNumbers.renderType === 2) {
                codeEditor.updateOptions({ lineNumbers: 'on' });
                disposables.add(toDisposable(() => codeEditor.updateOptions({ lineNumbers: 'relative' })));
            }
        }
        return disposables;
    }
    toRange(lineNumber = 1, column = 1) {
        return {
            startLineNumber: lineNumber,
            startColumn: column,
            endLineNumber: lineNumber,
            endColumn: column
        };
    }
    parsePosition(editor, value) {
        const numbers = value.split(/,|:|#/).map(part => parseInt(part, 10)).filter(part => !isNaN(part));
        const endLine = this.lineCount(editor) + 1;
        return {
            lineNumber: numbers[0] > 0 ? numbers[0] : endLine + numbers[0],
            column: numbers[1]
        };
    }
    getPickLabel(editor, lineNumber, column) {
        if (this.isValidLineNumber(editor, lineNumber)) {
            if (this.isValidColumn(editor, lineNumber, column)) {
                return localize('gotoLineColumnLabel', "Go to line {0} and character {1}.", lineNumber, column);
            }
            return localize('gotoLineLabel', "Go to line {0}.", lineNumber);
        }
        const position = editor.getPosition() || { lineNumber: 1, column: 1 };
        const lineCount = this.lineCount(editor);
        if (lineCount > 1) {
            return localize('gotoLineLabelEmptyWithLimit', "Current Line: {0}, Character: {1}. Type a line number between 1 and {2} to navigate to.", position.lineNumber, position.column, lineCount);
        }
        return localize('gotoLineLabelEmpty', "Current Line: {0}, Character: {1}. Type a line number to navigate to.", position.lineNumber, position.column);
    }
    isValidLineNumber(editor, lineNumber) {
        if (!lineNumber || typeof lineNumber !== 'number') {
            return false;
        }
        return lineNumber > 0 && lineNumber <= this.lineCount(editor);
    }
    isValidColumn(editor, lineNumber, column) {
        if (!column || typeof column !== 'number') {
            return false;
        }
        const model = this.getModel(editor);
        if (!model) {
            return false;
        }
        const positionCandidate = { lineNumber, column };
        return model.validatePosition(positionCandidate).equals(positionCandidate);
    }
    lineCount(editor) {
        return this.getModel(editor)?.getLineCount() ?? 0;
    }
}
