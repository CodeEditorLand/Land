import { Event } from '../../../base/common/event.js';
import { Range } from '../core/range.js';
import { IModelDecoration } from '../model.js';
export interface DecorationProvider {
    getDecorationsInRange(range: Range, ownerId?: number, filterOutValidation?: boolean): IModelDecoration[];
    getAllDecorations(ownerId?: number, filterOutValidation?: boolean, onlyMinimapDecorations?: boolean): IModelDecoration[];
    onDidChange: Event<void>;
}
