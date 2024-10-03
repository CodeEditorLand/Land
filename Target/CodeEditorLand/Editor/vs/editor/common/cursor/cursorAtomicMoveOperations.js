import { CursorColumns } from '../core/cursorColumns.js';
export class AtomicTabMoveOperations {
    static whitespaceVisibleColumn(lineContent, position, tabSize) {
        const lineLength = lineContent.length;
        let visibleColumn = 0;
        let prevTabStopPosition = -1;
        let prevTabStopVisibleColumn = -1;
        for (let i = 0; i < lineLength; i++) {
            if (i === position) {
                return [prevTabStopPosition, prevTabStopVisibleColumn, visibleColumn];
            }
            if (visibleColumn % tabSize === 0) {
                prevTabStopPosition = i;
                prevTabStopVisibleColumn = visibleColumn;
            }
            const chCode = lineContent.charCodeAt(i);
            switch (chCode) {
                case 32:
                    visibleColumn += 1;
                    break;
                case 9:
                    visibleColumn = CursorColumns.nextRenderTabStop(visibleColumn, tabSize);
                    break;
                default:
                    return [-1, -1, -1];
            }
        }
        if (position === lineLength) {
            return [prevTabStopPosition, prevTabStopVisibleColumn, visibleColumn];
        }
        return [-1, -1, -1];
    }
    static atomicPosition(lineContent, position, tabSize, direction) {
        const lineLength = lineContent.length;
        const [prevTabStopPosition, prevTabStopVisibleColumn, visibleColumn] = AtomicTabMoveOperations.whitespaceVisibleColumn(lineContent, position, tabSize);
        if (visibleColumn === -1) {
            return -1;
        }
        let left;
        switch (direction) {
            case 0:
                left = true;
                break;
            case 1:
                left = false;
                break;
            case 2:
                if (visibleColumn % tabSize === 0) {
                    return position;
                }
                left = visibleColumn % tabSize <= (tabSize / 2);
                break;
        }
        if (left) {
            if (prevTabStopPosition === -1) {
                return -1;
            }
            let currentVisibleColumn = prevTabStopVisibleColumn;
            for (let i = prevTabStopPosition; i < lineLength; ++i) {
                if (currentVisibleColumn === prevTabStopVisibleColumn + tabSize) {
                    return prevTabStopPosition;
                }
                const chCode = lineContent.charCodeAt(i);
                switch (chCode) {
                    case 32:
                        currentVisibleColumn += 1;
                        break;
                    case 9:
                        currentVisibleColumn = CursorColumns.nextRenderTabStop(currentVisibleColumn, tabSize);
                        break;
                    default:
                        return -1;
                }
            }
            if (currentVisibleColumn === prevTabStopVisibleColumn + tabSize) {
                return prevTabStopPosition;
            }
            return -1;
        }
        const targetVisibleColumn = CursorColumns.nextRenderTabStop(visibleColumn, tabSize);
        let currentVisibleColumn = visibleColumn;
        for (let i = position; i < lineLength; i++) {
            if (currentVisibleColumn === targetVisibleColumn) {
                return i;
            }
            const chCode = lineContent.charCodeAt(i);
            switch (chCode) {
                case 32:
                    currentVisibleColumn += 1;
                    break;
                case 9:
                    currentVisibleColumn = CursorColumns.nextRenderTabStop(currentVisibleColumn, tabSize);
                    break;
                default:
                    return -1;
            }
        }
        if (currentVisibleColumn === targetVisibleColumn) {
            return lineLength;
        }
        return -1;
    }
}
