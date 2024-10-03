import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export const ILifecycleService = createDecorator('lifecycleService');
export var WillShutdownJoinerOrder;
(function (WillShutdownJoinerOrder) {
    WillShutdownJoinerOrder[WillShutdownJoinerOrder["Default"] = 1] = "Default";
    WillShutdownJoinerOrder[WillShutdownJoinerOrder["Last"] = 2] = "Last";
})(WillShutdownJoinerOrder || (WillShutdownJoinerOrder = {}));
export function StartupKindToString(startupKind) {
    switch (startupKind) {
        case 1: return 'NewWindow';
        case 3: return 'ReloadedWindow';
        case 4: return 'ReopenedWindow';
    }
}
export function LifecyclePhaseToString(phase) {
    switch (phase) {
        case 1: return 'Starting';
        case 2: return 'Ready';
        case 3: return 'Restored';
        case 4: return 'Eventually';
    }
}
