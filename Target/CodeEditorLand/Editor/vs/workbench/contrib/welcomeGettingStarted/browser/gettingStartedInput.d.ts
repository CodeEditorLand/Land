import './media/gettingStarted.css';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { URI } from '../../../../base/common/uri.js';
import { IUntypedEditorInput } from '../../../common/editor.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
export declare const gettingStartedInputTypeId = "workbench.editors.gettingStartedInput";
export interface GettingStartedEditorOptions extends IEditorOptions {
    selectedCategory?: string;
    selectedStep?: string;
    showTelemetryNotice?: boolean;
    showWelcome?: boolean;
}
export declare class GettingStartedInput extends EditorInput {
    static readonly ID = "workbench.editors.gettingStartedInput";
    static readonly RESOURCE: URI;
    get typeId(): string;
    get editorId(): string | undefined;
    toUntyped(): IUntypedEditorInput;
    get resource(): URI | undefined;
    matches(other: EditorInput | IUntypedEditorInput): boolean;
    constructor(options: GettingStartedEditorOptions);
    getName(): string;
    selectedCategory: string | undefined;
    selectedStep: string | undefined;
    showTelemetryNotice: boolean;
    showWelcome: boolean;
}
