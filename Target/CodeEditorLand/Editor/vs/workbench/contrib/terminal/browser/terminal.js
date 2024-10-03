import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export const ITerminalService = createDecorator('terminalService');
export const ITerminalConfigurationService = createDecorator('terminalConfigurationService');
export const ITerminalEditorService = createDecorator('terminalEditorService');
export const ITerminalGroupService = createDecorator('terminalGroupService');
export const ITerminalInstanceService = createDecorator('terminalInstanceService');
export const isDetachedTerminalInstance = (t) => typeof t.instanceId !== 'number';
export class TerminalLinkQuickPickEvent extends MouseEvent {
}
export const terminalEditorId = 'terminalEditor';
