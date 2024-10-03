import { CancellationTokenSource } from '../../../base/common/cancellation.js';
import { Emitter } from '../../../base/common/event.js';
import { KeyChord } from '../../../base/common/keyCodes.js';
import { URI } from '../../../base/common/uri.js';
import { Position } from '../core/position.js';
import { Range } from '../core/range.js';
import { Selection } from '../core/selection.js';
import { Token } from '../languages.js';
import * as standaloneEnums from '../standalone/standaloneEnums.js';
export class KeyMod {
    static { this.CtrlCmd = 2048; }
    static { this.Shift = 1024; }
    static { this.Alt = 512; }
    static { this.WinCtrl = 256; }
    static chord(firstPart, secondPart) {
        return KeyChord(firstPart, secondPart);
    }
}
export function createMonacoBaseAPI() {
    return {
        editor: undefined,
        languages: undefined,
        CancellationTokenSource: CancellationTokenSource,
        Emitter: Emitter,
        KeyCode: standaloneEnums.KeyCode,
        KeyMod: KeyMod,
        Position: Position,
        Range: Range,
        Selection: Selection,
        SelectionDirection: standaloneEnums.SelectionDirection,
        MarkerSeverity: standaloneEnums.MarkerSeverity,
        MarkerTag: standaloneEnums.MarkerTag,
        Uri: URI,
        Token: Token
    };
}
