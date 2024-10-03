export const SEMANTIC_HIGHLIGHTING_SETTING_ID = 'editor.semanticHighlighting';
export function isSemanticColoringEnabled(model, themeService, configurationService) {
    const setting = configurationService.getValue(SEMANTIC_HIGHLIGHTING_SETTING_ID, { overrideIdentifier: model.getLanguageId(), resource: model.uri })?.enabled;
    if (typeof setting === 'boolean') {
        return setting;
    }
    return themeService.getColorTheme().semanticHighlighting;
}
