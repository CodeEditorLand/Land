import { CharacterClassifier } from '../core/characterClassifier.js';
class Uint8Matrix {
    constructor(rows, cols, defaultValue) {
        const data = new Uint8Array(rows * cols);
        for (let i = 0, len = rows * cols; i < len; i++) {
            data[i] = defaultValue;
        }
        this._data = data;
        this.rows = rows;
        this.cols = cols;
    }
    get(row, col) {
        return this._data[row * this.cols + col];
    }
    set(row, col, value) {
        this._data[row * this.cols + col] = value;
    }
}
export class StateMachine {
    constructor(edges) {
        let maxCharCode = 0;
        let maxState = 0;
        for (let i = 0, len = edges.length; i < len; i++) {
            const [from, chCode, to] = edges[i];
            if (chCode > maxCharCode) {
                maxCharCode = chCode;
            }
            if (from > maxState) {
                maxState = from;
            }
            if (to > maxState) {
                maxState = to;
            }
        }
        maxCharCode++;
        maxState++;
        const states = new Uint8Matrix(maxState, maxCharCode, 0);
        for (let i = 0, len = edges.length; i < len; i++) {
            const [from, chCode, to] = edges[i];
            states.set(from, chCode, to);
        }
        this._states = states;
        this._maxCharCode = maxCharCode;
    }
    nextState(currentState, chCode) {
        if (chCode < 0 || chCode >= this._maxCharCode) {
            return 0;
        }
        return this._states.get(currentState, chCode);
    }
}
let _stateMachine = null;
function getStateMachine() {
    if (_stateMachine === null) {
        _stateMachine = new StateMachine([
            [1, 104, 2],
            [1, 72, 2],
            [1, 102, 6],
            [1, 70, 6],
            [2, 116, 3],
            [2, 84, 3],
            [3, 116, 4],
            [3, 84, 4],
            [4, 112, 5],
            [4, 80, 5],
            [5, 115, 9],
            [5, 83, 9],
            [5, 58, 10],
            [6, 105, 7],
            [6, 73, 7],
            [7, 108, 8],
            [7, 76, 8],
            [8, 101, 9],
            [8, 69, 9],
            [9, 58, 10],
            [10, 47, 11],
            [11, 47, 12],
        ]);
    }
    return _stateMachine;
}
let _classifier = null;
function getClassifier() {
    if (_classifier === null) {
        _classifier = new CharacterClassifier(0);
        const FORCE_TERMINATION_CHARACTERS = ' \t<>\'\"、。｡､，．：；‘〈「『〔（［｛｢｣｝］）〕』」〉’｀～…';
        for (let i = 0; i < FORCE_TERMINATION_CHARACTERS.length; i++) {
            _classifier.set(FORCE_TERMINATION_CHARACTERS.charCodeAt(i), 1);
        }
        const CANNOT_END_WITH_CHARACTERS = '.,;:';
        for (let i = 0; i < CANNOT_END_WITH_CHARACTERS.length; i++) {
            _classifier.set(CANNOT_END_WITH_CHARACTERS.charCodeAt(i), 2);
        }
    }
    return _classifier;
}
export class LinkComputer {
    static _createLink(classifier, line, lineNumber, linkBeginIndex, linkEndIndex) {
        let lastIncludedCharIndex = linkEndIndex - 1;
        do {
            const chCode = line.charCodeAt(lastIncludedCharIndex);
            const chClass = classifier.get(chCode);
            if (chClass !== 2) {
                break;
            }
            lastIncludedCharIndex--;
        } while (lastIncludedCharIndex > linkBeginIndex);
        if (linkBeginIndex > 0) {
            const charCodeBeforeLink = line.charCodeAt(linkBeginIndex - 1);
            const lastCharCodeInLink = line.charCodeAt(lastIncludedCharIndex);
            if ((charCodeBeforeLink === 40 && lastCharCodeInLink === 41)
                || (charCodeBeforeLink === 91 && lastCharCodeInLink === 93)
                || (charCodeBeforeLink === 123 && lastCharCodeInLink === 125)) {
                lastIncludedCharIndex--;
            }
        }
        return {
            range: {
                startLineNumber: lineNumber,
                startColumn: linkBeginIndex + 1,
                endLineNumber: lineNumber,
                endColumn: lastIncludedCharIndex + 2
            },
            url: line.substring(linkBeginIndex, lastIncludedCharIndex + 1)
        };
    }
    static computeLinks(model, stateMachine = getStateMachine()) {
        const classifier = getClassifier();
        const result = [];
        for (let i = 1, lineCount = model.getLineCount(); i <= lineCount; i++) {
            const line = model.getLineContent(i);
            const len = line.length;
            let j = 0;
            let linkBeginIndex = 0;
            let linkBeginChCode = 0;
            let state = 1;
            let hasOpenParens = false;
            let hasOpenSquareBracket = false;
            let inSquareBrackets = false;
            let hasOpenCurlyBracket = false;
            while (j < len) {
                let resetStateMachine = false;
                const chCode = line.charCodeAt(j);
                if (state === 13) {
                    let chClass;
                    switch (chCode) {
                        case 40:
                            hasOpenParens = true;
                            chClass = 0;
                            break;
                        case 41:
                            chClass = (hasOpenParens ? 0 : 1);
                            break;
                        case 91:
                            inSquareBrackets = true;
                            hasOpenSquareBracket = true;
                            chClass = 0;
                            break;
                        case 93:
                            inSquareBrackets = false;
                            chClass = (hasOpenSquareBracket ? 0 : 1);
                            break;
                        case 123:
                            hasOpenCurlyBracket = true;
                            chClass = 0;
                            break;
                        case 125:
                            chClass = (hasOpenCurlyBracket ? 0 : 1);
                            break;
                        case 39:
                        case 34:
                        case 96:
                            if (linkBeginChCode === chCode) {
                                chClass = 1;
                            }
                            else if (linkBeginChCode === 39 || linkBeginChCode === 34 || linkBeginChCode === 96) {
                                chClass = 0;
                            }
                            else {
                                chClass = 1;
                            }
                            break;
                        case 42:
                            chClass = (linkBeginChCode === 42) ? 1 : 0;
                            break;
                        case 124:
                            chClass = (linkBeginChCode === 124) ? 1 : 0;
                            break;
                        case 32:
                            chClass = (inSquareBrackets ? 0 : 1);
                            break;
                        default:
                            chClass = classifier.get(chCode);
                    }
                    if (chClass === 1) {
                        result.push(LinkComputer._createLink(classifier, line, i, linkBeginIndex, j));
                        resetStateMachine = true;
                    }
                }
                else if (state === 12) {
                    let chClass;
                    if (chCode === 91) {
                        hasOpenSquareBracket = true;
                        chClass = 0;
                    }
                    else {
                        chClass = classifier.get(chCode);
                    }
                    if (chClass === 1) {
                        resetStateMachine = true;
                    }
                    else {
                        state = 13;
                    }
                }
                else {
                    state = stateMachine.nextState(state, chCode);
                    if (state === 0) {
                        resetStateMachine = true;
                    }
                }
                if (resetStateMachine) {
                    state = 1;
                    hasOpenParens = false;
                    hasOpenSquareBracket = false;
                    hasOpenCurlyBracket = false;
                    linkBeginIndex = j + 1;
                    linkBeginChCode = chCode;
                }
                j++;
            }
            if (state === 13) {
                result.push(LinkComputer._createLink(classifier, line, i, linkBeginIndex, len));
            }
        }
        return result;
    }
}
export function computeLinks(model) {
    if (!model || typeof model.getLineCount !== 'function' || typeof model.getLineContent !== 'function') {
        return [];
    }
    return LinkComputer.computeLinks(model);
}
