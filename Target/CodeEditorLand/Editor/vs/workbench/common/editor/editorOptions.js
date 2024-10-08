/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isTextEditorViewState } from '../editor.js';
export function applyTextEditorOptions(options, editor, scrollType) {
    let applied = false;
    // Restore view state if any
    const viewState = massageEditorViewState(options);
    if (isTextEditorViewState(viewState)) {
        editor.restoreViewState(viewState);
        applied = true;
    }
    // Restore selection if any
    if (options.selection) {
        const range = {
            startLineNumber: options.selection.startLineNumber,
            startColumn: options.selection.startColumn,
            endLineNumber: options.selection.endLineNumber ?? options.selection.startLineNumber,
            endColumn: options.selection.endColumn ?? options.selection.startColumn
        };
        // Apply selection with a source so that listeners can
        // distinguish this selection change from others.
        // If no source is provided, set a default source to
        // signal this navigation.
        editor.setSelection(range, options.selectionSource ?? "code.navigation" /* TextEditorSelectionSource.NAVIGATION */);
        // Reveal selection
        if (options.selectionRevealType === 2 /* TextEditorSelectionRevealType.NearTop */) {
            editor.revealRangeNearTop(range, scrollType);
        }
        else if (options.selectionRevealType === 3 /* TextEditorSelectionRevealType.NearTopIfOutsideViewport */) {
            editor.revealRangeNearTopIfOutsideViewport(range, scrollType);
        }
        else if (options.selectionRevealType === 1 /* TextEditorSelectionRevealType.CenterIfOutsideViewport */) {
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
    // Without a selection or view state, just return immediately
    if (!options.selection || !options.viewState) {
        return options.viewState;
    }
    // Diff editor: since we have an explicit selection, clear the
    // cursor state from the modified side where the selection
    // applies. This avoids a redundant selection change event.
    const candidateDiffViewState = options.viewState;
    if (candidateDiffViewState.modified) {
        candidateDiffViewState.modified.cursorState = [];
        return candidateDiffViewState;
    }
    // Code editor: since we have an explicit selection, clear the
    // cursor state. This avoids a redundant selection change event.
    const candidateEditorViewState = options.viewState;
    if (candidateEditorViewState.cursorState) {
        candidateEditorViewState.cursorState = [];
    }
    return candidateEditorViewState;
}
