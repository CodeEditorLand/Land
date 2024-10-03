import { IMenuService, registerAction2 } from './actions.js';
import { MenuHiddenStatesReset } from './menuResetAction.js';
import { MenuService } from './menuService.js';
import { registerSingleton } from '../../instantiation/common/extensions.js';
registerSingleton(IMenuService, MenuService, 1);
registerAction2(MenuHiddenStatesReset);
