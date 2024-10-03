import { Disposable } from '../../../../base/common/lifecycle.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ResolvedKeybindingItem } from '../../../../platform/keybinding/common/resolvedKeybindingItem.js';
import { ITextFileService } from '../../textfile/common/textfiles.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
export declare const IKeybindingEditingService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IKeybindingEditingService>;
export interface IKeybindingEditingService {
    readonly _serviceBrand: undefined;
    addKeybinding(keybindingItem: ResolvedKeybindingItem, key: string, when: string | undefined): Promise<void>;
    editKeybinding(keybindingItem: ResolvedKeybindingItem, key: string, when: string | undefined): Promise<void>;
    removeKeybinding(keybindingItem: ResolvedKeybindingItem): Promise<void>;
    resetKeybinding(keybindingItem: ResolvedKeybindingItem): Promise<void>;
}
export declare class KeybindingsEditingService extends Disposable implements IKeybindingEditingService {
    private readonly textModelResolverService;
    private readonly textFileService;
    private readonly fileService;
    private readonly userDataProfileService;
    _serviceBrand: undefined;
    private queue;
    constructor(textModelResolverService: ITextModelService, textFileService: ITextFileService, fileService: IFileService, userDataProfileService: IUserDataProfileService);
    addKeybinding(keybindingItem: ResolvedKeybindingItem, key: string, when: string | undefined): Promise<void>;
    editKeybinding(keybindingItem: ResolvedKeybindingItem, key: string, when: string | undefined): Promise<void>;
    resetKeybinding(keybindingItem: ResolvedKeybindingItem): Promise<void>;
    removeKeybinding(keybindingItem: ResolvedKeybindingItem): Promise<void>;
    private doEditKeybinding;
    private doRemoveKeybinding;
    private doResetKeybinding;
    private save;
    private updateKeybinding;
    private removeUserKeybinding;
    private removeDefaultKeybinding;
    private removeUnassignedDefaultKeybinding;
    private findUserKeybindingEntryIndex;
    private findUnassignedDefaultKeybindingEntryIndex;
    private asObject;
    private areSame;
    private applyEditsToBuffer;
    private resolveModelReference;
    private resolveAndValidate;
    private parse;
    private getEmptyContent;
}
