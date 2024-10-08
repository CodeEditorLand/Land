/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export const ILifecycleService = createDecorator('lifecycleService');
export var WillShutdownJoinerOrder;
(function (WillShutdownJoinerOrder) {
    /**
     * Joiners to run before the `Last` joiners. This is the default order and best for
     * most cases. You can be sure that services are still functional at this point.
     */
    WillShutdownJoinerOrder[WillShutdownJoinerOrder["Default"] = 1] = "Default";
    /**
     * The joiners to run last. This should ONLY be used in rare cases when you have no
     * dependencies to workbench services or state. The workbench may be in a state where
     * resources can no longer be accessed or changed.
     */
    WillShutdownJoinerOrder[WillShutdownJoinerOrder["Last"] = 2] = "Last";
})(WillShutdownJoinerOrder || (WillShutdownJoinerOrder = {}));
export function StartupKindToString(startupKind) {
    switch (startupKind) {
        case 1 /* StartupKind.NewWindow */: return 'NewWindow';
        case 3 /* StartupKind.ReloadedWindow */: return 'ReloadedWindow';
        case 4 /* StartupKind.ReopenedWindow */: return 'ReopenedWindow';
    }
}
export function LifecyclePhaseToString(phase) {
    switch (phase) {
        case 1 /* LifecyclePhase.Starting */: return 'Starting';
        case 2 /* LifecyclePhase.Ready */: return 'Ready';
        case 3 /* LifecyclePhase.Restored */: return 'Restored';
        case 4 /* LifecyclePhase.Eventually */: return 'Eventually';
    }
}
