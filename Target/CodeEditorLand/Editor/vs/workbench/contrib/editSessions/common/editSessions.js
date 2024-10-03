import { decodeBase64, VSBuffer } from '../../../../base/common/buffer.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { localize, localize2 } from '../../../../nls.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { StringSHA1 } from '../../../../base/common/hash.js';
export const EDIT_SESSION_SYNC_CATEGORY = localize2('cloud changes', 'Cloud Changes');
export const IEditSessionsStorageService = createDecorator('IEditSessionsStorageService');
export const IEditSessionsLogService = createDecorator('IEditSessionsLogService');
export var ChangeType;
(function (ChangeType) {
    ChangeType[ChangeType["Addition"] = 1] = "Addition";
    ChangeType[ChangeType["Deletion"] = 2] = "Deletion";
})(ChangeType || (ChangeType = {}));
export var FileType;
(function (FileType) {
    FileType[FileType["File"] = 1] = "File";
})(FileType || (FileType = {}));
export const EditSessionSchemaVersion = 3;
export const EDIT_SESSIONS_SIGNED_IN_KEY = 'editSessionsSignedIn';
export const EDIT_SESSIONS_SIGNED_IN = new RawContextKey(EDIT_SESSIONS_SIGNED_IN_KEY, false);
export const EDIT_SESSIONS_PENDING_KEY = 'editSessionsPending';
export const EDIT_SESSIONS_PENDING = new RawContextKey(EDIT_SESSIONS_PENDING_KEY, false);
export const EDIT_SESSIONS_CONTAINER_ID = 'workbench.view.editSessions';
export const EDIT_SESSIONS_DATA_VIEW_ID = 'workbench.views.editSessions.data';
export const EDIT_SESSIONS_TITLE = localize2('cloud changes', 'Cloud Changes');
export const EDIT_SESSIONS_VIEW_ICON = registerIcon('edit-sessions-view-icon', Codicon.cloudDownload, localize('editSessionViewIcon', 'View icon of the cloud changes view.'));
export const EDIT_SESSIONS_SHOW_VIEW = new RawContextKey('editSessionsShowView', false);
export const EDIT_SESSIONS_SCHEME = 'vscode-edit-sessions';
export function decodeEditSessionFileContent(version, content) {
    switch (version) {
        case 1:
            return VSBuffer.fromString(content);
        case 2:
            return decodeBase64(content);
        default:
            throw new Error('Upgrade to a newer version to decode this content.');
    }
}
export function hashedEditSessionId(editSessionId) {
    const sha1 = new StringSHA1();
    sha1.update(editSessionId);
    return sha1.digest();
}
export const editSessionsLogId = 'editSessions';
