import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ITerminalContributionService, TerminalContributionService } from './terminalExtensionPoints.js';
registerSingleton(ITerminalContributionService, TerminalContributionService, 1);
