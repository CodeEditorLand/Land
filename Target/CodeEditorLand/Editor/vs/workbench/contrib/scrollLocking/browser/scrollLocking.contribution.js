import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { SyncScroll as ScrollLocking } from './scrollLocking.js';
registerWorkbenchContribution2(ScrollLocking.ID, ScrollLocking, 4);
