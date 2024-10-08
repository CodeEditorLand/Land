import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { GettingStartedPage, inWelcomeContext } from './gettingStarted.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWalkthroughsService } from './gettingStartedService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { GettingStartedInput } from './gettingStartedInput.js';
import { localize } from '../../../../nls.js';
export class GettingStartedAccessibleView {
    constructor() {
        this.type = "view" /* AccessibleViewType.View */;
        this.priority = 110;
        this.name = 'walkthroughs';
        this.when = inWelcomeContext;
        this.getProvider = (accessor) => {
            const editorService = accessor.get(IEditorService);
            const editorPane = editorService.activeEditorPane;
            if (!(editorPane instanceof GettingStartedPage)) {
                return;
            }
            const gettingStartedInput = editorPane.input;
            if (!(gettingStartedInput instanceof GettingStartedInput) || !gettingStartedInput.selectedCategory) {
                return;
            }
            const gettingStartedService = accessor.get(IWalkthroughsService);
            const currentWalkthrough = gettingStartedService.getWalkthrough(gettingStartedInput.selectedCategory);
            const currentStepIds = gettingStartedInput.selectedStep;
            if (currentWalkthrough) {
                return new GettingStartedAccessibleProvider(accessor.get(IContextKeyService), editorPane, currentWalkthrough, currentStepIds);
            }
            return;
        };
    }
}
class GettingStartedAccessibleProvider extends Disposable {
    constructor(contextService, _gettingStartedPage, _focusedItem, _focusedStep) {
        super();
        this.contextService = contextService;
        this._gettingStartedPage = _gettingStartedPage;
        this._focusedItem = _focusedItem;
        this._focusedStep = _focusedStep;
        this._currentStepIndex = 0;
        this._activeWalkthroughSteps = [];
        this.id = "walkthrough" /* AccessibleViewProviderId.Walkthrough */;
        this.verbositySettingKey = "accessibility.verbosity.walkthrough" /* AccessibilityVerbositySettingId.Walkthrough */;
        this.options = { type: "view" /* AccessibleViewType.View */ };
        this._activeWalkthroughSteps = _focusedItem.steps.filter(step => !step.when || this.contextService.contextMatchesRules(step.when));
    }
    provideContent() {
        if (this._focusedStep) {
            const stepIndex = this._activeWalkthroughSteps.findIndex(step => step.id === this._focusedStep);
            if (stepIndex !== -1) {
                this._currentStepIndex = stepIndex;
            }
        }
        return this._getContent(this._currentStepIndex + 1, this._focusedItem, this._activeWalkthroughSteps[this._currentStepIndex]);
    }
    _getContent(index, waltkrough, step) {
        const stepsContent = localize('gettingStarted.step', 'Step {0}: {1}\nDescription: {2}', index, step.title, step.description.join(' '));
        return [
            localize('gettingStarted.title', 'Title: {0}', waltkrough.title),
            localize('gettingStarted.description', 'Description: {0}', waltkrough.description),
            stepsContent
        ].join('\n\n');
    }
    provideNextContent() {
        if (++this._currentStepIndex >= this._activeWalkthroughSteps.length) {
            --this._currentStepIndex;
            return;
        }
        return this._getContent(this._currentStepIndex + 1, this._focusedItem, this._activeWalkthroughSteps[this._currentStepIndex]);
    }
    providePreviousContent() {
        if (--this._currentStepIndex < 0) {
            ++this._currentStepIndex;
            return;
        }
        return this._getContent(this._currentStepIndex + 1, this._focusedItem, this._activeWalkthroughSteps[this._currentStepIndex]);
    }
    onClose() {
        if (this._currentStepIndex > -1) {
            const currentStep = this._activeWalkthroughSteps[this._currentStepIndex];
            this._gettingStartedPage.makeCategoryVisibleWhenAvailable(this._focusedItem.id, currentStep.id);
        }
    }
}
