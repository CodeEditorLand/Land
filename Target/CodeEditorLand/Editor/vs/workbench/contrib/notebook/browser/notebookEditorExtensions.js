class EditorContributionRegistry {
    static { this.INSTANCE = new EditorContributionRegistry(); }
    constructor() {
        this.editorContributions = [];
    }
    registerEditorContribution(id, ctor) {
        this.editorContributions.push({ id, ctor: ctor });
    }
    getEditorContributions() {
        return this.editorContributions.slice(0);
    }
}
export function registerNotebookContribution(id, ctor) {
    EditorContributionRegistry.INSTANCE.registerEditorContribution(id, ctor);
}
export var NotebookEditorExtensionsRegistry;
(function (NotebookEditorExtensionsRegistry) {
    function getEditorContributions() {
        return EditorContributionRegistry.INSTANCE.getEditorContributions();
    }
    NotebookEditorExtensionsRegistry.getEditorContributions = getEditorContributions;
    function getSomeEditorContributions(ids) {
        return EditorContributionRegistry.INSTANCE.getEditorContributions().filter(c => ids.indexOf(c.id) >= 0);
    }
    NotebookEditorExtensionsRegistry.getSomeEditorContributions = getSomeEditorContributions;
})(NotebookEditorExtensionsRegistry || (NotebookEditorExtensionsRegistry = {}));
