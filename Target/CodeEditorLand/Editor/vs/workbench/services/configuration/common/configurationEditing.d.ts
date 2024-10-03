import { URI } from '../../../../base/common/uri.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ITextFileService } from '../../textfile/common/textfiles.js';
import { IConfigurationUpdateOptions, IConfigurationUpdateOverrides } from '../../../../platform/configuration/common/configuration.js';
import { IWorkbenchConfigurationService } from './configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IPreferencesService } from '../../preferences/common/preferences.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { ErrorNoTelemetry } from '../../../../base/common/errors.js';
export declare const enum ConfigurationEditingErrorCode {
    ERROR_UNKNOWN_KEY = 0,
    ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION = 1,
    ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE = 2,
    ERROR_INVALID_FOLDER_CONFIGURATION = 3,
    ERROR_INVALID_USER_TARGET = 4,
    ERROR_INVALID_WORKSPACE_TARGET = 5,
    ERROR_INVALID_FOLDER_TARGET = 6,
    ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION = 7,
    ERROR_NO_WORKSPACE_OPENED = 8,
    ERROR_CONFIGURATION_FILE_DIRTY = 9,
    ERROR_CONFIGURATION_FILE_MODIFIED_SINCE = 10,
    ERROR_INVALID_CONFIGURATION = 11,
    ERROR_POLICY_CONFIGURATION = 12,
    ERROR_INTERNAL = 13
}
export declare class ConfigurationEditingError extends ErrorNoTelemetry {
    code: ConfigurationEditingErrorCode;
    constructor(message: string, code: ConfigurationEditingErrorCode);
}
export interface IConfigurationValue {
    key: string;
    value: any;
}
export interface IConfigurationEditingOptions extends IConfigurationUpdateOptions {
    scopes?: IConfigurationUpdateOverrides;
}
export declare const enum EditableConfigurationTarget {
    USER_LOCAL = 1,
    USER_REMOTE = 2,
    WORKSPACE = 3,
    WORKSPACE_FOLDER = 4
}
export declare class ConfigurationEditing {
    private readonly remoteSettingsResource;
    private readonly configurationService;
    private readonly contextService;
    private readonly userDataProfileService;
    private readonly userDataProfilesService;
    private readonly fileService;
    private readonly textModelResolverService;
    private readonly textFileService;
    private readonly notificationService;
    private readonly preferencesService;
    private readonly editorService;
    private readonly uriIdentityService;
    _serviceBrand: undefined;
    private queue;
    constructor(remoteSettingsResource: URI | null, configurationService: IWorkbenchConfigurationService, contextService: IWorkspaceContextService, userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, fileService: IFileService, textModelResolverService: ITextModelService, textFileService: ITextFileService, notificationService: INotificationService, preferencesService: IPreferencesService, editorService: IEditorService, uriIdentityService: IUriIdentityService);
    writeConfiguration(target: EditableConfigurationTarget, value: IConfigurationValue, options?: IConfigurationEditingOptions): Promise<void>;
    private doWriteConfiguration;
    private updateConfiguration;
    private save;
    private applyEditsToBuffer;
    private getEdits;
    private getFormattingOptions;
    private onError;
    private onInvalidConfigurationError;
    private onConfigurationFileDirtyError;
    private openSettings;
    private openFile;
    private toConfigurationEditingError;
    private toErrorMessage;
    private stringifyTarget;
    private defaultResourceValue;
    private resolveModelReference;
    private hasParseErrors;
    private validate;
    private getConfigurationEditOperation;
    private isWorkspaceConfigurationResource;
    private getConfigurationFileResource;
}
