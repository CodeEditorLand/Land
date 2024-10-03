import { URI } from '../../../../base/common/uri.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IEditorPane } from '../../../common/editor.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare const UNKNOWN_SOURCE_LABEL: string;
export declare class Source {
    readonly uri: URI;
    available: boolean;
    raw: DebugProtocol.Source;
    constructor(raw_: DebugProtocol.Source | undefined, sessionId: string, uriIdentityService: IUriIdentityService, logService: ILogService);
    get name(): string;
    get origin(): string | undefined;
    get presentationHint(): "normal" | "emphasize" | "deemphasize" | undefined;
    get reference(): number | undefined;
    get inMemory(): boolean;
    openInEditor(editorService: IEditorService, selection: IRange, preserveFocus?: boolean, sideBySide?: boolean, pinned?: boolean): Promise<IEditorPane | undefined>;
    static getEncodedDebugData(modelUri: URI): {
        name: string;
        path: string;
        sessionId?: string;
        sourceReference?: number;
    };
}
export declare function getUriFromSource(raw: DebugProtocol.Source, path: string | undefined, sessionId: string, uriIdentityService: IUriIdentityService, logService: ILogService): URI;
