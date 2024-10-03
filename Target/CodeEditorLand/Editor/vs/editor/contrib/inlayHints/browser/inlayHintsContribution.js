import { registerEditorContribution } from '../../../browser/editorExtensions.js';
import { HoverParticipantRegistry } from '../../hover/browser/hoverTypes.js';
import { InlayHintsController } from './inlayHintsController.js';
import { InlayHintsHover } from './inlayHintsHover.js';
registerEditorContribution(InlayHintsController.ID, InlayHintsController, 1);
HoverParticipantRegistry.register(InlayHintsHover);
