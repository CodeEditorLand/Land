import * as editorCommon from '../common/editorCommon.js';
export function isCodeEditor(thing) {
    if (thing && typeof thing.getEditorType === 'function') {
        return thing.getEditorType() === editorCommon.EditorType.ICodeEditor;
    }
    else {
        return false;
    }
}
export function isDiffEditor(thing) {
    if (thing && typeof thing.getEditorType === 'function') {
        return thing.getEditorType() === editorCommon.EditorType.IDiffEditor;
    }
    else {
        return false;
    }
}
export function isCompositeEditor(thing) {
    return !!thing
        && typeof thing === 'object'
        && typeof thing.onDidChangeActiveEditor === 'function';
}
export function getCodeEditor(thing) {
    if (isCodeEditor(thing)) {
        return thing;
    }
    if (isDiffEditor(thing)) {
        return thing.getModifiedEditor();
    }
    if (isCompositeEditor(thing) && isCodeEditor(thing.activeCodeEditor)) {
        return thing.activeCodeEditor;
    }
    return null;
}
export function getIEditor(thing) {
    if (isCodeEditor(thing) || isDiffEditor(thing)) {
        return thing;
    }
    return null;
}
