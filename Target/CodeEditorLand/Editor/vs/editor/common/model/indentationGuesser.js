class SpacesDiffResult {
    constructor() {
        this.spacesDiff = 0;
        this.looksLikeAlignment = false;
    }
}
function spacesDiff(a, aLength, b, bLength, result) {
    result.spacesDiff = 0;
    result.looksLikeAlignment = false;
    let i;
    for (i = 0; i < aLength && i < bLength; i++) {
        const aCharCode = a.charCodeAt(i);
        const bCharCode = b.charCodeAt(i);
        if (aCharCode !== bCharCode) {
            break;
        }
    }
    let aSpacesCnt = 0, aTabsCount = 0;
    for (let j = i; j < aLength; j++) {
        const aCharCode = a.charCodeAt(j);
        if (aCharCode === 32) {
            aSpacesCnt++;
        }
        else {
            aTabsCount++;
        }
    }
    let bSpacesCnt = 0, bTabsCount = 0;
    for (let j = i; j < bLength; j++) {
        const bCharCode = b.charCodeAt(j);
        if (bCharCode === 32) {
            bSpacesCnt++;
        }
        else {
            bTabsCount++;
        }
    }
    if (aSpacesCnt > 0 && aTabsCount > 0) {
        return;
    }
    if (bSpacesCnt > 0 && bTabsCount > 0) {
        return;
    }
    const tabsDiff = Math.abs(aTabsCount - bTabsCount);
    const spacesDiff = Math.abs(aSpacesCnt - bSpacesCnt);
    if (tabsDiff === 0) {
        result.spacesDiff = spacesDiff;
        if (spacesDiff > 0 && 0 <= bSpacesCnt - 1 && bSpacesCnt - 1 < a.length && bSpacesCnt < b.length) {
            if (b.charCodeAt(bSpacesCnt) !== 32 && a.charCodeAt(bSpacesCnt - 1) === 32) {
                if (a.charCodeAt(a.length - 1) === 44) {
                    result.looksLikeAlignment = true;
                }
            }
        }
        return;
    }
    if (spacesDiff % tabsDiff === 0) {
        result.spacesDiff = spacesDiff / tabsDiff;
        return;
    }
}
export function guessIndentation(source, defaultTabSize, defaultInsertSpaces) {
    const linesCount = Math.min(source.getLineCount(), 10000);
    let linesIndentedWithTabsCount = 0;
    let linesIndentedWithSpacesCount = 0;
    let previousLineText = '';
    let previousLineIndentation = 0;
    const ALLOWED_TAB_SIZE_GUESSES = [2, 4, 6, 8, 3, 5, 7];
    const MAX_ALLOWED_TAB_SIZE_GUESS = 8;
    const spacesDiffCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const tmp = new SpacesDiffResult();
    for (let lineNumber = 1; lineNumber <= linesCount; lineNumber++) {
        const currentLineLength = source.getLineLength(lineNumber);
        const currentLineText = source.getLineContent(lineNumber);
        const useCurrentLineText = (currentLineLength <= 65536);
        let currentLineHasContent = false;
        let currentLineIndentation = 0;
        let currentLineSpacesCount = 0;
        let currentLineTabsCount = 0;
        for (let j = 0, lenJ = currentLineLength; j < lenJ; j++) {
            const charCode = (useCurrentLineText ? currentLineText.charCodeAt(j) : source.getLineCharCode(lineNumber, j));
            if (charCode === 9) {
                currentLineTabsCount++;
            }
            else if (charCode === 32) {
                currentLineSpacesCount++;
            }
            else {
                currentLineHasContent = true;
                currentLineIndentation = j;
                break;
            }
        }
        if (!currentLineHasContent) {
            continue;
        }
        if (currentLineTabsCount > 0) {
            linesIndentedWithTabsCount++;
        }
        else if (currentLineSpacesCount > 1) {
            linesIndentedWithSpacesCount++;
        }
        spacesDiff(previousLineText, previousLineIndentation, currentLineText, currentLineIndentation, tmp);
        if (tmp.looksLikeAlignment) {
            if (!(defaultInsertSpaces && defaultTabSize === tmp.spacesDiff)) {
                continue;
            }
        }
        const currentSpacesDiff = tmp.spacesDiff;
        if (currentSpacesDiff <= MAX_ALLOWED_TAB_SIZE_GUESS) {
            spacesDiffCount[currentSpacesDiff]++;
        }
        previousLineText = currentLineText;
        previousLineIndentation = currentLineIndentation;
    }
    let insertSpaces = defaultInsertSpaces;
    if (linesIndentedWithTabsCount !== linesIndentedWithSpacesCount) {
        insertSpaces = (linesIndentedWithTabsCount < linesIndentedWithSpacesCount);
    }
    let tabSize = defaultTabSize;
    if (insertSpaces) {
        let tabSizeScore = (insertSpaces ? 0 : 0.1 * linesCount);
        ALLOWED_TAB_SIZE_GUESSES.forEach((possibleTabSize) => {
            const possibleTabSizeScore = spacesDiffCount[possibleTabSize];
            if (possibleTabSizeScore > tabSizeScore) {
                tabSizeScore = possibleTabSizeScore;
                tabSize = possibleTabSize;
            }
        });
        if (tabSize === 4 && spacesDiffCount[4] > 0 && spacesDiffCount[2] > 0 && spacesDiffCount[2] >= spacesDiffCount[4] / 2) {
            tabSize = 2;
        }
    }
    return {
        insertSpaces: insertSpaces,
        tabSize: tabSize
    };
}
