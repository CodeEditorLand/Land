import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { WorkspaceTags } from './workspaceTags.js';
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(WorkspaceTags, 4);
