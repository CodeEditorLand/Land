import { IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
export interface ITaskEntry extends IQuickPickItem {
    sort?: string;
    autoDetect: boolean;
    content: string;
}
export declare function getTemplates(): ITaskEntry[];
