/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { AccessibilitySignalService, IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { registerAction2 } from '../../../../platform/actions/common/actions.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { AccessibilitySignalLineDebuggerContribution } from './accessibilitySignalDebuggerContribution.js';
import { ShowAccessibilityAnnouncementHelp, ShowSignalSoundHelp } from './commands.js';
import { EditorTextPropertySignalsContribution } from './editorTextPropertySignalsContribution.js';
import { wrapInReloadableClass0 } from '../../../../platform/observable/common/wrapInReloadableClass.js';
registerSingleton(IAccessibilitySignalService, AccessibilitySignalService, 1 /* InstantiationType.Delayed */);
registerWorkbenchContribution2('EditorTextPropertySignalsContribution', wrapInReloadableClass0(() => EditorTextPropertySignalsContribution), 3 /* WorkbenchPhase.AfterRestored */);
registerWorkbenchContribution2('AccessibilitySignalLineDebuggerContribution', AccessibilitySignalLineDebuggerContribution, 3 /* WorkbenchPhase.AfterRestored */);
registerAction2(ShowSignalSoundHelp);
registerAction2(ShowAccessibilityAnnouncementHelp);
