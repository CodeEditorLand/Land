import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { CustomEditorInfo } from './customEditor.js';
export declare class ContributedCustomEditors extends Disposable {
    private static readonly CUSTOM_EDITORS_STORAGE_ID;
    private static readonly CUSTOM_EDITORS_ENTRY_ID;
    private readonly _editors;
    private readonly _memento;
    constructor(storageService: IStorageService);
    private readonly _onChange;
    readonly onChange: import("../../../workbench.web.main.internal.js").Event<void>;
    private update;
    [Symbol.iterator](): Iterator<CustomEditorInfo>;
    get(viewType: string): CustomEditorInfo | undefined;
    getContributedEditors(resource: URI): readonly CustomEditorInfo[];
    private add;
}
