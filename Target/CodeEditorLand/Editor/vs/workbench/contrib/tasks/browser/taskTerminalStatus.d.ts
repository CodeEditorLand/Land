import { Disposable } from '../../../../base/common/lifecycle.js';
import { AbstractProblemCollector } from '../common/problemCollectors.js';
import { ITaskService, Task } from '../common/taskService.js';
import { ITerminalInstance } from '../../terminal/browser/terminal.js';
import { IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { ITerminalStatus } from '../../terminal/common/terminal.js';
export declare const ACTIVE_TASK_STATUS: ITerminalStatus;
export declare const SUCCEEDED_TASK_STATUS: ITerminalStatus;
export declare const FAILED_TASK_STATUS: ITerminalStatus;
export declare class TaskTerminalStatus extends Disposable {
    private readonly _accessibilitySignalService;
    private terminalMap;
    private _marker;
    constructor(taskService: ITaskService, _accessibilitySignalService: IAccessibilitySignalService);
    addTerminal(task: Task, terminal: ITerminalInstance, problemMatcher: AbstractProblemCollector): void;
    private terminalFromEvent;
    private eventEnd;
    private eventInactive;
    private eventActive;
}
