import { posix, win32 } from '../../../../../base/common/path.js';
export function convertLinkRangeToBuffer(lines, bufferWidth, range, startLine) {
    const bufferRange = {
        start: {
            x: range.startColumn,
            y: range.startLineNumber + startLine
        },
        end: {
            x: range.endColumn - 1,
            y: range.endLineNumber + startLine
        }
    };
    let startOffset = 0;
    const startWrappedLineCount = Math.ceil(range.startColumn / bufferWidth);
    for (let y = 0; y < Math.min(startWrappedLineCount); y++) {
        const lineLength = Math.min(bufferWidth, (range.startColumn - 1) - y * bufferWidth);
        let lineOffset = 0;
        const line = lines[y];
        if (!line) {
            break;
        }
        for (let x = 0; x < Math.min(bufferWidth, lineLength + lineOffset); x++) {
            const cell = line.getCell(x);
            if (!cell) {
                break;
            }
            const width = cell.getWidth();
            if (width === 2) {
                lineOffset++;
            }
            const char = cell.getChars();
            if (char.length > 1) {
                lineOffset -= char.length - 1;
            }
        }
        startOffset += lineOffset;
    }
    let endOffset = 0;
    const endWrappedLineCount = Math.ceil(range.endColumn / bufferWidth);
    for (let y = Math.max(0, startWrappedLineCount - 1); y < endWrappedLineCount; y++) {
        const start = (y === startWrappedLineCount - 1 ? (range.startColumn - 1 + startOffset) % bufferWidth : 0);
        const lineLength = Math.min(bufferWidth, range.endColumn + startOffset - y * bufferWidth);
        let lineOffset = 0;
        const line = lines[y];
        if (!line) {
            break;
        }
        for (let x = start; x < Math.min(bufferWidth, lineLength + lineOffset); x++) {
            const cell = line.getCell(x);
            if (!cell) {
                break;
            }
            const width = cell.getWidth();
            const chars = cell.getChars();
            if (width === 2) {
                lineOffset++;
            }
            if (x === bufferWidth - 1 && chars === '') {
                lineOffset++;
            }
            if (chars.length > 1) {
                lineOffset -= chars.length - 1;
            }
        }
        endOffset += lineOffset;
    }
    bufferRange.start.x += startOffset;
    bufferRange.end.x += startOffset + endOffset;
    while (bufferRange.start.x > bufferWidth) {
        bufferRange.start.x -= bufferWidth;
        bufferRange.start.y++;
    }
    while (bufferRange.end.x > bufferWidth) {
        bufferRange.end.x -= bufferWidth;
        bufferRange.end.y++;
    }
    return bufferRange;
}
export function convertBufferRangeToViewport(bufferRange, viewportY) {
    return {
        start: {
            x: bufferRange.start.x - 1,
            y: bufferRange.start.y - viewportY - 1
        },
        end: {
            x: bufferRange.end.x - 1,
            y: bufferRange.end.y - viewportY - 1
        }
    };
}
export function getXtermLineContent(buffer, lineStart, lineEnd, cols) {
    const maxLineLength = Math.max(2048, cols * 2);
    lineEnd = Math.min(lineEnd, lineStart + maxLineLength);
    let content = '';
    for (let i = lineStart; i <= lineEnd; i++) {
        const line = buffer.getLine(i);
        if (line) {
            content += line.translateToString(true, 0, cols);
        }
    }
    return content;
}
export function getXtermRangesByAttr(buffer, lineStart, lineEnd, cols) {
    let bufferRangeStart = undefined;
    let lastFgAttr = -1;
    let lastBgAttr = -1;
    const ranges = [];
    for (let y = lineStart; y <= lineEnd; y++) {
        const line = buffer.getLine(y);
        if (!line) {
            continue;
        }
        for (let x = 0; x < cols; x++) {
            const cell = line.getCell(x);
            if (!cell) {
                break;
            }
            const thisFgAttr = (cell.isBold() |
                cell.isInverse() |
                cell.isStrikethrough() |
                cell.isUnderline());
            const thisBgAttr = (cell.isDim() |
                cell.isItalic());
            if (lastFgAttr === -1 || lastBgAttr === -1) {
                bufferRangeStart = { x, y };
            }
            else {
                if (lastFgAttr !== thisFgAttr || lastBgAttr !== thisBgAttr) {
                    const bufferRangeEnd = { x, y };
                    ranges.push({
                        start: bufferRangeStart,
                        end: bufferRangeEnd
                    });
                    bufferRangeStart = { x, y };
                }
            }
            lastFgAttr = thisFgAttr;
            lastBgAttr = thisBgAttr;
        }
    }
    return ranges;
}
export function updateLinkWithRelativeCwd(capabilities, y, text, osPath, logService) {
    const cwd = capabilities.get(2)?.getCwdForLine(y);
    logService.trace('terminalLinkHelpers#updateLinkWithRelativeCwd cwd', cwd);
    if (!cwd) {
        return undefined;
    }
    const result = [];
    const sep = osPath.sep;
    if (!text.includes(sep)) {
        result.push(osPath.resolve(cwd + sep + text));
    }
    else {
        let commonDirs = 0;
        let i = 0;
        const cwdPath = cwd.split(sep).reverse();
        const linkPath = text.split(sep);
        while (i < cwdPath.length) {
            result.push(osPath.resolve(cwd + sep + linkPath.slice(commonDirs).join(sep)));
            if (cwdPath[i] === linkPath[i]) {
                commonDirs++;
            }
            else {
                break;
            }
            i++;
        }
    }
    return result;
}
export function osPathModule(os) {
    return os === 1 ? win32 : posix;
}
