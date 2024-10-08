import { RawContextKey } from '../../platform/contextkey/common/contextkey.js';
export declare namespace EditorContextKeys {
    const editorSimpleInput: RawContextKey<boolean>;
    /**
     * A context key that is set when the editor's text has focus (cursor is blinking).
     * Is false when focus is in simple editor widgets (repl input, scm commit input).
     */
    const editorTextFocus: RawContextKey<boolean>;
    /**
     * A context key that is set when the editor's text or an editor's widget has focus.
     */
    const focus: RawContextKey<boolean>;
    /**
     * A context key that is set when any editor input has focus (regular editor, repl input...).
     */
    const textInputFocus: RawContextKey<boolean>;
    const readOnly: RawContextKey<boolean>;
    const inDiffEditor: RawContextKey<boolean>;
    const isEmbeddedDiffEditor: RawContextKey<boolean>;
    const multiDiffEditorAllCollapsed: RawContextKey<boolean>;
    const hasChanges: RawContextKey<boolean>;
    const comparingMovedCode: RawContextKey<boolean>;
    const accessibleDiffViewerVisible: RawContextKey<boolean>;
    const diffEditorRenderSideBySideInlineBreakpointReached: RawContextKey<boolean>;
    const diffEditorInlineMode: RawContextKey<boolean>;
    const diffEditorOriginalWritable: RawContextKey<boolean>;
    const diffEditorModifiedWritable: RawContextKey<boolean>;
    const diffEditorOriginalUri: RawContextKey<string>;
    const diffEditorModifiedUri: RawContextKey<string>;
    const columnSelection: RawContextKey<boolean>;
    const writable: import("../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    const hasNonEmptySelection: RawContextKey<boolean>;
    const hasOnlyEmptySelection: import("../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    const hasMultipleSelections: RawContextKey<boolean>;
    const hasSingleSelection: import("../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    const tabMovesFocus: RawContextKey<boolean>;
    const tabDoesNotMoveFocus: import("../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    const isInEmbeddedEditor: RawContextKey<boolean>;
    const canUndo: RawContextKey<boolean>;
    const canRedo: RawContextKey<boolean>;
    const hoverVisible: RawContextKey<boolean>;
    const hoverFocused: RawContextKey<boolean>;
    const stickyScrollFocused: RawContextKey<boolean>;
    const stickyScrollVisible: RawContextKey<boolean>;
    const standaloneColorPickerVisible: RawContextKey<boolean>;
    const standaloneColorPickerFocused: RawContextKey<boolean>;
    /**
     * A context key that is set when an editor is part of a larger editor, like notebooks or
     * (future) a diff editor
     */
    const inCompositeEditor: RawContextKey<boolean>;
    const notInCompositeEditor: import("../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    const languageId: RawContextKey<string>;
    const hasCompletionItemProvider: RawContextKey<boolean>;
    const hasCodeActionsProvider: RawContextKey<boolean>;
    const hasCodeLensProvider: RawContextKey<boolean>;
    const hasDefinitionProvider: RawContextKey<boolean>;
    const hasDeclarationProvider: RawContextKey<boolean>;
    const hasImplementationProvider: RawContextKey<boolean>;
    const hasTypeDefinitionProvider: RawContextKey<boolean>;
    const hasHoverProvider: RawContextKey<boolean>;
    const hasDocumentHighlightProvider: RawContextKey<boolean>;
    const hasDocumentSymbolProvider: RawContextKey<boolean>;
    const hasReferenceProvider: RawContextKey<boolean>;
    const hasRenameProvider: RawContextKey<boolean>;
    const hasSignatureHelpProvider: RawContextKey<boolean>;
    const hasInlayHintsProvider: RawContextKey<boolean>;
    const hasDocumentFormattingProvider: RawContextKey<boolean>;
    const hasDocumentSelectionFormattingProvider: RawContextKey<boolean>;
    const hasMultipleDocumentFormattingProvider: RawContextKey<boolean>;
    const hasMultipleDocumentSelectionFormattingProvider: RawContextKey<boolean>;
}
