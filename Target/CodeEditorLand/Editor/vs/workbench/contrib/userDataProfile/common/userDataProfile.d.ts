import { URI } from '../../../../base/common/uri.js';
import { IUserDataProfile } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IEditorPane } from '../../../common/editor.js';
export interface IUserDataProfilesEditor extends IEditorPane {
    createNewProfile(copyFrom?: URI | IUserDataProfile): Promise<void>;
    selectProfile(profile: IUserDataProfile): void;
}
