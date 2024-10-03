import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { NativeTitleService } from '../../../electron-sandbox/parts/titlebar/titlebarPart.js';
import { ITitleService } from '../browser/titleService.js';
registerSingleton(ITitleService, NativeTitleService, 0);
