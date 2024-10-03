export class StableEditorScrollState {
    static capture(editor) {
        if (editor.getScrollTop() === 0 || editor.hasPendingScrollAnimation()) {
            return new StableEditorScrollState(editor.getScrollTop(), editor.getContentHeight(), null, 0, null);
        }
        let visiblePosition = null;
        let visiblePositionScrollDelta = 0;
        const visibleRanges = editor.getVisibleRanges();
        if (visibleRanges.length > 0) {
            visiblePosition = visibleRanges[0].getStartPosition();
            const visiblePositionScrollTop = editor.getTopForPosition(visiblePosition.lineNumber, visiblePosition.column);
            visiblePositionScrollDelta = editor.getScrollTop() - visiblePositionScrollTop;
        }
        return new StableEditorScrollState(editor.getScrollTop(), editor.getContentHeight(), visiblePosition, visiblePositionScrollDelta, editor.getPosition());
    }
    constructor(_initialScrollTop, _initialContentHeight, _visiblePosition, _visiblePositionScrollDelta, _cursorPosition) {
        this._initialScrollTop = _initialScrollTop;
        this._initialContentHeight = _initialContentHeight;
        this._visiblePosition = _visiblePosition;
        this._visiblePositionScrollDelta = _visiblePositionScrollDelta;
        this._cursorPosition = _cursorPosition;
    }
    restore(editor) {
        if (this._initialContentHeight === editor.getContentHeight() && this._initialScrollTop === editor.getScrollTop()) {
            return;
        }
        if (this._visiblePosition) {
            const visiblePositionScrollTop = editor.getTopForPosition(this._visiblePosition.lineNumber, this._visiblePosition.column);
            editor.setScrollTop(visiblePositionScrollTop + this._visiblePositionScrollDelta);
        }
    }
    restoreRelativeVerticalPositionOfCursor(editor) {
        if (this._initialContentHeight === editor.getContentHeight() && this._initialScrollTop === editor.getScrollTop()) {
            return;
        }
        const currentCursorPosition = editor.getPosition();
        if (!this._cursorPosition || !currentCursorPosition) {
            return;
        }
        const offset = editor.getTopForLineNumber(currentCursorPosition.lineNumber) - editor.getTopForLineNumber(this._cursorPosition.lineNumber);
        editor.setScrollTop(editor.getScrollTop() + offset, 1);
    }
}
export class StableEditorBottomScrollState {
    static capture(editor) {
        if (editor.hasPendingScrollAnimation()) {
            return new StableEditorBottomScrollState(editor.getScrollTop(), editor.getContentHeight(), null, 0);
        }
        let visiblePosition = null;
        let visiblePositionScrollDelta = 0;
        const visibleRanges = editor.getVisibleRanges();
        if (visibleRanges.length > 0) {
            visiblePosition = visibleRanges.at(-1).getEndPosition();
            const visiblePositionScrollBottom = editor.getBottomForLineNumber(visiblePosition.lineNumber);
            visiblePositionScrollDelta = visiblePositionScrollBottom - editor.getScrollTop();
        }
        return new StableEditorBottomScrollState(editor.getScrollTop(), editor.getContentHeight(), visiblePosition, visiblePositionScrollDelta);
    }
    constructor(_initialScrollTop, _initialContentHeight, _visiblePosition, _visiblePositionScrollDelta) {
        this._initialScrollTop = _initialScrollTop;
        this._initialContentHeight = _initialContentHeight;
        this._visiblePosition = _visiblePosition;
        this._visiblePositionScrollDelta = _visiblePositionScrollDelta;
    }
    restore(editor) {
        if (this._initialContentHeight === editor.getContentHeight() && this._initialScrollTop === editor.getScrollTop()) {
            return;
        }
        if (this._visiblePosition) {
            const visiblePositionScrollBottom = editor.getBottomForLineNumber(this._visiblePosition.lineNumber);
            editor.setScrollTop(visiblePositionScrollBottom - this._visiblePositionScrollDelta, 1);
        }
    }
}
