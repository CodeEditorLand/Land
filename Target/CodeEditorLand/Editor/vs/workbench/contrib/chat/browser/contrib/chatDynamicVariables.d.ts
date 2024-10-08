import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IRange } from '../../../../../editor/common/core/range.js';
import { Command } from '../../../../../editor/common/languages.js';
import { Action2 } from '../../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { IChatWidget } from '../chat.js';
import { IChatWidgetContrib } from '../chatWidget.js';
import { IChatRequestVariableValue, IDynamicVariable } from '../../common/chatVariables.js';
export declare const dynamicVariableDecorationType = "chat-dynamic-variable";
export declare class ChatDynamicVariableModel extends Disposable implements IChatWidgetContrib {
    private readonly widget;
    private readonly labelService;
    static readonly ID = "chatDynamicVariableModel";
    private _variables;
    get variables(): ReadonlyArray<IDynamicVariable>;
    get id(): string;
    constructor(widget: IChatWidget, labelService: ILabelService);
    getInputState(): any;
    setInputState(s: any): void;
    addReference(ref: IDynamicVariable): void;
    private updateDecorations;
    private getHoverForReference;
}
export declare class SelectAndInsertFileAction extends Action2 {
    static readonly Name = "files";
    static readonly Item: {
        label: string;
        description: string;
    };
    static readonly ID = "workbench.action.chat.selectAndInsertFile";
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): Promise<void>;
}
export interface IAddDynamicVariableContext {
    id: string;
    widget: IChatWidget;
    range: IRange;
    variableData: IChatRequestVariableValue;
    command?: Command;
}
export declare class AddDynamicVariableAction extends Action2 {
    static readonly ID = "workbench.action.chat.addDynamicVariable";
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): Promise<void>;
}
