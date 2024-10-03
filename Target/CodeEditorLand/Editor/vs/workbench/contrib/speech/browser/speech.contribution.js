import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ISpeechService } from '../common/speechService.js';
import { SpeechService } from './speechService.js';
registerSingleton(ISpeechService, SpeechService, 0);
