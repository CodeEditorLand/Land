import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export const INTERACTIVE_INPUT_CURSOR_BOUNDARY = new RawContextKey('interactiveInputCursorAtBoundary', 'none');
export const InteractiveWindowSetting = {
    interactiveWindowAlwaysScrollOnNewCell: 'interactiveWindow.alwaysScrollOnNewCell',
    executeWithShiftEnter: 'interactiveWindow.executeWithShiftEnter',
    showExecutionHint: 'interactiveWindow.showExecutionHint'
};
