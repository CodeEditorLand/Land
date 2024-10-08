import { ICommandAction } from '../../../../platform/action/common/action.js';
import { ContextKeyExpression } from '../../../../platform/contextkey/common/contextkey.js';
export declare const revealInsideBarCommand: {
    id: string;
    title: string;
};
export declare function appendEditorTitleContextMenuItem(id: string, title: string, when: ContextKeyExpression | undefined, group: string, supportsMultiSelect: boolean, order?: number): void;
export declare function appendToCommandPalette({ id, title, category, metadata }: ICommandAction, when?: ContextKeyExpression): void;
