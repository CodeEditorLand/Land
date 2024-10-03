import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
export class ToggleRenderControlCharacterAction extends Action2 {
    static { this.ID = 'editor.action.toggleRenderControlCharacter'; }
    constructor() {
        super({
            id: ToggleRenderControlCharacterAction.ID,
            title: {
                ...localize2('toggleRenderControlCharacters', "Toggle Control Characters"),
                mnemonicTitle: localize({ key: 'miToggleRenderControlCharacters', comment: ['&& denotes a mnemonic'] }, "Render &&Control Characters"),
            },
            category: Categories.View,
            f1: true,
            toggled: ContextKeyExpr.equals('config.editor.renderControlCharacters', true),
            menu: {
                id: MenuId.MenubarAppearanceMenu,
                group: '4_editor',
                order: 5
            }
        });
    }
    run(accessor) {
        const configurationService = accessor.get(IConfigurationService);
        const newRenderControlCharacters = !configurationService.getValue('editor.renderControlCharacters');
        return configurationService.updateValue('editor.renderControlCharacters', newRenderControlCharacters);
    }
}
registerAction2(ToggleRenderControlCharacterAction);
