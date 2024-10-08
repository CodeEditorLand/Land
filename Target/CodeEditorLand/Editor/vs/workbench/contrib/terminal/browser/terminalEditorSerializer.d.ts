import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorSerializer } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { ITerminalEditorService, ITerminalInstance } from './terminal.js';
import { TerminalEditorInput } from './terminalEditorInput.js';
export declare class TerminalInputSerializer implements IEditorSerializer {
    private readonly _terminalEditorService;
    constructor(_terminalEditorService: ITerminalEditorService);
    canSerialize(editorInput: TerminalEditorInput): editorInput is TerminalEditorInput & {
        readonly terminalInstance: ITerminalInstance;
    };
    serialize(editorInput: TerminalEditorInput): string | undefined;
    deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): EditorInput | undefined;
    private _toJson;
}
