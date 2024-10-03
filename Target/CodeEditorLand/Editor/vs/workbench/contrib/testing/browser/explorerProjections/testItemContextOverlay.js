import { capabilityContextKeys } from '../../common/testProfileService.js';
import { TestId } from '../../common/testId.js';
import { TestingContextKeys } from '../../common/testingContextKeys.js';
export const getTestItemContextOverlay = (test, capabilities) => {
    if (!test) {
        return [];
    }
    const testId = TestId.fromString(test.item.extId);
    return [
        [TestingContextKeys.testItemExtId.key, testId.localId],
        [TestingContextKeys.controllerId.key, test.controllerId],
        [TestingContextKeys.testItemHasUri.key, !!test.item.uri],
        ...capabilityContextKeys(capabilities),
    ];
};
