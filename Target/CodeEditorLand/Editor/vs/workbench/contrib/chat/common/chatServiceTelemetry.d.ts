import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IChatUserActionEvent } from './chatService.js';
export declare class ChatServiceTelemetry {
    private readonly telemetryService;
    constructor(telemetryService: ITelemetryService);
    notifyUserAction(action: IChatUserActionEvent): void;
    retrievedFollowups(agentId: string, command: string | undefined, numFollowups: number): void;
}
