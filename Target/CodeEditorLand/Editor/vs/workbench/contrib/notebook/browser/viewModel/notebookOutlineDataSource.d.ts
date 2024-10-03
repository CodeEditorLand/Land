import { Event } from '../../../../../base/common/event.js';
import { URI } from '../../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IMarkerService } from '../../../../../platform/markers/common/markers.js';
import { INotebookEditor } from '../notebookBrowser.js';
import { OutlineChangeEvent } from '../../../../services/outline/browser/outline.js';
import { OutlineEntry } from './OutlineEntry.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { NotebookOutlineEntryFactory } from './notebookOutlineEntryFactory.js';
export interface INotebookCellOutlineDataSource {
    readonly activeElement: OutlineEntry | undefined;
    readonly entries: OutlineEntry[];
}
export declare class NotebookCellOutlineDataSource implements INotebookCellOutlineDataSource {
    private readonly _editor;
    private readonly _markerService;
    private readonly _configurationService;
    private readonly _outlineEntryFactory;
    private readonly _disposables;
    private readonly _onDidChange;
    readonly onDidChange: Event<OutlineChangeEvent>;
    private _uri;
    private _entries;
    private _activeEntry?;
    constructor(_editor: INotebookEditor, _markerService: IMarkerService, _configurationService: IConfigurationService, _outlineEntryFactory: NotebookOutlineEntryFactory);
    get activeElement(): OutlineEntry | undefined;
    get entries(): OutlineEntry[];
    get isEmpty(): boolean;
    get uri(): URI | undefined;
    computeFullSymbols(cancelToken: CancellationToken): Promise<void>;
    recomputeState(): void;
    recomputeActive(): {
        changeEventTriggered: boolean;
    };
    dispose(): void;
}
