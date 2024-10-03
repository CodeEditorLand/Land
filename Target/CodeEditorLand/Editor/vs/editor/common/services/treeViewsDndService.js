import { registerSingleton } from '../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { TreeViewsDnDService } from './treeViewsDnd.js';
export const ITreeViewsDnDService = createDecorator('treeViewsDndService');
registerSingleton(ITreeViewsDnDService, TreeViewsDnDService, 1);
