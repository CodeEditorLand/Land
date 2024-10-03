export interface MessageBoxOptions {
    message: string;
    type?: ('none' | 'info' | 'error' | 'question' | 'warning');
    buttons?: string[];
    defaultId?: number;
    signal?: AbortSignal;
    title?: string;
    detail?: string;
    checkboxLabel?: string;
    checkboxChecked?: boolean;
    textWidth?: number;
    cancelId?: number;
    noLink?: boolean;
    normalizeAccessKeys?: boolean;
}
export interface MessageBoxReturnValue {
    response: number;
    checkboxChecked: boolean;
}
export interface SaveDialogOptions {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: FileFilter[];
    message?: string;
    nameFieldLabel?: string;
    showsTagField?: boolean;
    properties?: Array<'showHiddenFiles' | 'createDirectory' | 'treatPackageAsDirectory' | 'showOverwriteConfirmation' | 'dontAddToRecent'>;
    securityScopedBookmarks?: boolean;
}
export interface SaveDialogReturnValue {
    canceled: boolean;
    filePath: string;
    bookmark?: string;
}
export interface OpenDialogOptions {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: FileFilter[];
    properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'>;
    message?: string;
    securityScopedBookmarks?: boolean;
}
export interface OpenDialogReturnValue {
    canceled: boolean;
    filePaths: string[];
    bookmarks?: string[];
}
export interface FileFilter {
    extensions: string[];
    name: string;
}
interface InputEvent {
    modifiers?: Array<'shift' | 'control' | 'ctrl' | 'alt' | 'meta' | 'command' | 'cmd' | 'isKeypad' | 'isAutoRepeat' | 'leftButtonDown' | 'middleButtonDown' | 'rightButtonDown' | 'capsLock' | 'numLock' | 'left' | 'right'>;
    type: ('undefined' | 'mouseDown' | 'mouseUp' | 'mouseMove' | 'mouseEnter' | 'mouseLeave' | 'contextMenu' | 'mouseWheel' | 'rawKeyDown' | 'keyDown' | 'keyUp' | 'char' | 'gestureScrollBegin' | 'gestureScrollEnd' | 'gestureScrollUpdate' | 'gestureFlingStart' | 'gestureFlingCancel' | 'gesturePinchBegin' | 'gesturePinchEnd' | 'gesturePinchUpdate' | 'gestureTapDown' | 'gestureShowPress' | 'gestureTap' | 'gestureTapCancel' | 'gestureShortPress' | 'gestureLongPress' | 'gestureLongTap' | 'gestureTwoFingerTap' | 'gestureTapUnconfirmed' | 'gestureDoubleTap' | 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel' | 'touchScrollStarted' | 'pointerDown' | 'pointerUp' | 'pointerMove' | 'pointerRawUpdate' | 'pointerCancel' | 'pointerCausedUaAction');
}
export interface MouseInputEvent extends InputEvent {
    button?: ('left' | 'middle' | 'right');
    clickCount?: number;
    globalX?: number;
    globalY?: number;
    movementX?: number;
    movementY?: number;
    type: ('mouseDown' | 'mouseUp' | 'mouseEnter' | 'mouseLeave' | 'contextMenu' | 'mouseWheel' | 'mouseMove');
    x: number;
    y: number;
}
export {};
