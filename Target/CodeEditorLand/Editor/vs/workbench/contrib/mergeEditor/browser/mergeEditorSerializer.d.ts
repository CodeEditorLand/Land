import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorSerializer } from '../../../common/editor.js';
import { MergeEditorInput } from './mergeEditorInput.js';
export declare class MergeEditorSerializer implements IEditorSerializer {
    canSerialize(): boolean;
    serialize(editor: MergeEditorInput): string;
    toJSON(editor: MergeEditorInput): MergeEditorInputJSON;
    deserialize(instantiationService: IInstantiationService, raw: string): MergeEditorInput | undefined;
}
interface MergeEditorInputJSON {
    base: URI;
    input1: {
        uri: URI;
        title?: string;
        detail?: string;
        description?: string;
    };
    input2: {
        uri: URI;
        title?: string;
        detail?: string;
        description?: string;
    };
    result: URI;
}
export {};
