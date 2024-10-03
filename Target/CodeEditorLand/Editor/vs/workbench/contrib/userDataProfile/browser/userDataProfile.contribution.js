import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { UserDataProfilesWorkbenchContribution } from './userDataProfile.js';
import './userDataProfileActions.js';
registerWorkbenchContribution2(UserDataProfilesWorkbenchContribution.ID, UserDataProfilesWorkbenchContribution, 2);
