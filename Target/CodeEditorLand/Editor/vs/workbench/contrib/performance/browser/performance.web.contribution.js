import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions } from '../../../common/contributions.js';
import { BrowserResourcePerformanceMarks, BrowserStartupTimings } from './startupTimings.js';
Registry.as(Extensions.Workbench).registerWorkbenchContribution(BrowserResourcePerformanceMarks, 4);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(BrowserStartupTimings, 4);
