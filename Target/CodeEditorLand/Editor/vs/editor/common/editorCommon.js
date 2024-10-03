export function isThemeColor(o) {
    return o && typeof o.id === 'string';
}
export const EditorType = {
    ICodeEditor: 'vs.editor.ICodeEditor',
    IDiffEditor: 'vs.editor.IDiffEditor'
};
