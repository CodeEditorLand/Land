var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Disposable, DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { isWeb } from '../../../../base/common/platform.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { CURRENT_PROFILE_CONTEXT, HAS_PROFILES_CONTEXT, IS_CURRENT_PROFILE_TRANSIENT_CONTEXT, IUserDataProfileManagementService, IUserDataProfileService, PROFILES_CATEGORY, PROFILES_ENABLEMENT_CONTEXT, PROFILES_TITLE, isProfileURL } from '../../../services/userDataProfile/common/userDataProfile.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { URI } from '../../../../base/common/uri.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkspaceTagsService } from '../../tags/common/workspaceTags.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { EditorPaneDescriptor } from '../../../browser/editor.js';
import { EditorExtensions } from '../../../common/editor.js';
import { UserDataProfilesEditor, UserDataProfilesEditorInput, UserDataProfilesEditorInputSerializer } from './userDataProfilesEditor.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IURLService } from '../../../../platform/url/common/url.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.js';
export const OpenProfileMenu = new MenuId('OpenProfile');
const ProfilesMenu = new MenuId('Profiles');
let UserDataProfilesWorkbenchContribution = class UserDataProfilesWorkbenchContribution extends Disposable {
    static { this.ID = 'workbench.contrib.userDataProfiles'; }
    constructor(userDataProfileService, userDataProfilesService, userDataProfileManagementService, telemetryService, workspaceContextService, workspaceTagsService, contextKeyService, editorGroupsService, instantiationService, lifecycleService, urlService, environmentService) {
        super();
        this.userDataProfileService = userDataProfileService;
        this.userDataProfilesService = userDataProfilesService;
        this.userDataProfileManagementService = userDataProfileManagementService;
        this.telemetryService = telemetryService;
        this.workspaceContextService = workspaceContextService;
        this.workspaceTagsService = workspaceTagsService;
        this.editorGroupsService = editorGroupsService;
        this.instantiationService = instantiationService;
        this.lifecycleService = lifecycleService;
        this.urlService = urlService;
        this.profilesDisposable = this._register(new MutableDisposable());
        this.currentProfileContext = CURRENT_PROFILE_CONTEXT.bindTo(contextKeyService);
        PROFILES_ENABLEMENT_CONTEXT.bindTo(contextKeyService).set(this.userDataProfilesService.isEnabled());
        this.isCurrentProfileTransientContext = IS_CURRENT_PROFILE_TRANSIENT_CONTEXT.bindTo(contextKeyService);
        this.currentProfileContext.set(this.userDataProfileService.currentProfile.id);
        this.isCurrentProfileTransientContext.set(!!this.userDataProfileService.currentProfile.isTransient);
        this._register(this.userDataProfileService.onDidChangeCurrentProfile(e => {
            this.currentProfileContext.set(this.userDataProfileService.currentProfile.id);
            this.isCurrentProfileTransientContext.set(!!this.userDataProfileService.currentProfile.isTransient);
        }));
        this.hasProfilesContext = HAS_PROFILES_CONTEXT.bindTo(contextKeyService);
        this.hasProfilesContext.set(this.userDataProfilesService.profiles.length > 1);
        this._register(this.userDataProfilesService.onDidChangeProfiles(e => this.hasProfilesContext.set(this.userDataProfilesService.profiles.length > 1)));
        this.registerEditor();
        this.registerActions();
        this._register(this.urlService.registerHandler(this));
        if (isWeb) {
            lifecycleService.when(4).then(() => userDataProfilesService.cleanUp());
        }
        this.reportWorkspaceProfileInfo();
        if (environmentService.options?.profileToPreview) {
            lifecycleService.when(3).then(() => this.handleURL(URI.revive(environmentService.options.profileToPreview)));
        }
    }
    async handleURL(uri) {
        if (isProfileURL(uri)) {
            const editor = await this.openProfilesEditor();
            if (editor) {
                editor.createNewProfile(uri);
                return true;
            }
        }
        return false;
    }
    async openProfilesEditor() {
        const editor = await this.editorGroupsService.activeGroup.openEditor(new UserDataProfilesEditorInput(this.instantiationService));
        return editor;
    }
    registerEditor() {
        Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(UserDataProfilesEditor, UserDataProfilesEditor.ID, localize('userdataprofilesEditor', "Profiles Editor")), [
            new SyncDescriptor(UserDataProfilesEditorInput)
        ]);
        Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(UserDataProfilesEditorInput.ID, UserDataProfilesEditorInputSerializer);
    }
    registerActions() {
        this.registerProfileSubMenu();
        this._register(this.registerManageProfilesAction());
        this._register(this.registerSwitchProfileAction());
        this.registerOpenProfileSubMenu();
        this.registerNewWindowWithProfileAction();
        this.registerProfilesActions();
        this._register(this.userDataProfilesService.onDidChangeProfiles(() => this.registerProfilesActions()));
        this._register(this.registerExportCurrentProfileAction());
        this.registerCreateFromCurrentProfileAction();
        this.registerNewProfileAction();
        this.registerDeleteProfileAction();
        this.registerHelpAction();
    }
    registerProfileSubMenu() {
        const getProfilesTitle = () => {
            return localize('profiles', "Profile ({0})", this.userDataProfileService.currentProfile.name);
        };
        MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
            get title() {
                return getProfilesTitle();
            },
            submenu: ProfilesMenu,
            group: '2_configuration',
            order: 1,
            when: HAS_PROFILES_CONTEXT
        });
        MenuRegistry.appendMenuItem(MenuId.MenubarPreferencesMenu, {
            get title() {
                return getProfilesTitle();
            },
            submenu: ProfilesMenu,
            group: '2_configuration',
            order: 1,
            when: HAS_PROFILES_CONTEXT
        });
    }
    registerOpenProfileSubMenu() {
        MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
            title: localize('New Profile Window', "New Window with Profile"),
            submenu: OpenProfileMenu,
            group: '1_new',
            order: 4,
        });
    }
    registerProfilesActions() {
        this.profilesDisposable.value = new DisposableStore();
        for (const profile of this.userDataProfilesService.profiles) {
            if (!profile.isTransient) {
                this.profilesDisposable.value.add(this.registerProfileEntryAction(profile));
                this.profilesDisposable.value.add(this.registerNewWindowAction(profile));
            }
        }
    }
    registerProfileEntryAction(profile) {
        const that = this;
        return registerAction2(class ProfileEntryAction extends Action2 {
            constructor() {
                super({
                    id: `workbench.profiles.actions.profileEntry.${profile.id}`,
                    title: profile.name,
                    toggled: ContextKeyExpr.equals(CURRENT_PROFILE_CONTEXT.key, profile.id),
                    menu: [
                        {
                            id: ProfilesMenu,
                            group: '0_profiles',
                            when: PROFILES_ENABLEMENT_CONTEXT,
                        }
                    ]
                });
            }
            async run(accessor) {
                if (that.userDataProfileService.currentProfile.id !== profile.id) {
                    return that.userDataProfileManagementService.switchProfile(profile);
                }
            }
        });
    }
    registerNewWindowWithProfileAction() {
        return registerAction2(class NewWindowWithProfileAction extends Action2 {
            constructor() {
                super({
                    id: `workbench.profiles.actions.newWindowWithProfile`,
                    title: localize2('newWindowWithProfile', "New Window with Profile..."),
                    category: PROFILES_CATEGORY,
                    precondition: HAS_PROFILES_CONTEXT,
                    f1: true,
                });
            }
            async run(accessor) {
                const quickInputService = accessor.get(IQuickInputService);
                const userDataProfilesService = accessor.get(IUserDataProfilesService);
                const hostService = accessor.get(IHostService);
                const pick = await quickInputService.pick(userDataProfilesService.profiles.map(profile => ({
                    label: profile.name,
                    profile
                })), {
                    title: localize('new window with profile', "New Window with Profile"),
                    placeHolder: localize('pick profile', "Select Profile"),
                    canPickMany: false
                });
                if (pick) {
                    return hostService.openWindow({ remoteAuthority: null, forceProfile: pick.profile.name });
                }
            }
        });
    }
    registerNewWindowAction(profile) {
        const disposables = new DisposableStore();
        const id = `workbench.action.openProfile.${profile.name.replace('/\s+/', '_')}`;
        disposables.add(registerAction2(class NewWindowAction extends Action2 {
            constructor() {
                super({
                    id,
                    title: localize2('openShort', "{0}", profile.name),
                    menu: {
                        id: OpenProfileMenu,
                        group: '0_profiles',
                        when: HAS_PROFILES_CONTEXT
                    }
                });
            }
            run(accessor) {
                const hostService = accessor.get(IHostService);
                return hostService.openWindow({ remoteAuthority: null, forceProfile: profile.name });
            }
        }));
        disposables.add(MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
            command: {
                id,
                category: PROFILES_CATEGORY,
                title: localize2('open', "Open {0} Profile", profile.name),
                precondition: HAS_PROFILES_CONTEXT
            },
        }));
        return disposables;
    }
    registerSwitchProfileAction() {
        const that = this;
        return registerAction2(class SwitchProfileAction extends Action2 {
            constructor() {
                super({
                    id: `workbench.profiles.actions.switchProfile`,
                    title: localize2('switchProfile', 'Switch Profile...'),
                    category: PROFILES_CATEGORY,
                    f1: true,
                    precondition: PROFILES_ENABLEMENT_CONTEXT,
                });
            }
            async run(accessor) {
                const quickInputService = accessor.get(IQuickInputService);
                const items = [];
                for (const profile of that.userDataProfilesService.profiles) {
                    items.push({
                        id: profile.id,
                        label: profile.id === that.userDataProfileService.currentProfile.id ? `$(check) ${profile.name}` : profile.name,
                        profile,
                    });
                }
                const result = await quickInputService.pick(items.sort((a, b) => a.profile.name.localeCompare(b.profile.name)), {
                    placeHolder: localize('selectProfile', "Select Profile")
                });
                if (result) {
                    await that.userDataProfileManagementService.switchProfile(result.profile);
                }
            }
        });
    }
    registerManageProfilesAction() {
        const disposables = new DisposableStore();
        disposables.add(registerAction2(class ManageProfilesAction extends Action2 {
            constructor() {
                super({
                    id: `workbench.profiles.actions.manageProfiles`,
                    title: {
                        ...localize2('manage profiles', "Profiles"),
                        mnemonicTitle: localize({ key: 'miOpenProfiles', comment: ['&& denotes a mnemonic'] }, "&&Profiles"),
                    },
                    menu: [
                        {
                            id: MenuId.GlobalActivity,
                            group: '2_configuration',
                            order: 1,
                            when: HAS_PROFILES_CONTEXT.negate()
                        },
                        {
                            id: MenuId.MenubarPreferencesMenu,
                            group: '2_configuration',
                            order: 1,
                            when: HAS_PROFILES_CONTEXT.negate()
                        },
                        {
                            id: ProfilesMenu,
                            group: '1_manage',
                            order: 1,
                        },
                    ]
                });
            }
            run(accessor) {
                const editorGroupsService = accessor.get(IEditorGroupsService);
                const instantiationService = accessor.get(IInstantiationService);
                return editorGroupsService.activeGroup.openEditor(new UserDataProfilesEditorInput(instantiationService));
            }
        }));
        disposables.add(MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
            command: {
                id: 'workbench.profiles.actions.manageProfiles',
                category: Categories.Preferences,
                title: localize2('open profiles', "Open Profiles (UI)"),
            },
        }));
        return disposables;
    }
    registerExportCurrentProfileAction() {
        const that = this;
        const disposables = new DisposableStore();
        const id = 'workbench.profiles.actions.exportProfile';
        disposables.add(registerAction2(class ExportProfileAction extends Action2 {
            constructor() {
                super({
                    id,
                    title: localize2('export profile', "Export Profile..."),
                    category: PROFILES_CATEGORY,
                    f1: true,
                });
            }
            async run() {
                const editor = await that.openProfilesEditor();
                editor?.selectProfile(that.userDataProfileService.currentProfile);
            }
        }));
        disposables.add(MenuRegistry.appendMenuItem(MenuId.MenubarShare, {
            command: {
                id,
                title: localize2('export profile in share', "Export Profile ({0})...", that.userDataProfileService.currentProfile.name),
                precondition: PROFILES_ENABLEMENT_CONTEXT,
            },
        }));
        return disposables;
    }
    registerCreateFromCurrentProfileAction() {
        const that = this;
        this._register(registerAction2(class CreateFromCurrentProfileAction extends Action2 {
            constructor() {
                super({
                    id: 'workbench.profiles.actions.createFromCurrentProfile',
                    title: localize2('save profile as', "Save Current Profile As..."),
                    category: PROFILES_CATEGORY,
                    f1: true,
                    precondition: PROFILES_ENABLEMENT_CONTEXT
                });
            }
            async run() {
                const editor = await that.openProfilesEditor();
                editor?.createNewProfile(that.userDataProfileService.currentProfile);
            }
        }));
    }
    registerNewProfileAction() {
        const that = this;
        this._register(registerAction2(class CreateProfileAction extends Action2 {
            constructor() {
                super({
                    id: 'workbench.profiles.actions.createProfile',
                    title: localize2('create profile', "New Profile..."),
                    category: PROFILES_CATEGORY,
                    precondition: PROFILES_ENABLEMENT_CONTEXT,
                    f1: true,
                    menu: [
                        {
                            id: OpenProfileMenu,
                            group: '1_manage_profiles',
                            order: 1
                        }
                    ]
                });
            }
            async run(accessor) {
                const editor = await that.openProfilesEditor();
                return editor?.createNewProfile();
            }
        }));
    }
    registerDeleteProfileAction() {
        this._register(registerAction2(class DeleteProfileAction extends Action2 {
            constructor() {
                super({
                    id: 'workbench.profiles.actions.deleteProfile',
                    title: localize2('delete profile', "Delete Profile..."),
                    category: PROFILES_CATEGORY,
                    f1: true,
                    precondition: ContextKeyExpr.and(PROFILES_ENABLEMENT_CONTEXT, HAS_PROFILES_CONTEXT),
                });
            }
            async run(accessor) {
                const quickInputService = accessor.get(IQuickInputService);
                const userDataProfileService = accessor.get(IUserDataProfileService);
                const userDataProfilesService = accessor.get(IUserDataProfilesService);
                const userDataProfileManagementService = accessor.get(IUserDataProfileManagementService);
                const notificationService = accessor.get(INotificationService);
                const profiles = userDataProfilesService.profiles.filter(p => !p.isDefault && !p.isTransient);
                if (profiles.length) {
                    const picks = await quickInputService.pick(profiles.map(profile => ({
                        label: profile.name,
                        description: profile.id === userDataProfileService.currentProfile.id ? localize('current', "Current") : undefined,
                        profile
                    })), {
                        title: localize('delete specific profile', "Delete Profile..."),
                        placeHolder: localize('pick profile to delete', "Select Profiles to Delete"),
                        canPickMany: true
                    });
                    if (picks) {
                        try {
                            await Promise.all(picks.map(pick => userDataProfileManagementService.removeProfile(pick.profile)));
                        }
                        catch (error) {
                            notificationService.error(error);
                        }
                    }
                }
            }
        }));
    }
    registerHelpAction() {
        this._register(registerAction2(class HelpAction extends Action2 {
            constructor() {
                super({
                    id: 'workbench.profiles.actions.help',
                    title: PROFILES_TITLE,
                    category: Categories.Help,
                    menu: [{
                            id: MenuId.CommandPalette,
                        }],
                });
            }
            run(accessor) {
                return accessor.get(IOpenerService).open(URI.parse('https://aka.ms/vscode-profiles-help'));
            }
        }));
    }
    async reportWorkspaceProfileInfo() {
        await this.lifecycleService.when(4);
        if (this.userDataProfilesService.profiles.length > 1) {
            this.telemetryService.publicLog2('profiles:count', { count: this.userDataProfilesService.profiles.length - 1 });
        }
        const workspaceId = await this.workspaceTagsService.getTelemetryWorkspaceId(this.workspaceContextService.getWorkspace(), this.workspaceContextService.getWorkbenchState());
        this.telemetryService.publicLog2('workspaceProfileInfo', {
            workspaceId,
            defaultProfile: this.userDataProfileService.currentProfile.isDefault
        });
    }
};
UserDataProfilesWorkbenchContribution = __decorate([
    __param(0, IUserDataProfileService),
    __param(1, IUserDataProfilesService),
    __param(2, IUserDataProfileManagementService),
    __param(3, ITelemetryService),
    __param(4, IWorkspaceContextService),
    __param(5, IWorkspaceTagsService),
    __param(6, IContextKeyService),
    __param(7, IEditorGroupsService),
    __param(8, IInstantiationService),
    __param(9, ILifecycleService),
    __param(10, IURLService),
    __param(11, IBrowserWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], UserDataProfilesWorkbenchContribution);
export { UserDataProfilesWorkbenchContribution };
