import { IAction } from '../../../../base/common/actions.js';
import { Event } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { Position } from '../../../../editor/common/core/position.js';
import { IModelDeltaDecoration } from '../../../../editor/common/model.js';
import { ITestMessage } from './testTypes.js';
export interface ITestingDecorationsService {
    _serviceBrand: undefined;
    onDidChange: Event<void>;
    invalidateResultMessage(message: ITestMessage): void;
    syncDecorations(resource: URI): Iterable<ITestDecoration> & {
        readonly size: number;
        getById(decorationId: string): ITestDecoration | undefined;
    };
    getDecoratedTestPosition(resource: URI, testId: string): Position | undefined;
    updateDecorationsAlternateAction(resource: URI, isAlt: boolean): void;
}
export interface ITestDecoration {
    readonly id: string;
    readonly line: number;
    readonly editorDecoration: IModelDeltaDecoration;
    getContextMenuActions(): {
        object: IAction[];
        dispose(): void;
    };
}
export declare class TestDecorations<T extends {
    id: string;
    line: number;
} = ITestDecoration> {
    value: T[];
    push(value: T): void;
    lines(): Iterable<[number, T[]]>;
}
export declare const ITestingDecorationsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITestingDecorationsService>;
