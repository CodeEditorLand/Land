import type { IStringDictionary } from '../../../../../base/common/collections.js';
import type { IConfigurationPropertySchema } from '../../../../../platform/configuration/common/configurationRegistry.js';
export declare const enum TerminalAccessibilitySettingId {
    AccessibleViewPreserveCursorPosition = "terminal.integrated.accessibleViewPreserveCursorPosition",
    AccessibleViewFocusOnCommandExecution = "terminal.integrated.accessibleViewFocusOnCommandExecution"
}
export interface ITerminalAccessibilityConfiguration {
    accessibleViewPreserveCursorPosition: boolean;
    accessibleViewFocusOnCommandExecution: number;
}
export declare const terminalAccessibilityConfiguration: IStringDictionary<IConfigurationPropertySchema>;
