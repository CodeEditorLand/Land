import { Keybinding } from '../../../base/common/keybindings.js';
import { ICommandHandler, ICommandMetadata } from '../../commands/common/commands.js';
import { ContextKeyExpression } from '../../contextkey/common/contextkey.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
export interface IKeybindingItem {
    keybinding: Keybinding | null;
    command: string | null;
    commandArgs?: any;
    when: ContextKeyExpression | null | undefined;
    weight1: number;
    weight2: number;
    extensionId: string | null;
    isBuiltinExtension: boolean;
}
export interface IKeybindings {
    primary?: number;
    secondary?: number[];
    win?: {
        primary: number;
        secondary?: number[];
    };
    linux?: {
        primary: number;
        secondary?: number[];
    };
    mac?: {
        primary: number;
        secondary?: number[];
    };
}
export interface IKeybindingRule extends IKeybindings {
    id: string;
    weight: number;
    args?: any;
    when?: ContextKeyExpression | null | undefined;
}
export interface IExtensionKeybindingRule {
    keybinding: Keybinding | null;
    id: string;
    args?: any;
    weight: number;
    when: ContextKeyExpression | undefined;
    extensionId?: string;
    isBuiltinExtension?: boolean;
}
export declare const enum KeybindingWeight {
    EditorCore = 0,
    EditorContrib = 100,
    WorkbenchContrib = 200,
    BuiltinExtension = 300,
    ExternalExtension = 400
}
export interface ICommandAndKeybindingRule extends IKeybindingRule {
    handler: ICommandHandler;
    metadata?: ICommandMetadata | null;
}
export interface IKeybindingsRegistry {
    registerKeybindingRule(rule: IKeybindingRule): IDisposable;
    setExtensionKeybindings(rules: IExtensionKeybindingRule[]): void;
    registerCommandAndKeybindingRule(desc: ICommandAndKeybindingRule): IDisposable;
    getDefaultKeybindings(): IKeybindingItem[];
}
export declare const KeybindingsRegistry: IKeybindingsRegistry;
export declare const Extensions: {
    EditorModes: string;
};
