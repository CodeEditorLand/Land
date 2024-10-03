class KeyCodeStrMap {
    constructor() {
        this._keyCodeToStr = [];
        this._strToKeyCode = Object.create(null);
    }
    define(keyCode, str) {
        this._keyCodeToStr[keyCode] = str;
        this._strToKeyCode[str.toLowerCase()] = keyCode;
    }
    keyCodeToStr(keyCode) {
        return this._keyCodeToStr[keyCode];
    }
    strToKeyCode(str) {
        return this._strToKeyCode[str.toLowerCase()] || 0;
    }
}
const uiMap = new KeyCodeStrMap();
const userSettingsUSMap = new KeyCodeStrMap();
const userSettingsGeneralMap = new KeyCodeStrMap();
export const EVENT_KEY_CODE_MAP = new Array(230);
export const NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE = {};
const scanCodeIntToStr = [];
const scanCodeStrToInt = Object.create(null);
const scanCodeLowerCaseStrToInt = Object.create(null);
export const ScanCodeUtils = {
    lowerCaseToEnum: (scanCode) => scanCodeLowerCaseStrToInt[scanCode] || 0,
    toEnum: (scanCode) => scanCodeStrToInt[scanCode] || 0,
    toString: (scanCode) => scanCodeIntToStr[scanCode] || 'None'
};
export const IMMUTABLE_CODE_TO_KEY_CODE = [];
export const IMMUTABLE_KEY_CODE_TO_CODE = [];
for (let i = 0; i <= 193; i++) {
    IMMUTABLE_CODE_TO_KEY_CODE[i] = -1;
}
for (let i = 0; i <= 132; i++) {
    IMMUTABLE_KEY_CODE_TO_CODE[i] = -1;
}
(function () {
    const empty = '';
    const mappings = [
        [1, 0, 'None', 0, 'unknown', 0, 'VK_UNKNOWN', empty, empty],
        [1, 1, 'Hyper', 0, empty, 0, empty, empty, empty],
        [1, 2, 'Super', 0, empty, 0, empty, empty, empty],
        [1, 3, 'Fn', 0, empty, 0, empty, empty, empty],
        [1, 4, 'FnLock', 0, empty, 0, empty, empty, empty],
        [1, 5, 'Suspend', 0, empty, 0, empty, empty, empty],
        [1, 6, 'Resume', 0, empty, 0, empty, empty, empty],
        [1, 7, 'Turbo', 0, empty, 0, empty, empty, empty],
        [1, 8, 'Sleep', 0, empty, 0, 'VK_SLEEP', empty, empty],
        [1, 9, 'WakeUp', 0, empty, 0, empty, empty, empty],
        [0, 10, 'KeyA', 31, 'A', 65, 'VK_A', empty, empty],
        [0, 11, 'KeyB', 32, 'B', 66, 'VK_B', empty, empty],
        [0, 12, 'KeyC', 33, 'C', 67, 'VK_C', empty, empty],
        [0, 13, 'KeyD', 34, 'D', 68, 'VK_D', empty, empty],
        [0, 14, 'KeyE', 35, 'E', 69, 'VK_E', empty, empty],
        [0, 15, 'KeyF', 36, 'F', 70, 'VK_F', empty, empty],
        [0, 16, 'KeyG', 37, 'G', 71, 'VK_G', empty, empty],
        [0, 17, 'KeyH', 38, 'H', 72, 'VK_H', empty, empty],
        [0, 18, 'KeyI', 39, 'I', 73, 'VK_I', empty, empty],
        [0, 19, 'KeyJ', 40, 'J', 74, 'VK_J', empty, empty],
        [0, 20, 'KeyK', 41, 'K', 75, 'VK_K', empty, empty],
        [0, 21, 'KeyL', 42, 'L', 76, 'VK_L', empty, empty],
        [0, 22, 'KeyM', 43, 'M', 77, 'VK_M', empty, empty],
        [0, 23, 'KeyN', 44, 'N', 78, 'VK_N', empty, empty],
        [0, 24, 'KeyO', 45, 'O', 79, 'VK_O', empty, empty],
        [0, 25, 'KeyP', 46, 'P', 80, 'VK_P', empty, empty],
        [0, 26, 'KeyQ', 47, 'Q', 81, 'VK_Q', empty, empty],
        [0, 27, 'KeyR', 48, 'R', 82, 'VK_R', empty, empty],
        [0, 28, 'KeyS', 49, 'S', 83, 'VK_S', empty, empty],
        [0, 29, 'KeyT', 50, 'T', 84, 'VK_T', empty, empty],
        [0, 30, 'KeyU', 51, 'U', 85, 'VK_U', empty, empty],
        [0, 31, 'KeyV', 52, 'V', 86, 'VK_V', empty, empty],
        [0, 32, 'KeyW', 53, 'W', 87, 'VK_W', empty, empty],
        [0, 33, 'KeyX', 54, 'X', 88, 'VK_X', empty, empty],
        [0, 34, 'KeyY', 55, 'Y', 89, 'VK_Y', empty, empty],
        [0, 35, 'KeyZ', 56, 'Z', 90, 'VK_Z', empty, empty],
        [0, 36, 'Digit1', 22, '1', 49, 'VK_1', empty, empty],
        [0, 37, 'Digit2', 23, '2', 50, 'VK_2', empty, empty],
        [0, 38, 'Digit3', 24, '3', 51, 'VK_3', empty, empty],
        [0, 39, 'Digit4', 25, '4', 52, 'VK_4', empty, empty],
        [0, 40, 'Digit5', 26, '5', 53, 'VK_5', empty, empty],
        [0, 41, 'Digit6', 27, '6', 54, 'VK_6', empty, empty],
        [0, 42, 'Digit7', 28, '7', 55, 'VK_7', empty, empty],
        [0, 43, 'Digit8', 29, '8', 56, 'VK_8', empty, empty],
        [0, 44, 'Digit9', 30, '9', 57, 'VK_9', empty, empty],
        [0, 45, 'Digit0', 21, '0', 48, 'VK_0', empty, empty],
        [1, 46, 'Enter', 3, 'Enter', 13, 'VK_RETURN', empty, empty],
        [1, 47, 'Escape', 9, 'Escape', 27, 'VK_ESCAPE', empty, empty],
        [1, 48, 'Backspace', 1, 'Backspace', 8, 'VK_BACK', empty, empty],
        [1, 49, 'Tab', 2, 'Tab', 9, 'VK_TAB', empty, empty],
        [1, 50, 'Space', 10, 'Space', 32, 'VK_SPACE', empty, empty],
        [0, 51, 'Minus', 88, '-', 189, 'VK_OEM_MINUS', '-', 'OEM_MINUS'],
        [0, 52, 'Equal', 86, '=', 187, 'VK_OEM_PLUS', '=', 'OEM_PLUS'],
        [0, 53, 'BracketLeft', 92, '[', 219, 'VK_OEM_4', '[', 'OEM_4'],
        [0, 54, 'BracketRight', 94, ']', 221, 'VK_OEM_6', ']', 'OEM_6'],
        [0, 55, 'Backslash', 93, '\\', 220, 'VK_OEM_5', '\\', 'OEM_5'],
        [0, 56, 'IntlHash', 0, empty, 0, empty, empty, empty],
        [0, 57, 'Semicolon', 85, ';', 186, 'VK_OEM_1', ';', 'OEM_1'],
        [0, 58, 'Quote', 95, '\'', 222, 'VK_OEM_7', '\'', 'OEM_7'],
        [0, 59, 'Backquote', 91, '`', 192, 'VK_OEM_3', '`', 'OEM_3'],
        [0, 60, 'Comma', 87, ',', 188, 'VK_OEM_COMMA', ',', 'OEM_COMMA'],
        [0, 61, 'Period', 89, '.', 190, 'VK_OEM_PERIOD', '.', 'OEM_PERIOD'],
        [0, 62, 'Slash', 90, '/', 191, 'VK_OEM_2', '/', 'OEM_2'],
        [1, 63, 'CapsLock', 8, 'CapsLock', 20, 'VK_CAPITAL', empty, empty],
        [1, 64, 'F1', 59, 'F1', 112, 'VK_F1', empty, empty],
        [1, 65, 'F2', 60, 'F2', 113, 'VK_F2', empty, empty],
        [1, 66, 'F3', 61, 'F3', 114, 'VK_F3', empty, empty],
        [1, 67, 'F4', 62, 'F4', 115, 'VK_F4', empty, empty],
        [1, 68, 'F5', 63, 'F5', 116, 'VK_F5', empty, empty],
        [1, 69, 'F6', 64, 'F6', 117, 'VK_F6', empty, empty],
        [1, 70, 'F7', 65, 'F7', 118, 'VK_F7', empty, empty],
        [1, 71, 'F8', 66, 'F8', 119, 'VK_F8', empty, empty],
        [1, 72, 'F9', 67, 'F9', 120, 'VK_F9', empty, empty],
        [1, 73, 'F10', 68, 'F10', 121, 'VK_F10', empty, empty],
        [1, 74, 'F11', 69, 'F11', 122, 'VK_F11', empty, empty],
        [1, 75, 'F12', 70, 'F12', 123, 'VK_F12', empty, empty],
        [1, 76, 'PrintScreen', 0, empty, 0, empty, empty, empty],
        [1, 77, 'ScrollLock', 84, 'ScrollLock', 145, 'VK_SCROLL', empty, empty],
        [1, 78, 'Pause', 7, 'PauseBreak', 19, 'VK_PAUSE', empty, empty],
        [1, 79, 'Insert', 19, 'Insert', 45, 'VK_INSERT', empty, empty],
        [1, 80, 'Home', 14, 'Home', 36, 'VK_HOME', empty, empty],
        [1, 81, 'PageUp', 11, 'PageUp', 33, 'VK_PRIOR', empty, empty],
        [1, 82, 'Delete', 20, 'Delete', 46, 'VK_DELETE', empty, empty],
        [1, 83, 'End', 13, 'End', 35, 'VK_END', empty, empty],
        [1, 84, 'PageDown', 12, 'PageDown', 34, 'VK_NEXT', empty, empty],
        [1, 85, 'ArrowRight', 17, 'RightArrow', 39, 'VK_RIGHT', 'Right', empty],
        [1, 86, 'ArrowLeft', 15, 'LeftArrow', 37, 'VK_LEFT', 'Left', empty],
        [1, 87, 'ArrowDown', 18, 'DownArrow', 40, 'VK_DOWN', 'Down', empty],
        [1, 88, 'ArrowUp', 16, 'UpArrow', 38, 'VK_UP', 'Up', empty],
        [1, 89, 'NumLock', 83, 'NumLock', 144, 'VK_NUMLOCK', empty, empty],
        [1, 90, 'NumpadDivide', 113, 'NumPad_Divide', 111, 'VK_DIVIDE', empty, empty],
        [1, 91, 'NumpadMultiply', 108, 'NumPad_Multiply', 106, 'VK_MULTIPLY', empty, empty],
        [1, 92, 'NumpadSubtract', 111, 'NumPad_Subtract', 109, 'VK_SUBTRACT', empty, empty],
        [1, 93, 'NumpadAdd', 109, 'NumPad_Add', 107, 'VK_ADD', empty, empty],
        [1, 94, 'NumpadEnter', 3, empty, 0, empty, empty, empty],
        [1, 95, 'Numpad1', 99, 'NumPad1', 97, 'VK_NUMPAD1', empty, empty],
        [1, 96, 'Numpad2', 100, 'NumPad2', 98, 'VK_NUMPAD2', empty, empty],
        [1, 97, 'Numpad3', 101, 'NumPad3', 99, 'VK_NUMPAD3', empty, empty],
        [1, 98, 'Numpad4', 102, 'NumPad4', 100, 'VK_NUMPAD4', empty, empty],
        [1, 99, 'Numpad5', 103, 'NumPad5', 101, 'VK_NUMPAD5', empty, empty],
        [1, 100, 'Numpad6', 104, 'NumPad6', 102, 'VK_NUMPAD6', empty, empty],
        [1, 101, 'Numpad7', 105, 'NumPad7', 103, 'VK_NUMPAD7', empty, empty],
        [1, 102, 'Numpad8', 106, 'NumPad8', 104, 'VK_NUMPAD8', empty, empty],
        [1, 103, 'Numpad9', 107, 'NumPad9', 105, 'VK_NUMPAD9', empty, empty],
        [1, 104, 'Numpad0', 98, 'NumPad0', 96, 'VK_NUMPAD0', empty, empty],
        [1, 105, 'NumpadDecimal', 112, 'NumPad_Decimal', 110, 'VK_DECIMAL', empty, empty],
        [0, 106, 'IntlBackslash', 97, 'OEM_102', 226, 'VK_OEM_102', empty, empty],
        [1, 107, 'ContextMenu', 58, 'ContextMenu', 93, empty, empty, empty],
        [1, 108, 'Power', 0, empty, 0, empty, empty, empty],
        [1, 109, 'NumpadEqual', 0, empty, 0, empty, empty, empty],
        [1, 110, 'F13', 71, 'F13', 124, 'VK_F13', empty, empty],
        [1, 111, 'F14', 72, 'F14', 125, 'VK_F14', empty, empty],
        [1, 112, 'F15', 73, 'F15', 126, 'VK_F15', empty, empty],
        [1, 113, 'F16', 74, 'F16', 127, 'VK_F16', empty, empty],
        [1, 114, 'F17', 75, 'F17', 128, 'VK_F17', empty, empty],
        [1, 115, 'F18', 76, 'F18', 129, 'VK_F18', empty, empty],
        [1, 116, 'F19', 77, 'F19', 130, 'VK_F19', empty, empty],
        [1, 117, 'F20', 78, 'F20', 131, 'VK_F20', empty, empty],
        [1, 118, 'F21', 79, 'F21', 132, 'VK_F21', empty, empty],
        [1, 119, 'F22', 80, 'F22', 133, 'VK_F22', empty, empty],
        [1, 120, 'F23', 81, 'F23', 134, 'VK_F23', empty, empty],
        [1, 121, 'F24', 82, 'F24', 135, 'VK_F24', empty, empty],
        [1, 122, 'Open', 0, empty, 0, empty, empty, empty],
        [1, 123, 'Help', 0, empty, 0, empty, empty, empty],
        [1, 124, 'Select', 0, empty, 0, empty, empty, empty],
        [1, 125, 'Again', 0, empty, 0, empty, empty, empty],
        [1, 126, 'Undo', 0, empty, 0, empty, empty, empty],
        [1, 127, 'Cut', 0, empty, 0, empty, empty, empty],
        [1, 128, 'Copy', 0, empty, 0, empty, empty, empty],
        [1, 129, 'Paste', 0, empty, 0, empty, empty, empty],
        [1, 130, 'Find', 0, empty, 0, empty, empty, empty],
        [1, 131, 'AudioVolumeMute', 117, 'AudioVolumeMute', 173, 'VK_VOLUME_MUTE', empty, empty],
        [1, 132, 'AudioVolumeUp', 118, 'AudioVolumeUp', 175, 'VK_VOLUME_UP', empty, empty],
        [1, 133, 'AudioVolumeDown', 119, 'AudioVolumeDown', 174, 'VK_VOLUME_DOWN', empty, empty],
        [1, 134, 'NumpadComma', 110, 'NumPad_Separator', 108, 'VK_SEPARATOR', empty, empty],
        [0, 135, 'IntlRo', 115, 'ABNT_C1', 193, 'VK_ABNT_C1', empty, empty],
        [1, 136, 'KanaMode', 0, empty, 0, empty, empty, empty],
        [0, 137, 'IntlYen', 0, empty, 0, empty, empty, empty],
        [1, 138, 'Convert', 0, empty, 0, empty, empty, empty],
        [1, 139, 'NonConvert', 0, empty, 0, empty, empty, empty],
        [1, 140, 'Lang1', 0, empty, 0, empty, empty, empty],
        [1, 141, 'Lang2', 0, empty, 0, empty, empty, empty],
        [1, 142, 'Lang3', 0, empty, 0, empty, empty, empty],
        [1, 143, 'Lang4', 0, empty, 0, empty, empty, empty],
        [1, 144, 'Lang5', 0, empty, 0, empty, empty, empty],
        [1, 145, 'Abort', 0, empty, 0, empty, empty, empty],
        [1, 146, 'Props', 0, empty, 0, empty, empty, empty],
        [1, 147, 'NumpadParenLeft', 0, empty, 0, empty, empty, empty],
        [1, 148, 'NumpadParenRight', 0, empty, 0, empty, empty, empty],
        [1, 149, 'NumpadBackspace', 0, empty, 0, empty, empty, empty],
        [1, 150, 'NumpadMemoryStore', 0, empty, 0, empty, empty, empty],
        [1, 151, 'NumpadMemoryRecall', 0, empty, 0, empty, empty, empty],
        [1, 152, 'NumpadMemoryClear', 0, empty, 0, empty, empty, empty],
        [1, 153, 'NumpadMemoryAdd', 0, empty, 0, empty, empty, empty],
        [1, 154, 'NumpadMemorySubtract', 0, empty, 0, empty, empty, empty],
        [1, 155, 'NumpadClear', 131, 'Clear', 12, 'VK_CLEAR', empty, empty],
        [1, 156, 'NumpadClearEntry', 0, empty, 0, empty, empty, empty],
        [1, 0, empty, 5, 'Ctrl', 17, 'VK_CONTROL', empty, empty],
        [1, 0, empty, 4, 'Shift', 16, 'VK_SHIFT', empty, empty],
        [1, 0, empty, 6, 'Alt', 18, 'VK_MENU', empty, empty],
        [1, 0, empty, 57, 'Meta', 91, 'VK_COMMAND', empty, empty],
        [1, 157, 'ControlLeft', 5, empty, 0, 'VK_LCONTROL', empty, empty],
        [1, 158, 'ShiftLeft', 4, empty, 0, 'VK_LSHIFT', empty, empty],
        [1, 159, 'AltLeft', 6, empty, 0, 'VK_LMENU', empty, empty],
        [1, 160, 'MetaLeft', 57, empty, 0, 'VK_LWIN', empty, empty],
        [1, 161, 'ControlRight', 5, empty, 0, 'VK_RCONTROL', empty, empty],
        [1, 162, 'ShiftRight', 4, empty, 0, 'VK_RSHIFT', empty, empty],
        [1, 163, 'AltRight', 6, empty, 0, 'VK_RMENU', empty, empty],
        [1, 164, 'MetaRight', 57, empty, 0, 'VK_RWIN', empty, empty],
        [1, 165, 'BrightnessUp', 0, empty, 0, empty, empty, empty],
        [1, 166, 'BrightnessDown', 0, empty, 0, empty, empty, empty],
        [1, 167, 'MediaPlay', 0, empty, 0, empty, empty, empty],
        [1, 168, 'MediaRecord', 0, empty, 0, empty, empty, empty],
        [1, 169, 'MediaFastForward', 0, empty, 0, empty, empty, empty],
        [1, 170, 'MediaRewind', 0, empty, 0, empty, empty, empty],
        [1, 171, 'MediaTrackNext', 124, 'MediaTrackNext', 176, 'VK_MEDIA_NEXT_TRACK', empty, empty],
        [1, 172, 'MediaTrackPrevious', 125, 'MediaTrackPrevious', 177, 'VK_MEDIA_PREV_TRACK', empty, empty],
        [1, 173, 'MediaStop', 126, 'MediaStop', 178, 'VK_MEDIA_STOP', empty, empty],
        [1, 174, 'Eject', 0, empty, 0, empty, empty, empty],
        [1, 175, 'MediaPlayPause', 127, 'MediaPlayPause', 179, 'VK_MEDIA_PLAY_PAUSE', empty, empty],
        [1, 176, 'MediaSelect', 128, 'LaunchMediaPlayer', 181, 'VK_MEDIA_LAUNCH_MEDIA_SELECT', empty, empty],
        [1, 177, 'LaunchMail', 129, 'LaunchMail', 180, 'VK_MEDIA_LAUNCH_MAIL', empty, empty],
        [1, 178, 'LaunchApp2', 130, 'LaunchApp2', 183, 'VK_MEDIA_LAUNCH_APP2', empty, empty],
        [1, 179, 'LaunchApp1', 0, empty, 0, 'VK_MEDIA_LAUNCH_APP1', empty, empty],
        [1, 180, 'SelectTask', 0, empty, 0, empty, empty, empty],
        [1, 181, 'LaunchScreenSaver', 0, empty, 0, empty, empty, empty],
        [1, 182, 'BrowserSearch', 120, 'BrowserSearch', 170, 'VK_BROWSER_SEARCH', empty, empty],
        [1, 183, 'BrowserHome', 121, 'BrowserHome', 172, 'VK_BROWSER_HOME', empty, empty],
        [1, 184, 'BrowserBack', 122, 'BrowserBack', 166, 'VK_BROWSER_BACK', empty, empty],
        [1, 185, 'BrowserForward', 123, 'BrowserForward', 167, 'VK_BROWSER_FORWARD', empty, empty],
        [1, 186, 'BrowserStop', 0, empty, 0, 'VK_BROWSER_STOP', empty, empty],
        [1, 187, 'BrowserRefresh', 0, empty, 0, 'VK_BROWSER_REFRESH', empty, empty],
        [1, 188, 'BrowserFavorites', 0, empty, 0, 'VK_BROWSER_FAVORITES', empty, empty],
        [1, 189, 'ZoomToggle', 0, empty, 0, empty, empty, empty],
        [1, 190, 'MailReply', 0, empty, 0, empty, empty, empty],
        [1, 191, 'MailForward', 0, empty, 0, empty, empty, empty],
        [1, 192, 'MailSend', 0, empty, 0, empty, empty, empty],
        [1, 0, empty, 114, 'KeyInComposition', 229, empty, empty, empty],
        [1, 0, empty, 116, 'ABNT_C2', 194, 'VK_ABNT_C2', empty, empty],
        [1, 0, empty, 96, 'OEM_8', 223, 'VK_OEM_8', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_KANA', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_HANGUL', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_JUNJA', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_FINAL', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_HANJA', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_KANJI', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_CONVERT', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_NONCONVERT', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_ACCEPT', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_MODECHANGE', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_SELECT', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_PRINT', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_EXECUTE', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_SNAPSHOT', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_HELP', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_APPS', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_PROCESSKEY', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_PACKET', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_DBE_SBCSCHAR', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_DBE_DBCSCHAR', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_ATTN', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_CRSEL', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_EXSEL', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_EREOF', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_PLAY', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_ZOOM', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_NONAME', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_PA1', empty, empty],
        [1, 0, empty, 0, empty, 0, 'VK_OEM_CLEAR', empty, empty],
    ];
    const seenKeyCode = [];
    const seenScanCode = [];
    for (const mapping of mappings) {
        const [immutable, scanCode, scanCodeStr, keyCode, keyCodeStr, eventKeyCode, vkey, usUserSettingsLabel, generalUserSettingsLabel] = mapping;
        if (!seenScanCode[scanCode]) {
            seenScanCode[scanCode] = true;
            scanCodeIntToStr[scanCode] = scanCodeStr;
            scanCodeStrToInt[scanCodeStr] = scanCode;
            scanCodeLowerCaseStrToInt[scanCodeStr.toLowerCase()] = scanCode;
            if (immutable) {
                IMMUTABLE_CODE_TO_KEY_CODE[scanCode] = keyCode;
                if ((keyCode !== 0)
                    && (keyCode !== 3)
                    && (keyCode !== 5)
                    && (keyCode !== 4)
                    && (keyCode !== 6)
                    && (keyCode !== 57)) {
                    IMMUTABLE_KEY_CODE_TO_CODE[keyCode] = scanCode;
                }
            }
        }
        if (!seenKeyCode[keyCode]) {
            seenKeyCode[keyCode] = true;
            if (!keyCodeStr) {
                throw new Error(`String representation missing for key code ${keyCode} around scan code ${scanCodeStr}`);
            }
            uiMap.define(keyCode, keyCodeStr);
            userSettingsUSMap.define(keyCode, usUserSettingsLabel || keyCodeStr);
            userSettingsGeneralMap.define(keyCode, generalUserSettingsLabel || usUserSettingsLabel || keyCodeStr);
        }
        if (eventKeyCode) {
            EVENT_KEY_CODE_MAP[eventKeyCode] = keyCode;
        }
        if (vkey) {
            NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE[vkey] = keyCode;
        }
    }
    IMMUTABLE_KEY_CODE_TO_CODE[3] = 46;
})();
export var KeyCodeUtils;
(function (KeyCodeUtils) {
    function toString(keyCode) {
        return uiMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toString = toString;
    function fromString(key) {
        return uiMap.strToKeyCode(key);
    }
    KeyCodeUtils.fromString = fromString;
    function toUserSettingsUS(keyCode) {
        return userSettingsUSMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toUserSettingsUS = toUserSettingsUS;
    function toUserSettingsGeneral(keyCode) {
        return userSettingsGeneralMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toUserSettingsGeneral = toUserSettingsGeneral;
    function fromUserSettings(key) {
        return userSettingsUSMap.strToKeyCode(key) || userSettingsGeneralMap.strToKeyCode(key);
    }
    KeyCodeUtils.fromUserSettings = fromUserSettings;
    function toElectronAccelerator(keyCode) {
        if (keyCode >= 98 && keyCode <= 113) {
            return null;
        }
        switch (keyCode) {
            case 16:
                return 'Up';
            case 18:
                return 'Down';
            case 15:
                return 'Left';
            case 17:
                return 'Right';
        }
        return uiMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toElectronAccelerator = toElectronAccelerator;
})(KeyCodeUtils || (KeyCodeUtils = {}));
export function KeyChord(firstPart, secondPart) {
    const chordPart = ((secondPart & 0x0000FFFF) << 16) >>> 0;
    return (firstPart | chordPart) >>> 0;
}
