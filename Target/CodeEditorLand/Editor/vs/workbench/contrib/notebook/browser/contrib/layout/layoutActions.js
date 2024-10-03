import { localize2 } from '../../../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { NOTEBOOK_ACTIONS_CATEGORY } from '../../controller/coreActions.js';
import { NotebookSetting } from '../../../common/notebookCommon.js';
const TOGGLE_CELL_TOOLBAR_POSITION = 'notebook.toggleCellToolbarPosition';
export class ToggleCellToolbarPositionAction extends Action2 {
    constructor() {
        super({
            id: TOGGLE_CELL_TOOLBAR_POSITION,
            title: localize2('notebook.toggleCellToolbarPosition', 'Toggle Cell Toolbar Position'),
            menu: [{
                    id: MenuId.NotebookCellTitle,
                    group: 'View',
                    order: 1
                }],
            category: NOTEBOOK_ACTIONS_CATEGORY,
            f1: false
        });
    }
    async run(accessor, context) {
        const editor = context && context.ui ? context.notebookEditor : undefined;
        if (editor && editor.hasModel()) {
            const viewType = editor.textModel.viewType;
            const configurationService = accessor.get(IConfigurationService);
            const toolbarPosition = configurationService.getValue(NotebookSetting.cellToolbarLocation);
            const newConfig = this.togglePosition(viewType, toolbarPosition);
            await configurationService.updateValue(NotebookSetting.cellToolbarLocation, newConfig);
        }
    }
    togglePosition(viewType, toolbarPosition) {
        if (typeof toolbarPosition === 'string') {
            if (['left', 'right', 'hidden'].indexOf(toolbarPosition) >= 0) {
                const newViewValue = toolbarPosition === 'right' ? 'left' : 'right';
                const config = {
                    default: toolbarPosition
                };
                config[viewType] = newViewValue;
                return config;
            }
            else {
                const config = {
                    default: 'right',
                };
                config[viewType] = 'left';
                return config;
            }
        }
        else {
            const oldValue = toolbarPosition[viewType] ?? toolbarPosition['default'] ?? 'right';
            const newViewValue = oldValue === 'right' ? 'left' : 'right';
            const newConfig = {
                ...toolbarPosition
            };
            newConfig[viewType] = newViewValue;
            return newConfig;
        }
    }
}
registerAction2(ToggleCellToolbarPositionAction);
