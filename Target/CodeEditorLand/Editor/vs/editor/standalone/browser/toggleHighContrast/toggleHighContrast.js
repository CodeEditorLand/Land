import { EditorAction, registerEditorAction } from '../../../browser/editorExtensions.js';
import { IStandaloneThemeService } from '../../common/standaloneTheme.js';
import { ToggleHighContrastNLS } from '../../../common/standaloneStrings.js';
import { isDark, isHighContrast } from '../../../../platform/theme/common/theme.js';
import { HC_BLACK_THEME_NAME, HC_LIGHT_THEME_NAME, VS_DARK_THEME_NAME, VS_LIGHT_THEME_NAME } from '../standaloneThemeService.js';
class ToggleHighContrast extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.toggleHighContrast',
            label: ToggleHighContrastNLS.toggleHighContrast,
            alias: 'Toggle High Contrast Theme',
            precondition: undefined
        });
        this._originalThemeName = null;
    }
    run(accessor, editor) {
        const standaloneThemeService = accessor.get(IStandaloneThemeService);
        const currentTheme = standaloneThemeService.getColorTheme();
        if (isHighContrast(currentTheme.type)) {
            standaloneThemeService.setTheme(this._originalThemeName || (isDark(currentTheme.type) ? VS_DARK_THEME_NAME : VS_LIGHT_THEME_NAME));
            this._originalThemeName = null;
        }
        else {
            standaloneThemeService.setTheme(isDark(currentTheme.type) ? HC_BLACK_THEME_NAME : HC_LIGHT_THEME_NAME);
            this._originalThemeName = currentTheme.themeName;
        }
    }
}
registerEditorAction(ToggleHighContrast);
