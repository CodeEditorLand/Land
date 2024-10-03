import { createScanner as createJSONScanner } from '../../../../base/common/json.js';
import { Position } from '../../../../editor/common/core/position.js';
import { Range } from '../../../../editor/common/core/range.js';
export class SmartSnippetInserter {
    static hasOpenBrace(scanner) {
        while (scanner.scan() !== 17) {
            const kind = scanner.getToken();
            if (kind === 1) {
                return true;
            }
        }
        return false;
    }
    static offsetToPosition(model, offset) {
        let offsetBeforeLine = 0;
        const eolLength = model.getEOL().length;
        const lineCount = model.getLineCount();
        for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
            const lineTotalLength = model.getLineLength(lineNumber) + eolLength;
            const offsetAfterLine = offsetBeforeLine + lineTotalLength;
            if (offsetAfterLine > offset) {
                return new Position(lineNumber, offset - offsetBeforeLine + 1);
            }
            offsetBeforeLine = offsetAfterLine;
        }
        return new Position(lineCount, model.getLineMaxColumn(lineCount));
    }
    static insertSnippet(model, _position) {
        const desiredPosition = model.getValueLengthInRange(new Range(1, 1, _position.lineNumber, _position.column));
        let State;
        (function (State) {
            State[State["INVALID"] = 0] = "INVALID";
            State[State["AFTER_OBJECT"] = 1] = "AFTER_OBJECT";
            State[State["BEFORE_OBJECT"] = 2] = "BEFORE_OBJECT";
        })(State || (State = {}));
        let currentState = State.INVALID;
        let lastValidPos = -1;
        let lastValidState = State.INVALID;
        const scanner = createJSONScanner(model.getValue());
        let arrayLevel = 0;
        let objLevel = 0;
        const checkRangeStatus = (pos, state) => {
            if (state !== State.INVALID && arrayLevel === 1 && objLevel === 0) {
                currentState = state;
                lastValidPos = pos;
                lastValidState = state;
            }
            else {
                if (currentState !== State.INVALID) {
                    currentState = State.INVALID;
                    lastValidPos = scanner.getTokenOffset();
                }
            }
        };
        while (scanner.scan() !== 17) {
            const currentPos = scanner.getPosition();
            const kind = scanner.getToken();
            let goodKind = false;
            switch (kind) {
                case 3:
                    goodKind = true;
                    arrayLevel++;
                    checkRangeStatus(currentPos, State.BEFORE_OBJECT);
                    break;
                case 4:
                    goodKind = true;
                    arrayLevel--;
                    checkRangeStatus(currentPos, State.INVALID);
                    break;
                case 5:
                    goodKind = true;
                    checkRangeStatus(currentPos, State.BEFORE_OBJECT);
                    break;
                case 1:
                    goodKind = true;
                    objLevel++;
                    checkRangeStatus(currentPos, State.INVALID);
                    break;
                case 2:
                    goodKind = true;
                    objLevel--;
                    checkRangeStatus(currentPos, State.AFTER_OBJECT);
                    break;
                case 15:
                case 14:
                    goodKind = true;
            }
            if (currentPos >= desiredPosition && (currentState !== State.INVALID || lastValidPos !== -1)) {
                let acceptPosition;
                let acceptState;
                if (currentState !== State.INVALID) {
                    acceptPosition = (goodKind ? currentPos : scanner.getTokenOffset());
                    acceptState = currentState;
                }
                else {
                    acceptPosition = lastValidPos;
                    acceptState = lastValidState;
                }
                if (acceptState === State.AFTER_OBJECT) {
                    return {
                        position: this.offsetToPosition(model, acceptPosition),
                        prepend: ',',
                        append: ''
                    };
                }
                else {
                    scanner.setPosition(acceptPosition);
                    return {
                        position: this.offsetToPosition(model, acceptPosition),
                        prepend: '',
                        append: this.hasOpenBrace(scanner) ? ',' : ''
                    };
                }
            }
        }
        const modelLineCount = model.getLineCount();
        return {
            position: new Position(modelLineCount, model.getLineMaxColumn(modelLineCount)),
            prepend: '\n[',
            append: ']'
        };
    }
}
