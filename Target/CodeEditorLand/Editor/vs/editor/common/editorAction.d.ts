import { IEditorAction } from './editorCommon.js';
import { ICommandMetadata } from '../../platform/commands/common/commands.js';
import { ContextKeyExpression, IContextKeyService } from '../../platform/contextkey/common/contextkey.js';
export declare class InternalEditorAction implements IEditorAction {
    readonly id: string;
    readonly label: string;
    readonly alias: string;
    readonly metadata: ICommandMetadata | undefined;
    private readonly _precondition;
    private readonly _run;
    private readonly _contextKeyService;
    constructor(id: string, label: string, alias: string, metadata: ICommandMetadata | undefined, _precondition: ContextKeyExpression | undefined, _run: (args: unknown) => Promise<void>, _contextKeyService: IContextKeyService);
    isSupported(): boolean;
    run(args: unknown): Promise<void>;
}
