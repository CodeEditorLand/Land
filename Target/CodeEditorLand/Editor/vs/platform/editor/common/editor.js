export function isResolvedEditorModel(model) {
    const candidate = model;
    return typeof candidate?.resolve === 'function'
        && typeof candidate?.isResolved === 'function';
}
export var EditorActivation;
(function (EditorActivation) {
    EditorActivation[EditorActivation["ACTIVATE"] = 1] = "ACTIVATE";
    EditorActivation[EditorActivation["RESTORE"] = 2] = "RESTORE";
    EditorActivation[EditorActivation["PRESERVE"] = 3] = "PRESERVE";
})(EditorActivation || (EditorActivation = {}));
export var EditorResolution;
(function (EditorResolution) {
    EditorResolution[EditorResolution["PICK"] = 0] = "PICK";
    EditorResolution[EditorResolution["EXCLUSIVE_ONLY"] = 1] = "EXCLUSIVE_ONLY";
})(EditorResolution || (EditorResolution = {}));
export var EditorOpenSource;
(function (EditorOpenSource) {
    EditorOpenSource[EditorOpenSource["API"] = 0] = "API";
    EditorOpenSource[EditorOpenSource["USER"] = 1] = "USER";
})(EditorOpenSource || (EditorOpenSource = {}));
