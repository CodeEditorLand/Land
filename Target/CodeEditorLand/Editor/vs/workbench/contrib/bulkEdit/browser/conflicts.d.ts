import { IFileService } from '../../../../platform/files/common/files.js';
import { URI } from '../../../../base/common/uri.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { Event } from '../../../../base/common/event.js';
import { ResourceEdit } from '../../../../editor/browser/services/bulkEditService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare class ConflictDetector {
    private readonly _conflicts;
    private readonly _disposables;
    private readonly _onDidConflict;
    readonly onDidConflict: Event<this>;
    constructor(edits: ResourceEdit[], fileService: IFileService, modelService: IModelService, logService: ILogService);
    dispose(): void;
    list(): URI[];
    hasConflicts(): boolean;
}
