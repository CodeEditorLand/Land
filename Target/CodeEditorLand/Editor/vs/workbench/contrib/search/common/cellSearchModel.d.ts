import { Disposable } from '../../../../base/common/lifecycle.js';
import { FindMatch, IReadonlyTextBuffer } from '../../../../editor/common/model.js';
interface RawOutputFindMatch {
    textBuffer: IReadonlyTextBuffer;
    matches: FindMatch[];
}
export declare class CellSearchModel extends Disposable {
    readonly _source: string;
    private _inputTextBuffer;
    private _outputs;
    private _outputTextBuffers;
    constructor(_source: string, _inputTextBuffer: IReadonlyTextBuffer | undefined, _outputs: string[]);
    private _getFullModelRange;
    private _getLineMaxColumn;
    get inputTextBuffer(): IReadonlyTextBuffer;
    get outputTextBuffers(): IReadonlyTextBuffer[];
    findInInputs(target: string): FindMatch[];
    findInOutputs(target: string): RawOutputFindMatch[];
}
export {};
