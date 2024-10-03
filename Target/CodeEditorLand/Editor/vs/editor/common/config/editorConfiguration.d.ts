import { Event } from '../../../base/common/event.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { ConfigurationChangedEvent, IComputedEditorOptions, IEditorOptions } from './editorOptions.js';
import { IDimension } from '../core/dimension.js';
import { MenuId } from '../../../platform/actions/common/actions.js';
export interface IEditorConfiguration extends IDisposable {
    readonly isSimpleWidget: boolean;
    readonly contextMenuId: MenuId;
    readonly options: IComputedEditorOptions;
    onDidChangeFast: Event<ConfigurationChangedEvent>;
    onDidChange: Event<ConfigurationChangedEvent>;
    getRawOptions(): IEditorOptions;
    updateOptions(newOptions: Readonly<IEditorOptions>): void;
    observeContainer(dimension?: IDimension): void;
    setIsDominatedByLongLines(isDominatedByLongLines: boolean): void;
    setModelLineCount(modelLineCount: number): void;
    setViewLineCount(viewLineCount: number): void;
    setReservedHeight(reservedHeight: number): void;
    setGlyphMarginDecorationLaneCount(decorationLaneCount: number): void;
}
