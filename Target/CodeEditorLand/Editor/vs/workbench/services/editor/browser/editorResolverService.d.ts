import * as glob from '../../../../base/common/glob.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IUntypedEditorInput } from '../../../common/editor.js';
import { IEditorGroupsService } from '../common/editorGroupsService.js';
import { RegisteredEditorInfo, RegisteredEditorOptions, EditorAssociations, IEditorResolverService, ResolvedEditor, EditorInputFactoryObject } from '../common/editorResolverService.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { PreferredGroup } from '../common/editorService.js';
export declare class EditorResolverService extends Disposable implements IEditorResolverService {
    private readonly editorGroupService;
    private readonly instantiationService;
    private readonly configurationService;
    private readonly quickInputService;
    private readonly notificationService;
    private readonly telemetryService;
    private readonly storageService;
    private readonly extensionService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeEditorRegistrations;
    readonly onDidChangeEditorRegistrations: import("../../../workbench.web.main.internal.js").Event<void>;
    private static readonly configureDefaultID;
    private static readonly cacheStorageID;
    private static readonly conflictingDefaultsStorageID;
    private _editors;
    private _flattenedEditors;
    private _shouldReFlattenEditors;
    private cache;
    constructor(editorGroupService: IEditorGroupsService, instantiationService: IInstantiationService, configurationService: IConfigurationService, quickInputService: IQuickInputService, notificationService: INotificationService, telemetryService: ITelemetryService, storageService: IStorageService, extensionService: IExtensionService, logService: ILogService);
    private resolveUntypedInputAndGroup;
    resolveEditor(editor: IUntypedEditorInput, preferredGroup: PreferredGroup | undefined): Promise<ResolvedEditor>;
    private doResolveSideBySideEditor;
    bufferChangeEvents(callback: Function): void;
    registerEditor(globPattern: string | glob.IRelativePattern, editorInfo: RegisteredEditorInfo, options: RegisteredEditorOptions, editorFactoryObject: EditorInputFactoryObject): IDisposable;
    getAssociationsForResource(resource: URI): EditorAssociations;
    getAllUserAssociations(): EditorAssociations;
    /**
     * Given the nested nature of the editors map, we merge factories of the same glob and id to make it flat
     * and easier to work with
     */
    private _flattenEditorsMap;
    /**
     * Returns all editors as an array. Possible to contain duplicates
     */
    private get _registeredEditors();
    updateUserAssociations(globPattern: string, editorID: string): void;
    private findMatchingEditors;
    getEditors(resource?: URI): RegisteredEditorInfo[];
    /**
     * Given a resource and an editorId selects the best possible editor
     * @returns The editor and whether there was another default which conflicted with it
     */
    private getEditor;
    private doResolveEditor;
    /**
     * Moves the first existing editor for a resource to the target group unless already opened there.
     * Additionally will close any other editors that are open for that resource and viewtype besides the first one found
     * @param resource The resource of the editor
     * @param viewType the viewtype of the editor
     * @param targetGroup The group to move it to
     * @returns The moved editor input or `undefined` if the editor could not be moved
     */
    private moveExistingEditorForResource;
    /**
     * Given a resource and an editorId, returns all editors open for that resource and editorId.
     * @param resource The resource specified
     * @param editorId The editorID
     * @returns A list of editors
     */
    private findExistingEditorsForResource;
    private doHandleConflictingDefaults;
    private mapEditorsToQuickPickEntry;
    private doPickEditor;
    private sendEditorResolutionTelemetry;
    private cacheEditors;
    private resourceMatchesCache;
}
