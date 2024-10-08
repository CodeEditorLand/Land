import { TestId } from '../../common/testId.js';
export interface ISerializedTestTreeCollapseState {
    collapsed?: boolean;
    children?: {
        [localId: string]: ISerializedTestTreeCollapseState;
    };
}
/**
 * Gets whether the given test ID is collapsed.
 */
export declare function isCollapsedInSerializedTestTree(serialized: ISerializedTestTreeCollapseState, id: TestId | string): boolean | undefined;
