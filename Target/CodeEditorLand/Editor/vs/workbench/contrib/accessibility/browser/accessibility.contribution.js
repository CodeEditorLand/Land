/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { DynamicSpeechAccessibilityConfiguration, registerAccessibilityConfiguration } from './accessibilityConfiguration.js';
import { Extensions as WorkbenchExtensions, registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { UnfocusedViewDimmingContribution } from './unfocusedViewDimmingContribution.js';
import { AccessibilityStatus } from './accessibilityStatus.js';
import { EditorAccessibilityHelpContribution } from './editorAccessibilityHelp.js';
import { SaveAccessibilitySignalContribution } from '../../accessibilitySignals/browser/saveAccessibilitySignal.js';
import { DiffEditorActiveAnnouncementContribution } from '../../accessibilitySignals/browser/openDiffEditorAnnouncement.js';
import { SpeechAccessibilitySignalContribution } from '../../speech/browser/speechAccessibilitySignal.js';
import { AccessibleViewInformationService, IAccessibleViewInformationService } from '../../../services/accessibility/common/accessibleViewInformationService.js';
import { IAccessibleViewService } from '../../../../platform/accessibility/browser/accessibleView.js';
import { AccessibleViewService } from './accessibleView.js';
import { AccesibleViewHelpContribution, AccesibleViewContributions } from './accessibleViewContributions.js';
import { ExtensionAccessibilityHelpDialogContribution } from './extensionAccesibilityHelp.contribution.js';
registerAccessibilityConfiguration();
registerSingleton(IAccessibleViewService, AccessibleViewService, 1 /* InstantiationType.Delayed */);
registerSingleton(IAccessibleViewInformationService, AccessibleViewInformationService, 1 /* InstantiationType.Delayed */);
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(EditorAccessibilityHelpContribution, 4 /* LifecyclePhase.Eventually */);
workbenchRegistry.registerWorkbenchContribution(UnfocusedViewDimmingContribution, 3 /* LifecyclePhase.Restored */);
workbenchRegistry.registerWorkbenchContribution(AccesibleViewHelpContribution, 4 /* LifecyclePhase.Eventually */);
workbenchRegistry.registerWorkbenchContribution(AccesibleViewContributions, 4 /* LifecyclePhase.Eventually */);
registerWorkbenchContribution2(AccessibilityStatus.ID, AccessibilityStatus, 2 /* WorkbenchPhase.BlockRestore */);
registerWorkbenchContribution2(ExtensionAccessibilityHelpDialogContribution.ID, ExtensionAccessibilityHelpDialogContribution, 2 /* WorkbenchPhase.BlockRestore */);
registerWorkbenchContribution2(SaveAccessibilitySignalContribution.ID, SaveAccessibilitySignalContribution, 3 /* WorkbenchPhase.AfterRestored */);
registerWorkbenchContribution2(SpeechAccessibilitySignalContribution.ID, SpeechAccessibilitySignalContribution, 3 /* WorkbenchPhase.AfterRestored */);
registerWorkbenchContribution2(DiffEditorActiveAnnouncementContribution.ID, DiffEditorActiveAnnouncementContribution, 3 /* WorkbenchPhase.AfterRestored */);
registerWorkbenchContribution2(DynamicSpeechAccessibilityConfiguration.ID, DynamicSpeechAccessibilityConfiguration, 3 /* WorkbenchPhase.AfterRestored */);
