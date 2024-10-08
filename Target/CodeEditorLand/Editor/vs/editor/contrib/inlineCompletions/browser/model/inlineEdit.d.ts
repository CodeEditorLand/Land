import { SingleTextEdit } from '../../../../common/core/textEdit.js';
export declare class InlineEdit {
    readonly edit: SingleTextEdit;
    constructor(edit: SingleTextEdit);
    get range(): import("../../../../common/core/range.js").Range;
    get text(): string;
}
