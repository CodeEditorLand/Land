import { TestId } from '../../common/testId.js';
export interface ISerializedTestTreeCollapseState {
    collapsed?: boolean;
    children?: {
        [localId: string]: ISerializedTestTreeCollapseState;
    };
}
export declare function isCollapsedInSerializedTestTree(serialized: ISerializedTestTreeCollapseState, id: TestId | string): boolean | undefined;
