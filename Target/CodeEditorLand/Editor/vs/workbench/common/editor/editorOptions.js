import { isTextEditorViewState } from '../editor.js';
export function applyTextEditorOptions(options, editor, scrollType) {
    let applied = false;
    const viewState = massageEditorViewState(options);
    if (isTextEditorViewState(viewState)) {
        editor.restoreViewState(viewState);
        applied = true;
    }
    if (options.selection) {
        const range = {
            startLineNumber: options.selection.startLineNumber,
            startColumn: options.selection.startColumn,
            endLineNumber: options.selection.endLineNumber ?? options.selection.startLineNumber,
            endColumn: options.selection.endColumn ?? options.selection.startColumn
        };
        editor.setSelection(range, options.selectionSource ?? "code.navigation");
        if (options.selectionRevealType === 2) {
            editor.revealRangeNearTop(range, scrollType);
        }
        else if (options.selectionRevealType === 3) {
            editor.revealRangeNearTopIfOutsideViewport(range, scrollType);
        }
        else if (options.selectionRevealType === 1) {
            editor.revealRangeInCenterIfOutsideViewport(range, scrollType);
        }
        else {
            editor.revealRangeInCenter(range, scrollType);
        }
        applied = true;
    }
    return applied;
}
function massageEditorViewState(options) {
    if (!options.selection || !options.viewState) {
        return options.viewState;
    }
    const candidateDiffViewState = options.viewState;
    if (candidateDiffViewState.modified) {
        candidateDiffViewState.modified.cursorState = [];
        return candidateDiffViewState;
    }
    const candidateEditorViewState = options.viewState;
    if (candidateEditorViewState.cursorState) {
        candidateEditorViewState.cursorState = [];
    }
    return candidateEditorViewState;
}
